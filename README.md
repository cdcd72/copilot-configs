# Copilot 設定

本儲存庫用於放置與 Copilot 自動化開發相關的設定、範例與輔助檔案。下列為專案根目錄中主要的檔案與資料夾說明：

- `.github/`：GitHub 專案維護相關設定。此資料夾通常包含：
  - `agents/`：自訂代理配置檔（例如 code-review 代理提供全面的程式碼審查指導）。
  - `instructions/`：專案或 agent 的指示檔（例如 Copilot 的自訂指令或運作說明、SvelteKit 編碼指南等）。
  - `prompts/`：可重用的 prompt 範本或示例（例如 .NET API 控制器建立、EF Core DbContext 初始化、.gitignore 產生等），供自動化或 AI 助手使用。
  - 其他常見子項目：`workflows/`（GitHub Actions）、`ISSUE_TEMPLATE/`（Issue 範本）、`PULL_REQUEST_TEMPLATE.md`（PR 範本）等。

## 快速上手

- 將可重用的提示（prompts）或操作指示（instructions）放入 `.github/prompts/` 或 `.github/instructions/`，這些檔案會被 agent 或自動化流程讀取並可供執行或參考（例如 Copilot 或專案的自動化 agent）。

## 未來計劃

- 持續更新與優化指示與提示，確保它們能夠有效地支持 Copilot 的自動化開發需求。
- 可能也會新增其他相關的設定或工具（ex. Google Antigravity 設定...等等），以提升專案的自動化能力與開發效率。

## 貢獻

- 歡迎透過 Issue 與 PR 提出改進或問題回報。

## 聯絡／問題回報

- 請建立 Issue 或直接發 PR 提交修正。
