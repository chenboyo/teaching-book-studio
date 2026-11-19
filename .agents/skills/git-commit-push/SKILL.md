---
name: git-commit-push
description: >-
  Safely validate, stage, create Conventional Commits, and push changes to the Git remote
  on Windows without force-pushing, committing secrets/build artifacts, or leaving nested
  .git directories inside project skills.
---

# Git 提交與推送技能 (Git Commit & Push)

當需要將專案變更（程式碼、教材、記憶庫或 `.agents/skills/`）提交至 Git 並選擇性推送到遠端倉庫時使用本技能。

## 前置條件
1. 確認處於有效的 Git 倉庫與明確分支（不可為 detached HEAD）。
2. 提交訊息必須遵循 **Conventional Commits** 格式：
   `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `perf:`, `ci:`, `build:`。

## 自動化執行腳本

腳本路徑：[git-commit-push.ps1](./scripts/git-commit-push.ps1)

### 1. 本機安全提交（不推送遠端，適合尚未設定 origin 時）
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
powershell -ExecutionPolicy Bypass -File .agents/skills/git-commit-push/scripts/git-commit-push.ps1 -Message "feat: initialize teaching book studio" -All -NoPush
```

### 2. 指定路徑提交並推送至遠端（會自動驗證 remote 與執行 `-RequireRemote`）
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
powershell -ExecutionPolicy Bypass -File .agents/skills/git-commit-push/scripts/git-commit-push.ps1 -Message "feat: add new teaching book" -Paths @("books", "shared", ".agents")
```

### 3. Dry-Run 預覽檢查
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/git-commit-push/scripts/git-commit-push.ps1 -Message "docs: sync glossary" -All -NoPush -DryRun
```

## 內建安全護欄
1. **禁止嵌套倉庫與子模組誤提交**：掃描 `.agents/skills` 是否含 `.git`，並阻擋 mode `160000` gitlink。
2. **禁止機密與建置產物入庫**：阻擋 `.env*`、`*.pem`、`*.key`、`*.pfx`、`*.cert` 與 `dist/` 路徑被提交。
3. **提交前全量驗證**：預設先執行 `.agents/skills/verification-runner/scripts/verify.ps1`（推送模式會附加 `-RequireRemote`）。
4. **安全推送與遠端校驗**：一律使用 `git push -u <remote> <branch>`（嚴禁 `--force`），推送後比對 `git rev-parse HEAD` 與 `git ls-remote`。
