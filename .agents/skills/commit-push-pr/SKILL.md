---
name: commit-push-pr
description: 根據目前工作區的實際變更，完成一次符合 Conventional Commits 的 Git 提交、推送與 Pull Request 建立；適用於要交付完整分支變更的情境。
---

# Commit Push PR

## 目的

根據目前工作區的實際變更，完成一次符合 Conventional Commits 的 Git 提交，推送到遠端倉庫，並建立 Pull Request。

## 適用時機

- 需要一次完成提交、推送與 PR 建立
- 需要根據實際 diff 產出 PR 標題與描述

## 流程

1. 檢查目前分支與變更。

   ```pwsh
   git branch --show-current
   git status -s
   git diff HEAD
   ```

2. 根據實際 diff 判斷分支類型、分支名稱與 commit message；若沒有實際變更，停止，不要建立空提交。
3. 如果目前在 `main` 分支，先建立新分支。

   ```pwsh
   git checkout -b <type>/<description>
   ```

4. 暫存並確認提交內容。

   ```pwsh
   git add .
   git status -s
   git diff --cached
   ```

5. 建立單一提交。

   ```pwsh
   git commit -m "<type>(<scope>): <description>"
   ```

6. 推送目前分支到遠端。

   ```pwsh
   git branch --show-current
   git push -u origin <current-branch>
   ```

7. 根據實際 diff 與 commit 內容撰寫 Pull Request title 與 description。
8. 建立 Pull Request。

   ```pwsh
   gh pr create --base main --title "<title>" --body "<description>"
   ```

## Pull Request 規範

### Title

- 使用與提交訊息相同的 `<type>(<scope>): <description>` 格式
- 必須根據實際 diff 撰寫

### Description

- 使用繁體中文
- 根據實際 diff 撰寫
- 使用具體且明確的項目清單描述實際變更，並適當分組
- 不要遺漏相關變更，也不要編造 diff 中不存在的內容
- 只保留有實際內容的章節

```markdown
## 變更內容

- ...

## 變更目的

- ...

## 測試項目

- ...

## 注意事項

- ...
```

## 限制

- 只建立一個 commit
- 不要 amend
- 不要提交 secrets、`.env`、建置產物、暫存檔或無關檔案