# 當前上下文與活躍任務 (Active Context)

## 1. 當前聚焦目標 (Current Focus)
- 完成由 `2026-11-20` 改造為獨立專案 **`2026-11-20-book-making`（易懂教學教材與展示簡報工作坊）**，建立雙軌記憶系統（7 檔）、10 項專案級技能、流體雙模態引擎、`pedagogyLinter.js` 自動品管稽核器，以及旗艦示範教材 `cognitive-design-guide`（8 單元＋2 款跨模式狀態保留互動元件）。

## 2. 最近完成 (Recently Completed)
- [x] 初始化獨立目錄 `d:\GitDev\2026-11-20-book-making` 與 Git `main` 分支（無綁定舊專案遠端）
- [x] 升級雙軌記憶架構（`.agents/memory/` 7 檔：新增 `editorial_style.md` 與 `curriculum_glossary.md`）與 4 份專案規範（新增 `pedagogy-and-design.md`）
- [x] 建置 10 項受 Git 追蹤的專案級技能（新增 `pedagogical-content-architect`、`teaching-book-builder`、`presentation-qa-coach`，升級 `verification-runner` 與 `git-commit-push`）
- [x] 完成流體雙模共用核心層：`bookEngine.js`、`pedagogyLinter.js`、`bookViewer.js`、`toolbarHelper.js`、`dialogHelper.js`、三主題設計令牌（`paper` / `light` / `dark`）、閱讀/簡報/列印樣式與工作坊大廳
- [x] 完成旗艦教材 `books/cognitive-design-guide/`（8 單元、inline SVG 圖解、3 題診斷式隨堂測驗與「認知負荷模擬器」、「簡報前後改造對比台」兩款互動元件）
- [x] 實作腳手架與品管 CLI（`build.mjs`、`serve.mjs`、`new-book.mjs`、`audit-books.mjs`）並完成全量測試與離線建置驗證

## 3. 進行中與下一步 (Next Steps)
- [ ] 使用 `npm run new-book -- <slug> "<書名>" "<分類>" "<對象>"` 製作第二本跨領域教學教材（例如 AI 代理人記憶架構入門或國中數理概念圖解本）
- [ ] 如需公開分享，建立新的遠端 Git 倉庫或透過 `cloudflare-pages-deploy` 部署 `dist/` 至 Cloudflare Pages

## 4. 當前已知阻礙或風險 (Blockers & Risks)
- 無阻礙。Node v24.15.0 原生測試、教學品管 CLI、`scripts/build.mjs` 離線單檔建置與 `verify.ps1` 衛生檢查皆可完整離線運作。
