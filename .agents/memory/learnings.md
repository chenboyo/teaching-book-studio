# 歷史教訓與環境踩坑記錄 (Learnings & Corrections)

本文件沉澱跨專案與本專案累積的環境特性、技術陷阱與標準解法。

---

## 1. Windows PowerShell 編碼天塹 (CP950 vs UTF-8)
- **現象**：執行輸出中文或特殊符號的腳本時，容易於 Windows PowerShell 預設代碼頁發生亂碼或 `UnicodeEncodeError`。
- **解法**：所有終端指令開頭強制包含：
  ```powershell
  $env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
  ```

## 2. Windows PowerShell 5.1 vs 7 語法相容性
- **現象**：Windows 內建 PowerShell 5.1 不支援 PowerShell 7 的三元運算子 `($cond ? $a : $b)`，執行會直接報語法錯誤。
- **解法**：所有 `.ps1` 腳本一律使用標準 `if (...) { ... } else { ... }`。

## 3. 檔案替換字元不匹配與編輯原則
- **現象**：跨越多行縮排或 CRLF/LF 差異時，`edit_file` 易因字串比對失敗而重試。
- **解法**：
  1. `.gitattributes` 強制設定 `* text=auto eol=lf`（`.ps1/.bat` 除外）。
  2. 微創修改嚴格控制在 20 行內且帶前後唯一錨點；若改動 > 40%，果斷轉用 `write_file` 全檔覆寫。

## 4. 自研 IIFE 打包器 (`scripts/build.mjs`) 的靜態語法邊界
- **現象**：`scripts/build.mjs` 將多支 ES Module 轉譯包裹成單檔離線 HTML 內的 IIFE，並以 `new Function(...)` 驗證語法。
- **解法與鐵律**：
  1. 僅允許 `import { a, b as c } from './path.js';`，不可使用 `import * as` 或預設匯入。
  2. 僅允許頂層 `export function`、`export async function`、`export class`、`export const/let/var`；不可使用 `export default` 或 `export { ... }`。
  3. JS 字串常數中**絕對不可出現連續字元 `</script>`**，否則在嵌入 `<script>` 標籤時會提前閉合標籤導致瀏覽器解析崩潰。
  4. `books/<slug>/book.json` 的 `modules` 陣列必須嚴格按照「被依賴者在前、入口在最後 (`"isEntry": true`)」的拓撲順序排列。

## 5. `file://` 離線雙擊開啟與 View Transitions / Focusgroup 漸進降級
- **現象**：
  1. 雙擊 `dist/books/<slug>/index.html` 時瀏覽器協定為 `file://`，部分瀏覽器呼叫 `history.replaceState` 修改 pathname/query 時會拋出 `SecurityError`。
  2. `document.startViewTransition({ update, types })` 的物件簽章與 `focusgroup="toolbar wrap"` 屬性的瀏覽器支援度仍在演進中，舊版或部分核心僅支援回呼形式或尚未原生支援 `focusgroup`。
- **解法**：
  1. URL 同步以 `try { ... } catch {}` 保護，且只更動 hash（`#unit-id`）或安全判斷 `window.location.protocol !== 'file:'`。
  2. View Transitions 實作雙重保護：先偵測 `typeof document.startViewTransition === 'function'`，若傳入 `{ update, types }` 失敗則於 `catch` 直接降級呼叫 `update()`。
  3. 工具列引入 `shared/ui/toolbarHelper.js`：僅在 `!('focusGroup' in HTMLElement.prototype)` 時啟用標準 roving-tabindex 與方向鍵導覽，避免與原生行為打架。
  4. 深色區塊（如 `pre`、`code.code-block`）覆寫 `color-scheme: dark` 時，必須重新明確指定 `background` 與 `color`，避免繼承已解析的 `light-dark()` 值造成文字隱形。
