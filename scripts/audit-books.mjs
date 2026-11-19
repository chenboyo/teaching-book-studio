import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { BOOK_CATALOG } from '../shared/catalog.js';
import { formatAuditReport, lintBook } from '../shared/engine/pedagogyLinter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function main() {
  const results = [];
  let hasFailures = false;

  for (const entry of BOOK_CATALOG) {
    const bookDir = path.join(rootDir, 'books', entry.id);
    const manifestPath = path.join(bookDir, 'book.json');
    if (!fs.existsSync(manifestPath)) {
      results.push({
        bookId: entry.id,
        title: entry.title,
        score: 0,
        grade: 'D',
        passed: false,
        unitCount: 0,
        estimatedMinutes: 0,
        visualEvidenceRatio: 0,
        errors: [`Missing manifest: ${manifestPath}`],
        warnings: [],
      });
      hasFailures = true;
      continue;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const contentRel = manifest.contentModule || './src/data/content.js';
    const contentAbs = path.resolve(bookDir, contentRel);
    if (!fs.existsSync(contentAbs)) {
      results.push({
        bookId: entry.id,
        title: entry.title,
        score: 0,
        grade: 'D',
        passed: false,
        unitCount: 0,
        estimatedMinutes: 0,
        visualEvidenceRatio: 0,
        errors: [`Missing contentModule: ${contentAbs}`],
        warnings: [],
      });
      hasFailures = true;
      continue;
    }

    const mod = await import(pathToFileURL(contentAbs).href);
    const report = lintBook(mod.BOOK_DATA);
    results.push(report);
    if (!report.passed || report.errors.length > 0) {
      hasFailures = true;
    }
  }

  console.log('=== 教學教材認知設計與簡報品質稽核報告 (Pedagogy Audit) ===');
  console.log(formatAuditReport(results));

  if (hasFailures) {
    console.error('\n[audit-books] 稽核未通過：存在教學品質錯誤或未達及格分數。');
    process.exit(1);
  }
  console.log(`\n[audit-books] 全數 ${results.length} 本教材通過教學品管檢核！`);
}

main().catch((err) => {
  console.error('[audit-books] 執行失敗：', err);
  process.exit(1);
});
