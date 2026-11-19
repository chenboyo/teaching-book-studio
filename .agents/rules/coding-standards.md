# 專案編程與代碼修改準則 (Coding Standards)

## 1. 代碼修改手術刀原則 (Surgical Editing)
- **微創替換（< 20 行）**：調用 `edit_file` 時，替換區間嚴格控制在 20 行以內，且前後各保留 2~3 行唯一識別代碼。
- **大幅重構（> 40% 或 > 80 行）**：直接使用 `write_file` (Overwrite=true) 進行全檔覆寫，避免因縮排、CRLF/LF 差異導致搜尋替換失敗。
- **無冗餘讀取**：禁止反覆讀取同一檔案區塊；每次讀取精算 `StartLine` 與 `EndLine`。

## 2. 跨平台相容性與 Windows 防禦
- **終端輸出編碼**：PowerShell 指令必須附帶 `$env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null`。
- **Python 腳本頭部**：加入 `sys.stdout.reconfigure(encoding='utf-8')`。
- **PowerShell 5.1/7 相容**：`.ps1` 腳本禁用 PowerShell 7 三元運算子 `? :`，一律使用 `if (...) { ... } else { ... }`。
- **工作目錄絕對錨定**：`run_command` 一律設定絕對路徑，禁止依賴 `cd` 切換目錄。

## 3. 自研離線打包器 (`scripts/build.mjs`) ESM 契約
- 僅使用靜態具名匯入：`import { a, b as c } from './path.js';`。
- 僅使用頂層具名匯出：`export function`、`export async function`、`export class`、`export const/let/var`。
- 禁止 `export default`、`export { ... }`、`export *`、`import * as` 與動態 `import()`。
- JS 程式碼與資料字串中**嚴禁出現連續字元 `</script>`**。
- 純邏輯引擎（如 `bookEngine.js`、`pedagogyLinter.js`、互動計算純函數）必須與 DOM 分離，以利 Node 24 原生 `node --test` 直接驗證。
