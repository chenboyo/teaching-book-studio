# Git 與蜂群工作樹操作守則 (Git & Swarm Worktrees)

## 1. 分支與 Worktree 隔離原則
- 當有多個子代理人並行編碼或同時撰寫不同教材時，必須指派獨立的 Git Worktree，避免檔案競爭與覆蓋。
- 專案根目錄為協調整合區與主分支 `main`。
- 子代理人工作樹命名範式：`../wt-<feature-name>`，對應分支 `feat/<feature-name>`。

## 2. Worktree 常用命令參考
```powershell
# 建立新工作樹並切換到新分支
powershell -ExecutionPolicy Bypass -File .agents/skills/worktree-manager/scripts/worktree.ps1 -Action add -Branch feat/book-unit -Path ../wt-book-unit

# 列出所有活躍工作樹
powershell -ExecutionPolicy Bypass -File .agents/skills/worktree-manager/scripts/worktree.ps1 -Action list

# 完成後移除工作樹
powershell -ExecutionPolicy Bypass -File .agents/skills/worktree-manager/scripts/worktree.ps1 -Action remove -Path ../wt-book-unit
```

## 3. 提交與推送守則
- 每個功能單元或新教材保持原子化提交 (Atomic Commits)，遵循 Conventional Commits 格式。
- 提交前必須通過 `verify.ps1`（涵蓋 `npm test`、`npm run audit-books` 與 `npm run build`），嚴禁將含敏感資訊、`dist/` 建置產物或嵌套 `.git` 的檔案推入主分支。
- `.agents/skills/` 內嚴禁存在任何嵌套 `.git` 或個人本機絕對路徑，確保所有專案技能可完整受 Git 追蹤並跨環境重現。
- 推薦使用專案技能 `git-commit-push`（支援 `-NoPush` 本機安全提交與 `-DryRun` 預覽，且嚴禁 `--force` 推送）。
