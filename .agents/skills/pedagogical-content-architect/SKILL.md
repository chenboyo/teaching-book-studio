---
name: pedagogical-content-architect
description: >-
  Design easy-to-understand instructional textbooks and Assertion-Evidence web
  presentations grounded in Cognitive Load Theory and Mayer's 12 Principles of
  Multimedia Learning.
---

# 教學內容架構與分鏡設計技能 (Pedagogical Content Architect)

當使用者要求規劃一本新教材、設計教學簡報大綱、改寫艱澀知識為易懂教學單元時，必須先執行本技能完成教學架構與認知設計。

## 核心教學框架

### 1. 先檢索編審軌記憶
- 閱讀 `.agents/memory/editorial_style.md`（目標讀者人設、親切對話語氣、字數密度上限）。
- 閱讀 `.agents/memory/curriculum_glossary.md`（既有專有名詞 `termId` 與統一比喻，禁止重複造詞）。

### 2. 五步教學分鏡流程
1. **明確學習目標（Learning Objectives）**：
   - 使用布魯姆分類法可觀察動詞（分辨、操作、重構、診斷），撰寫 3–4 條具體學習成果。
2. **詞彙預習先行（Mayer Pre-training）**：
   - 盤點全書 4–8 個核心術語，先寫出「一句話白話定義＋生活比喻」登錄於 `glossary`，並在早期的預習單元展示，正文內統一以 `[[termId]]` 標記。
3. **分段節流（Mayer Segmenting）**：
   - 將主題拆為 **6–10 個微單元**，每個單元僅講解 **1 個核心主張**。
4. **斷言-視覺證據設計（Alley Assertion-Evidence）**：
   - **主標 (`assertion`)**：寫成「完整結論句」（12–34 字），拒絕空泛名詞標題（例如「第三章：介紹」）。
   - **視覺證據 (`visual` / `comparison` / `widgetId`)**：每單元規劃一張能直接「證明」斷言的圖解：流程對比圖、SVG 結構圖、正反對照卡或互動探索模擬器。圖解標籤必須直接放在對應元件旁（Spatial Contiguity）。
   - **簡報文字 vs 講稿分離（Mayer Redundancy）**：`slidePoints` 限 2–4 條短句（≤ 26 字/條）；詳細背景故事與口語引導詞寫在 `speakerNotes` 與 `bookProse`。
5. **形成性診斷測驗（Diagnostic Quizzes）**：
   - 每 2–3 個核心單元配置一題隨堂檢測，每個錯誤選項的 `explanation` 都要精準回應學生為什麼會那樣想、以及該如何修正觀念。

### 3. 交付確認清單
- 新詞彙已同步登錄至 `.agents/memory/curriculum_glossary.md`。
- 完成分鏡設計後，交由 `teaching-book-builder` 實作並通過 `npm run audit-books`（目標 ≥ 90 分、0 Errors）。
