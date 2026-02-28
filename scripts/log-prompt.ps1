Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# 預設等級先初始化，避免 catch 區塊讀取未定義變數。
$configuredLogLevel = "INFO"

# 正規化等級字串，只接受 OFF/ERROR/WARN/INFO/DEBUG，其他值回退 INFO。
function Normalize-LogLevel {
	param([Parameter(Mandatory = $false)][string]$Value)

	if ([string]::IsNullOrWhiteSpace($Value)) {
		return "INFO"
	}

	$normalized = $Value.Trim().ToUpperInvariant()
	if ($normalized -in @("OFF", "ERROR", "WARN", "INFO", "DEBUG")) {
		return $normalized
	}

	return "INFO"
}

# 將等級轉成可比較的數值，數字越大代表記錄越詳細。
function Get-LogLevelRank {
	param([Parameter(Mandatory = $true)][string]$Level)

	switch ($Level) {
		"ERROR" { return 1 }
		"WARN" { return 2 }
		"INFO" { return 3 }
		"DEBUG" { return 4 }
		"OFF" { return 0 }
		default { return 3 }
	}
}

# 依「設定門檻」與「事件等級」決定是否落地此筆紀錄。
function Should-WriteLog {
	param(
		[Parameter(Mandatory = $true)][string]$ConfiguredLevel,
		[Parameter(Mandatory = $true)][string]$EntryLevel
	)

	$configuredRank = Get-LogLevelRank -Level $ConfiguredLevel
	if ($configuredRank -eq 0) {
		return $false
	}

	$entryRank = Get-LogLevelRank -Level $EntryLevel
	return $configuredRank -ge $entryRank
}

# 從候選欄位中取第一個可用字串值，兼容不同 hook payload 命名。
function Get-FirstValue {
	param(
		[Parameter(Mandatory = $false)]$InputObject,
		[Parameter(Mandatory = $true)][string[]]$CandidateKeys
	)

	if ($null -eq $InputObject) {
		return $null
	}

	foreach ($key in $CandidateKeys) {
		if ($InputObject.PSObject.Properties.Name -contains $key) {
			$value = $InputObject.$key
			if ($null -ne $value -and -not [string]::IsNullOrWhiteSpace([string]$value)) {
				return [string]$value
			}
		}
	}

	return $null
}

# 以 SHA-256 產生 prompt 指紋，便於追蹤但不一定要落地完整內容。
function Get-StringHash {
	param([Parameter(Mandatory = $true)][string]$Value)

	$sha = [System.Security.Cryptography.SHA256]::Create()
	try {
		$bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
		$hash = $sha.ComputeHash($bytes)
		return [System.BitConverter]::ToString($hash).Replace("-", "").ToLowerInvariant()
	}
	finally {
		$sha.Dispose()
	}
}

try {
	# 日誌目錄可由 LOG_DIR 覆蓋，舊版 COPILOT_HOOK_LOG_DIR 仍可回退支援。
	$scriptDir = Split-Path -Parent $PSCommandPath
	$defaultLogDir = Join-Path $scriptDir "..\logs"
	$logDir = if ($env:LOG_DIR) { $env:LOG_DIR } elseif ($env:COPILOT_HOOK_LOG_DIR) { $env:COPILOT_HOOK_LOG_DIR } else { $defaultLogDir }
	$logFile = Join-Path $logDir "prompt_logs.jsonl"

	if (-not (Test-Path -Path $logDir)) {
		New-Item -Path $logDir -ItemType Directory -Force | Out-Null
	}

	# Copilot hook payload 由 stdin 傳入，預期為 JSON。
	$stdinRaw = [Console]::In.ReadToEnd()
	$payload = $null
	$payloadParseError = $false

	if (-not [string]::IsNullOrWhiteSpace($stdinRaw)) {
		try {
			$payload = $stdinRaw | ConvertFrom-Json -Depth 100
		}
		catch {
			$payloadParseError = $true
		}
	}

	# 可透過 env 控制記錄等級與敏感資料是否落地。
	$configuredLogLevel = Normalize-LogLevel -Value $env:LOG_LEVEL
	$includePromptContent = $env:LOG_INCLUDE_PROMPT_CONTENT -eq "true"
	$includeRawPayload = $env:LOG_INCLUDE_RAW_PAYLOAD -eq "true"

	# 兼容不同事件欄位名稱，找不到時回退為 userPromptSubmitted。
	$eventName = Get-FirstValue -InputObject $payload -CandidateKeys @("eventName", "event", "type")
	if (-not $eventName) {
		$eventName = "userPromptSubmitted"
	}

	# 優先使用 payload 的 workspace，否則回退到環境或當前目錄。
	$workspacePath = Get-FirstValue -InputObject $payload -CandidateKeys @("workspacePath", "workspace", "cwd")
	if (-not $workspacePath) {
		$workspacePath = if ($env:GITHUB_WORKSPACE) { $env:GITHUB_WORKSPACE } else { (Get-Location).Path }
	}

	# 嘗試多種欄位取出 prompt，避免不同版本 payload 造成漏記。
	$promptText = Get-FirstValue -InputObject $payload -CandidateKeys @("prompt", "userPrompt", "message", "text")
	if (-not $promptText -and $null -ne $payload) {
		$promptText = Get-FirstValue -InputObject $payload.message -CandidateKeys @("text", "content")
	}
	if (-not $promptText) {
		$promptText = if ($env:COPILOT_USER_PROMPT) { $env:COPILOT_USER_PROMPT } else { "" }
	}

	$sessionId = Get-FirstValue -InputObject $payload -CandidateKeys @("sessionId", "conversationId", "chatId")
	$requestId = Get-FirstValue -InputObject $payload -CandidateKeys @("requestId", "id")

	# 只記錄長度、雜湊與預覽，可在隱私與追蹤間取得平衡。
	$promptLength = $promptText.Length
	$promptHash = if ($promptLength -gt 0) { Get-StringHash -Value $promptText } else { $null }
	$promptPreview = if ($promptLength -gt 200) { $promptText.Substring(0, 200) } else { $promptText }
	# payload 解析失敗視為 WARN，一般事件視為 INFO。
	$entryLevel = if ($payloadParseError) { "WARN" } else { "INFO" }

	$record = [ordered]@{
		timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
		level = $entryLevel
		event = $eventName
		user = $env:USERNAME
		machine = $env:COMPUTERNAME
		processId = $PID
		workspace = $workspacePath
		script = $PSCommandPath
		sessionId = $sessionId
		requestId = $requestId
		promptLength = $promptLength
		promptHash = $promptHash
		promptPreview = $promptPreview
	}

	# 需要完整稽核時才開啟完整 prompt 記錄。
	if ($includePromptContent) {
		$record.prompt = $promptText
	}

	# 需要除錯 payload 結構時才開啟 raw payload 記錄。
	if ($includeRawPayload) {
		$record.rawPayload = $stdinRaw
	}

    # DEBUG 等級才附加診斷資訊，避免平時日誌過重。
	if ($configuredLogLevel -eq "DEBUG") {
		$record.debug = [ordered]@{
			stdinLength = $stdinRaw.Length
			includePromptContent = $includePromptContent
			includeRawPayload = $includeRawPayload
			hasPayload = $null -ne $payload
		}
	}

	# 以 JSONL 格式寫入，一行一筆，方便後續用 jq/PowerShell 查詢。
	# 只有達到門檻的事件才寫入。
	if (Should-WriteLog -ConfiguredLevel $configuredLogLevel -EntryLevel $entryLevel) {
		$jsonLine = $record | ConvertTo-Json -Compress -Depth 100
		Add-Content -Path $logFile -Value $jsonLine -Encoding utf8
	}
}
catch {
	# 避免 hook 因記錄失敗中斷；僅在門檻允許時落地 ERROR 紀錄。
	if (Should-WriteLog -ConfiguredLevel $configuredLogLevel -EntryLevel "ERROR") {
		$errorRecord = [ordered]@{
			timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
			level = "ERROR"
			event = "logFailure"
			error = $_.Exception.Message
			script = $PSCommandPath
			processId = $PID
		}

		try {
			$scriptDir = Split-Path -Parent $PSCommandPath
			$defaultLogDir = Join-Path $scriptDir "..\logs"
			$logDir = if ($env:LOG_DIR) { $env:LOG_DIR } elseif ($env:COPILOT_HOOK_LOG_DIR) { $env:COPILOT_HOOK_LOG_DIR } else { $defaultLogDir }
			if (-not (Test-Path -Path $logDir)) {
				New-Item -Path $logDir -ItemType Directory -Force | Out-Null
			}
			$errorLogFile = Join-Path $logDir "prompt_logs.jsonl"
			$errorLine = $errorRecord | ConvertTo-Json -Compress -Depth 100
			Add-Content -Path $errorLogFile -Value $errorLine -Encoding utf8
		}
		catch {
			# 最後保底：不要再拋出額外例外，維持 hook 穩定。
		}
	}
}

exit 0
