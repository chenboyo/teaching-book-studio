# 專案運行憲章與系統規範 (GEMINI.md)
**Project Operating Charter & Engineering / Editorial Standards**

> **適用範圍**：本專案目錄內所有代理人對話工作階段、總調度代理人、教材編審子代理人與前端工程子代理人。

---

## 1. 架構願景與核心法則 (Architecture Vision & Core Principles)

所有在本專案運行的 AI Agent 必須恪守以下四大基礎哲學：

1. **極簡主義與零伺服器工藝 (Zero-Server-First)**
   - 本專案為純靜態 HTML / CSS / ES Modules 網站，無需後端伺服器、資料庫或前端建置框架即可開發與部署。
   - 透過自研 `scripts/build.mjs` 自動打包為完全離線、可單檔雙擊開啟的 `dist/index.html` 與 `dist/books/<slug>/index.html`。

2. **離線優先與程序化視覺 (Offline-First & Procedural Visuals)**
   - 圖表、概念模型、流程圖與互動模擬器一律優先使用 inline SVG 與純 JS 程序化繪製，杜絕外部 CDN 失效或斷網破圖。
   - 支援 `file://` 本機離線雙擊開啟，不依賴遠端路由或後端 API。

3. **認知友善與教學第一 (Cognitive Clarity First)**
   - 結合 **Richard Mayer 多媒體學習 12 原則**、**認知負荷理論（Cognitive Load Theory）** 與 **Michael Alley 斷言-視覺證據設計（Assertion-Evidence）**。
   - 一份結構化資料同時驅動「📖 教材閱讀模式」、「📽️ 簡報展示模式」與「🖨️ 講義列印模式」，講稿（Speaker Notes）與畫面精要文字徹底分離。

4. **零冗餘與工程潔癖 (Zero-Bloat & Surgical Precision)**
   - 嚴禁引入不必要的 npm 套件、死碼或重複樣式；保持 `shared/`、`books/<slug>/`、`scripts/` 與 `.agents/` 分層明確。

---

## 2. 雙軌記憶與上下文管理規範 (Dual-Track Memory Lifecycle)

本專案將記憶分為「工程軌」與「編審軌」：
- **對話起始**：讀取 `.agents/memory/active_context.md` 與 `project_context.md`。
- **編寫新教材前**：額外必讀 `.agents/memory/editorial_style.md` 與 `curriculum_glossary.md`，確保語氣、密度上限與專有名詞定義全書一致。
- **架構決策**：重大技術或格式變更以 ADR 格式追加至 `.agents/memory/decisions.md`。
- **專有名詞新增**：新教材引進核心概念詞彙時，同步登錄至 `.agents/memory/curriculum_glossary.md`。
- **踩坑沉澱**：遇 Windows 編碼、打包器語法限制或瀏覽器相容陷阱時，記錄於 `.agents/memory/learnings.md`。

---

## 3. 教學與展示品質契約 (Pedagogical Quality Contract)

- 每本教材必須通過 `npm run audit-books`（由 `shared/engine/pedagogyLinter.js` 執行）：
  - **0 Errors**：不可存在無效詞彙參照、空白單元、缺少斷言標題或缺少診斷解析的測驗選項。
  - **單頁認知節流**：簡報斷言精煉、條列重點 2–4 點、避免過長文字牆。
  - **視覺證據比例**：全書具圖解／互動元件／對比卡的單元比例須達 60% 以上（示範旗艦書建議 100%）。

---

## 4. Git 提交規範 (Conventional Commits)

嚴格遵循語意化提交格式：
- `feat: <新教材、互動元件或閱讀器功能>`
- `fix: <修復排版、打包、測試或無障礙問題>`
- `docs: <文件、記憶庫、名詞表或教材編審修訂>`
- `style: <排版與樣式微調>`
- `refactor: <引擎或模組結構重構>`
- `test: <無頭模擬測試或教學品管測試>`
- `chore: <腳手架、技能、驗證腳本等基礎建設>`
