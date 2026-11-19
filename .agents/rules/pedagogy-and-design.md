# 教學設計與簡報展示硬規範 (Pedagogy & Presentation Design Rules)

本規範結合 **認知負荷理論 (CLT)**、**Richard Mayer 多媒體學習 12 原則** 與 **Michael Alley 斷言-視覺證據設計 (Assertion-Evidence)**，所有書籍教材皆須遵守，並由 `shared/engine/pedagogyLinter.js` 自動稽核。

## 1. 認知負荷與簡報密度硬上限
1. **斷言式主標題 (`assertion`)**：必須為一句明確表達結論的完整句子（12–34 字為佳），禁止使用「第三章：介紹」這類空泛名詞標題。
2. **簡報重點精煉 (`slidePoints`)**：每頁簡報限制 2–4 點，單點建議 ≤ 26 字，簡報畫面文字總長不得逾越單頁認知上限；詳細解釋與舉例一律移入 `bookProse` 與 `speakerNotes`。
3. **講稿分離 (`speakerNotes`)**：每頁皆須附帶口語化講者備忘錄與預估講授秒數 (`durationSec`)，避免簡報畫面與口說講稿逐字重複（Mayer Redundancy Principle）。

## 2. 視覺證據與圖文空間緊鄰
1. **視覺證據佔比**：全書至少 **60% 以上單元** 必須包含直接證實斷言的視覺組件（內嵌程序化 SVG 圖解 `visual`、結構化對比卡 `comparison`、或即時互動探索元件 `widgetId`）。
2. **拒絕裝飾性圖示**：不得放置與教學邏輯無關的表情符號牆或裝飾圖（Mayer Coherence Principle）。
3. **標籤緊鄰元件**：SVG 圖解內的註解與說明文字必須直接配置於對應元件旁邊（Mayer Spatial Contiguity Principle）。

## 3. 預習詞彙與形成性測驗
1. **詞彙預習 (`glossary` & `[[termId]]`)**：所有書中標記的 `[[termId]]` 必須正確對應 `BOOK_DATA.glossary` 定義，且優先依循 `.agents/memory/curriculum_glossary.md` 標準譯名與生活比喻。
2. **診斷式測驗回饋 (`quiz`)**：每題測驗必須提供清楚選項、正確答案索引與「為什麼對／為什麼常見誤解會錯」的具體診斷解析 (`explanation`)。

## 4. 雙模狀態保留、無障礙與列印講義對等
1. **雙模同步**：互動模擬元件在「📖 教材閱讀模式」與「📽️ 簡報展示模式」切換時必須保留操作狀態。
2. **無障礙地板**：控制工具列須支援鍵盤單一 Tab 停駐與方向鍵移動、高對比焦點環、粗指標 ≥ 44px 熱區與 `prefers-reduced-motion` 降級。
3. **列印講義支援**：透過 `@media print` 支援「完整教材列印」與「簡報畫面＋講者筆記講義」雙版型輸出，確保不出現互動空白框。
