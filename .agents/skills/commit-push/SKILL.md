---
name: commit-push
description: 根據目前工作區的實際變更，完成一次符合 Conventional Commits 的 Git 提交並推送到遠端；不適用於還需要建立 Pull Request 的情境。
---

# Commit Push

## 目的

根據目前工作區的實際變更，完成一次符合 Conventional Commits 的 Git 提交，並將變更推送到遠端倉庫。

## 適用時機

- 需要一次完成提交與推送
- 需要在 `main` 分支上先切出功能分支再推送

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

## 規範

- 分支與提交訊息格式沿用 commit skill 規範
- 提交訊息描述需使用繁體中文且必須對應實際 diff

## 限制

- 只建立一個 commit
- 不要 amend
- 不要提交 secrets、`.env`、建置產物、暫存檔或無關檔案