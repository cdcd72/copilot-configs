# Copilot 設定

本儲存庫用於集中管理 GitHub Copilot 的自訂設定，包含 agents、instructions、prompts 與 skills。

## 目前結構

```text
.
├─ .agents/
│  └─ skills/
│     ├─ find-skills/SKILL.md
│     ├─ svelte-code-writer/SKILL.md
│     └─ web-design-guidelines/SKILL.md
├─ .github/
│  ├─ agents/
│  │  ├─ chrome-extension-experts.agent.md
│  │  ├─ code-review.agent.md
│  │  └─ svelte-file-editor.agent.md
│  ├─ hooks/
│  │  └─ hooks.json
│  ├─ instructions/
│  │  └─ svelte.instructions.md
│  ├─ prompts/
│  │  ├─ create-controller-base-on-ef-core.prompt.md
│  │  ├─ dotnet-api-init.prompt.md
│  │  ├─ ef-core-dbcontext-init.prompt.md
│  │  └─ gitignore.prompt.md
│  └─ workflows/
│     └─ copilot-setup-steps.yml
├─ scripts/
│  └─ log-prompt.ps1
├─ skills-lock.json
├─ README.md
└─ LICENSE
```

## 目錄與檔案說明

- `.github/agents/`：自訂 agent 定義。
  - `chrome-extension-experts.agent.md`：Chrome Extension 開發專家代理，提供 V3 架構、權限策略與常見除錯指引。
  - `code-review.agent.md`：通用程式碼審查代理，聚焦安全性、效能、架構與測試品質。
  - `svelte-file-editor.agent.md`：Svelte 5 編輯/檢查代理，要求搭配 Svelte MCP 文件與 autofixer 驗證。

- `.github/instructions/`：跨任務共用實作規範。
  - `svelte.instructions.md`：Svelte/SvelteKit 開發準則（runes、load 類型、效能、驗證流程等）。

- `.github/hooks/`：GitHub Copilot Hooks 設定。
  - `hooks.json`：目前註冊 `userPromptSubmitted` 事件，執行 `scripts/log-prompt.ps1` 進行提示記錄。

- `.github/prompts/`：可重用 prompt 範本。
  - `create-controller-base-on-ef-core.prompt.md`：依 EF Core 實體快速產生 Controller。
  - `dotnet-api-init.prompt.md`：初始化 .NET API 專案的標準設定流程。
  - `ef-core-dbcontext-init.prompt.md`：初始化 EF Core `DbContext` 與相關設定。
  - `gitignore.prompt.md`：協助建立/調整 `.gitignore` 規則。

- `.github/workflows/`：GitHub Actions 工作流程。
  - `copilot-setup-steps.yml`：定義 Copilot agent 啟動前的環境準備步驟（含字型安裝）。

- `scripts/`：本機腳本。
  - `log-prompt.ps1`：接收 hook payload，寫入 `logs/prompt_logs.jsonl`，支援等級門檻與敏感欄位開關。

- `.agents/skills/`：Agent Skills 定義（由 Copilot 在對應情境自動載入）。
  - `find-skills/SKILL.md`：協助搜尋、挑選與安裝可用 skills（`npx skills find/add/check/update`）。
  - `svelte-code-writer/SKILL.md`：透過 `@sveltejs/mcp` CLI 進行 Svelte 文件查詢與程式碼問題檢查。
  - `web-design-guidelines/SKILL.md`：依 Web Interface Guidelines 對 UI/UX 做規範檢查。

- 根目錄檔案：
  - `skills-lock.json`：鎖定 skills 來源與 hash，確保技能版本一致。
  - `README.md`：本儲存庫導覽與維護說明。
  - `LICENSE`：授權條款。

## Hook 提示記錄設定

目前 `userPromptSubmitted` 事件使用 `scripts/log-prompt.ps1`，可透過 `.github/hooks/hooks.json` 的 `env` 控制：

- `LOG_LEVEL`：記錄門檻，支援 `OFF`、`ERROR`、`WARN`、`INFO`、`DEBUG`。
- `LOG_DIR`：日誌輸出目錄（預設為 `logs`）。
- `LOG_INCLUDE_PROMPT_CONTENT`：`true/false`，是否寫入完整 `prompt`。
- `LOG_INCLUDE_RAW_PAYLOAD`：`true/false`，是否寫入 `rawPayload`。

預設輸出檔案為 `logs/prompt_logs.jsonl`，每行一筆 JSON，常見欄位包含：

- `timestampUtc`
- `level`
- `event`
- `user`
- `workspace`
- `promptLength`
- `promptHash`
- `promptPreview`

在 `LOG_LEVEL=DEBUG` 時，會額外包含 `debug` 診斷欄位。

> :fire: 建議將 `logs/` 加入 `.gitignore`，避免將提示記錄（可能含敏感內容）提交到版本庫。

## 快速上手

1. 將專用代理放在 `.github/agents/`。
2. 將鉤子設定放在 `.github/hooks/hooks.json`。
3. 將可重用規範放在 `.github/instructions/`。
4. 將可重用提示放在 `.github/prompts/`。
5. 以 `skills-lock.json` 管理 skills 來源；新增 skill 後同步更新 lock 檔。

## 維護建議

- 新增/調整 agent、hook、instruction、prompt、skill 後，同步更新本 README 的「目前結構」與說明。
- 保持 `.github/instructions/*.md` 的 `applyTo` 範圍精準，避免規則誤套用。

## 貢獻

- 歡迎透過 Issue 與 PR 提出改進或問題回報。
