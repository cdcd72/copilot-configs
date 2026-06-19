# Copilot 設定

本儲存庫用於集中管理 GitHub Copilot 的自訂設定，包含 agents、instructions、prompts 與 skills。

## 目前結構

```text
.
├─ .agents/
│  └─ skills/
│     ├─ commit/SKILL.md
│     ├─ commit-push/SKILL.md
│     ├─ commit-push-pr/SKILL.md
│     ├─ doc-coauthoring/SKILL.md
│     ├─ find-skills/SKILL.md
│     ├─ review/SKILL.md
│     └─ test/SKILL.md
├─ .github/
│  ├─ agents/
│  │  └─ code-review.agent.md
│  ├─ copilot-instructions.md
│  ├─ hooks/
│  │  ├─ scripts/
│  │  │  ├─ block-dangerous.mjs
│  │  │  ├─ format-lint.mjs
│  │  │  ├─ git-auto-commit.mjs
│  │  │  └─ log-prompt.mjs
│  │  └─ hooks.json
│  ├─ instructions/
│  │  └─ (None yet)
│  ├─ prompts/
│  │  └─ gitignore.prompt.md
│  └─ workflows/
│     └─ copilot-setup-steps.yml
├─ skills-lock.json
├─ README.md
└─ LICENSE
```

## 目錄與檔案說明

- `.github/agents/`：自訂 agent 定義。
  - `code-review.agent.md`：通用程式碼審查代理，聚焦安全性、效能、架構與測試品質。

- `.github/copilot-instructions.md`：儲存庫層級的 Copilot 指示，現階段主要規範 Windows + PowerShell 的工具使用慣例。

- `.github/instructions/`：跨任務共用實作規範。
  - `(None yet)`：目前尚無共用實作規範。

- `.github/hooks/`：GitHub Copilot Hooks 設定。
  - `scripts/`：掛鉤腳本。
    - `block-dangerous.mjs`：在 shell 工具執行前檢查高風險命令，必要時回傳 deny 給 Copilot。
    - `format-lint.mjs`：在檔案建立/修改成功後，嘗試對受影響檔案執行 Prettier 與 ESLint 修正。
    - `git-auto-commit.mjs`：在編輯前建立 checkpoint commit，並在 agent stop 後自動提交本次工作結果。
    - `log-prompt.mjs`：跨平台接收 hook payload，寫入 `logs/prompt_logs.jsonl`。
  - `hooks.json`：目前註冊 `preToolUse`、`postToolUse`、`agentStop` 與 `userPromptSubmitted`，分別提供危險指令攔截、寫檔前 checkpoint、寫檔後格式化/修正、結束時自動提交，以及提示記錄。

- `.github/prompts/`：可重用 prompt 範本。
  - `gitignore.prompt.md`：協助建立/調整 `.gitignore` 規則。

- `.github/workflows/`：GitHub Actions 工作流程。
  - `copilot-setup-steps.yml`：定義 Copilot agent 啟動前的環境準備步驟（含字型安裝）。

- `.agents/skills/`：Agent Skills 定義（由 Copilot 在對應情境自動載入）。
  - `commit/SKILL.md`：依目前工作區變更建立一次符合 Conventional Commits 的提交。
  - `commit-push/SKILL.md`：依目前工作區變更建立提交並推送到遠端。
  - `commit-push-pr/SKILL.md`：依目前工作區變更建立提交、推送並建立 Pull Request。
  - `doc-coauthoring/SKILL.md`：協助撰寫與共同編輯文件、提案、技術規格與決策文件。
  - `find-skills/SKILL.md`：協助搜尋、挑選與安裝可用 skills（`npx skills find/add/check/update`）。
  - `review/SKILL.md`：對目前工作目錄中的變更做嚴格技術審查，優先指出 bug、風險、回歸與測試缺口。
  - `test/SKILL.md`：執行現有測試、分析失敗原因，並在必要時補充關鍵測試以驗證程式碼正確性。

- 根目錄檔案：
  - `skills-lock.json`：鎖定 skills 來源與 hash，確保技能版本一致。
  - `README.md`：本儲存庫導覽與維護說明。
  - `LICENSE`：授權條款。

## Hook 提示記錄設定

目前 `userPromptSubmitted` 事件使用 `.github/hooks/scripts/log-prompt.mjs`，可透過 `.github/hooks/hooks.json` 的 `env` 控制：

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
3. 將儲存庫層級規範放在 `.github/copilot-instructions.md`。
4. 將可重用規範放在 `.github/instructions/`。
5. 將可重用提示放在 `.github/prompts/`。
6. 以 `skills-lock.json` 管理 skills 來源；新增 skill 後同步更新 lock 檔。

## 維護建議

- 新增/調整 agent、hook、instruction、prompt、skill 或 repo-level copilot 指示後，同步更新本 README 的「目前結構」與說明。
- 保持 `.github/instructions/*.md` 的 `applyTo` 範圍精準，避免規則誤套用。

## 貢獻

- 歡迎透過 Issue 與 PR 提出改進或問題回報。
