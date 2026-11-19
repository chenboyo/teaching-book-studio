---
name: verification-runner
description: >-
  Execute automated verification checks on file integrity, UTF-8 encoding
  compliance, Git repository health, dual-track memory completeness, project skill
  hygiene, pedagogical linting (audit-books), unit tests, and offline single-file builds.
---

# 驗證執行技能 (Verification Runner)

在完成任務、新增教材、交付功能或提交程式碼前，調用本技能執行全棧自動化健康度與教學品質檢測。

## 執行方式

執行驗證腳本：[verify.ps1](./scripts/verify.ps1)

```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
powershell -ExecutionPolicy Bypass -File .agents/skills/verification-runner/scripts/verify.ps1
```

若要強制驗證 `origin` 遠端設定（例如準備推送前）：
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/verification-runner/scripts/verify.ps1 -RequireRemote
```

若僅需檢測基礎設施與技能衛生（跳過 `npm test`、`audit-books` 與 `build`）：
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/verification-runner/scripts/verify.ps1 -SkipAppChecks
```

## 檢測項目
1. **Git 倉庫狀態**：確認 `.git` 已初始化、主分支為 `main`、`.gitignore` 與 `.gitattributes` 完備；若傳入 `-RequireRemote` 則強制驗證 `origin` 遠端存在。
2. **專案憲章與規範**：確認 `AGENTS.md`、`GEMINI.md` 及 `.agents/rules/` 共 4 份規範存在。
3. **雙軌記憶架構完整度**：驗證 `MEMORY.md` 與 `.agents/memory/` 下 7 大記憶檔案（5 工程軌 + 2 編審軌）。
4. **專案級技能衛生檢查**：
   - 驗證 `.agents/skills/*`（≥ 8 項）皆含 `SKILL.md` 及有效 YAML Frontmatter（`name` 必須與資料夾名稱完全一致）。
   - 確認各技能可正常納入 Git 追蹤（未被 `.gitignore` 忽略）。
   - 確認 `.agents/skills/` 內無任何嵌套 `.git` 項目，且不含個人本機絕對路徑。
5. **應用程式測試、教學品管稽核與離線建置**（預設執行，可用 `-SkipAppChecks` 跳過）：
   - 執行 `npm test` 確認純邏輯引擎、目錄一致性與百局狀態機模擬測試通過。
   - 執行 `npm run audit-books` 確認全站教材無錯誤並達教學設計標準。
   - 執行 `npm run build` 確認成功產出 `dist/index.html` 與每本登錄書籍的 `dist/books/<slug>/index.html`。
