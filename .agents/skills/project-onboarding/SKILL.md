---
name: project-onboarding
description: >-
  Provides rapid project orientation, dual-track memory alignment, environment
  readiness verification, and workflow checklist for any agent entering the
  Teaching Book & Presentation Studio repository.
---

# 專案導入與對齊技能 (Project Onboarding Skill)

當代理人進入本專案或開始新一輪任務時，使用本技能快速對齊工程規範、雙軌記憶系統與教學編審標準。

## 導入檢查清單 (Onboarding Checklist)

1. **讀取雙軌記憶上下文**：
   - **工程軌**：檢視 [active_context.md](../../memory/active_context.md) 與 [project_context.md](../../memory/project_context.md)。
   - **編審軌**（撰寫教材或設計簡報前必讀）：檢視 [editorial_style.md](../../memory/editorial_style.md) 與 [curriculum_glossary.md](../../memory/curriculum_glossary.md)。

2. **確認規範與防禦環境**：
   - 遵循根目錄 [AGENTS.md](../../../AGENTS.md)、[GEMINI.md](../../../GEMINI.md) 與 `.agents/rules/pedagogy-and-design.md`。
   - Windows PowerShell 指令前置：`$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null`。
   - 編輯原則：微創手術 `< 20` 行；改動 `> 40%` 果斷全檔覆寫。

3. **專案級技能清單（`.agents/skills/` 共 10 項）**：
   | 技能名稱 | 用途說明 |
   | :--- | :--- |
   | `project-onboarding` | 新工作階段導入、雙軌記憶對齊與環境檢查 |
   | `session-memory-sync` | 同步工程軌＋編審軌記憶、ADR 決策與過期清理 |
   | `pedagogical-content-architect` | 依據認知負荷、Mayer 12 原則與斷言-視覺證據設計教材分鏡 |
   | `teaching-book-builder` | 建立、註冊、建置與測試雙模教材與互動探索元件 |
   | `presentation-qa-coach` | 執行 `audit-books` 品管、雙模狀態一致性與列印講義審查 |
   | `modern-web-guidance` | HTML/CSS/JS 現代 Web 最佳實踐與無障礙查詢 |
   | `worktree-manager` | 多代理人並行作業的 Git Worktree 建立與清理 |
   | `verification-runner` | Git、雙軌記憶、技能衛生、`npm test`、`audit-books` 與建置驗證 |
   | `cloudflare-pages-deploy` | 透過 Wrangler OAuth 將 `dist/` 發布至 Cloudflare Pages |
   | `git-commit-push` | Conventional Commit 驗證、安全防呆與推送遠端 |

4. **核心開發指令（`package.json`）**：
   - `npm run serve`：啟動本機預覽伺服器（`http://127.0.0.1:4173/index.html`）
   - `npm test`：執行單元測試與無頭狀態機模擬測試
   - `npm run audit-books`：執行教學設計與認知負荷自動化品管檢查
   - `npm run build`：打包全離線雙擊單檔版至 `dist/`
   - `npm run new-book -- <slug> "<書名>" [分類] [對象]`：建立新教材骨架並自動登錄至 `shared/catalog.js`

5. **蜂群作業確認**：
   - 若多代理人需並行修改不同教材單元或模組，啟用 `worktree-manager` 配置獨立工作樹。
