---
name: presentation-qa-coach
description: >-
  Audit cognitive load, Assertion-Evidence clarity, dual-mode widget parity,
  keyboard accessibility, and print handout output across all teaching books.
---

# 教學品質與簡報體驗審查技能 (Presentation QA Coach)

在教材撰寫完成、簡報介面改版或發佈前，調用本技能進行全方位的教學設計與呈現品質驗收。

## 審查五大關卡

### 1. 自動化認知負荷與教學品管稽核
```powershell
$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
npm run audit-books
```
檢查報告中之：
- **Errors 必須為 0**：無缺失斷言、無懸空 `[[termId]]`、無缺解析的測驗題。
- **視覺證據佔比 ≥ 60%**：每本教材大多數單元皆須具備 SVG 圖解、對比卡或互動模擬器。
- **單頁密度控制**：單頁簡報重點 2–4 條，無未拆分的文字牆。

### 2. 教材模式 (Book Mode) vs 簡報模式 (Slide Mode) 雙模驗證
- **狀態一致性**：在 Book Mode 調整互動元件滑桿或開關後，切換至 Slide Mode（快捷鍵 `B`），確認數值與視覺回饋完全保留。
- **方向性轉場與降級**：切換前後頁時確認前進/後退方向感明確；在 `prefers-reduced-motion: reduce` 環境不出現暈眩動效。

### 3. 簡報現場操作與無障礙檢查
- **Toolbar 鍵盤導覽**：使用 `Tab` 進入頂部工具列後，能以 `←`/`→`/`Home`/`End` 移動焦點，且首頁/末頁邊界按鈕使用 `aria-disabled="true"` 保持可聚焦性。
- **快捷鍵清單**：驗證 `←`/`→`/`Space`（換頁）、`G`（總覽網格）、`N`（講者備忘錄＋計時器）、`D`（詞彙庫）、`B`（雙模切換）、`T`（主題切換：`paper`/`light`/`dark`）、`P`（列印選項）。
- **三主題對比度**：切換至深色模式（`dark`）時，確認程式碼區塊與 SVG 文字皆保持清晰高對比。

### 4. 講義列印 (`@media print`) 檢查
- 確認列印預覽（`Book Print` 與 `Slides + Speaker Notes Handout`）自動隱藏工具列與導覽按鈕。
- 確認 Handout 模式能將每頁斷言圖解與下方講者筆記乾淨分組，避免從圖表正中間斷頁。

### 5. 離線雙擊檢驗
- 執行 `npm run build` 後，直接檢查 `dist/books/<slug>/index.html` 於本機 `file://` 開啟是否無 Console 錯誤。
