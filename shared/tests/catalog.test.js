import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOOK_CATALOG } from '../catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const booksDir = path.join(rootDir, 'books');

test('BOOK_CATALOG entries correspond to valid book directories and manifests', () => {
  assert.ok(Array.isArray(BOOK_CATALOG) && BOOK_CATALOG.length >= 1, 'BOOK_CATALOG must have at least 1 book');

  const seenIds = new Set();
  for (const entry of BOOK_CATALOG) {
    assert.ok(entry.id && /^[a-z0-9-]+$/.test(entry.id), `Invalid book id: ${entry.id}`);
    assert.ok(!seenIds.has(entry.id), `Duplicate book id: ${entry.id}`);
    seenIds.add(entry.id);

    const bDir = path.join(booksDir, entry.id);
    const manifestPath = path.join(bDir, 'book.json');
    const htmlPath = path.resolve(rootDir, entry.entry);

    assert.ok(fs.existsSync(manifestPath), `Missing book.json for ${entry.id}`);
    assert.ok(fs.existsSync(htmlPath), `Missing HTML entry ${entry.entry} for ${entry.id}`);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.id, entry.id, `book.json id mismatch for ${entry.id}`);
    assert.ok(Array.isArray(manifest.styles) && manifest.styles.length >= 1);
    assert.ok(Array.isArray(manifest.modules) && manifest.modules.length >= 1);

    const contentPath = path.resolve(bDir, manifest.contentModule || './src/data/content.js');
    assert.ok(fs.existsSync(contentPath), `Missing contentModule "${manifest.contentModule}" in ${entry.id}`);

    for (const cssRel of manifest.styles) {
      const cssAbs = path.resolve(bDir, cssRel);
      assert.ok(fs.existsSync(cssAbs), `Missing style "${cssRel}" referenced by ${entry.id}/book.json`);
    }

    manifest.modules.forEach((mod, idx) => {
      assert.ok(mod.key && mod.path, `Invalid module entry in ${entry.id}/book.json`);
      const modAbs = path.resolve(bDir, mod.path);
      assert.ok(fs.existsSync(modAbs), `Missing module "${mod.path}" referenced by ${entry.id}/book.json`);
      if (idx === manifest.modules.length - 1) {
        assert.equal(mod.isEntry, true, `Last module in ${entry.id}/book.json must be marked isEntry: true`);
      }
    });
  }
});

test('Every book folder under books/ is registered in BOOK_CATALOG', () => {
  const dirs = fs.readdirSync(booksDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  const catalogIds = new Set(BOOK_CATALOG.map((b) => b.id));
  for (const d of dirs) {
    assert.ok(
      catalogIds.has(d.name),
      `Directory books/${d.name} is missing from shared/catalog.js`
    );
  }
});
