import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function transformModuleToIIFE(mod, code, absPath, absPathToKey) {
  const exportedNames = new Set();
  const dir = path.dirname(absPath);

  let transformed = code.replace(
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;/g,
    (_, specifiers, importPath) => {
      const targetAbs = path.resolve(dir, importPath);
      const targetKey = absPathToKey.get(targetAbs);
      if (!targetKey) {
        throw new Error(
          `Unknown import "${importPath}" (resolved: ${targetAbs}) in module "${mod.path}"`
        );
      }
      const cleanSpecs = specifiers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/\s+as\s+/g, ': '))
        .join(', ');
      return `const { ${cleanSpecs} } = __mod_${targetKey};`;
    }
  );

  transformed = transformed.replace(
    /^export\s+(async\s+)?function\s+([A-Za-z_$][\w$]*)/gm,
    (_, asyncKw, name) => {
      exportedNames.add(name);
      return `${asyncKw || ''}function ${name}`;
    }
  );

  transformed = transformed.replace(
    /^export\s+class\s+([A-Za-z_$][\w$]*)/gm,
    (_, name) => {
      exportedNames.add(name);
      return `class ${name}`;
    }
  );

  transformed = transformed.replace(
    /^export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/gm,
    (_, decl, name) => {
      exportedNames.add(name);
      return `${decl} ${name}`;
    }
  );

  if (mod.isEntry) {
    return `(() => {\n${transformed}\n})();`;
  }
  const returnList = Array.from(exportedNames).join(', ');
  return `const __mod_${mod.key} = (() => {\n${transformed}\nreturn { ${returnList} };\n})();`;
}

function bundleHtmlPage({ baseDir, entryHtml, styles, modules, outPath }) {
  const htmlTemplate = fs.readFileSync(path.join(baseDir, entryHtml), 'utf8');

  const absPathToKey = new Map();
  for (const mod of modules) {
    absPathToKey.set(path.resolve(baseDir, mod.path), mod.key);
  }

  const bundledModules = modules
    .map((mod) => {
      const absPath = path.resolve(baseDir, mod.path);
      const raw = fs.readFileSync(absPath, 'utf8');
      return `// === Module: ${mod.path} ===\n${transformModuleToIIFE(mod, raw, absPath, absPathToKey)}`;
    })
    .join('\n\n');

  const wrappedScript = `'use strict';\n${bundledModules}`;
  const closingScriptRe = new RegExp('<\\/script>', 'i');
  if (closingScriptRe.test(wrappedScript)) {
    throw new Error(`Bundled script for ${entryHtml} contains an unsafe closing script tag sequence.`);
  }
  new Function(wrappedScript);

  const combinedCss = styles
    .map((cssRel) => {
      const cssAbs = path.resolve(baseDir, cssRel);
      return `/* === Style: ${cssRel} === */\n${fs.readFileSync(cssAbs, 'utf8')}`;
    })
    .join('\n\n');

  let outHtml = htmlTemplate;
  let stylesInjected = false;
  outHtml = outHtml.replace(
    /<link\s+rel="stylesheet"\s+href="[^"]+"\s*\/?>\s*/g,
    () => {
      if (stylesInjected) return '';
      stylesInjected = true;
      return `<style>\n${combinedCss}\n</style>\n`;
    }
  );

  const scriptTagRe = new RegExp('<script\\s+type="module"\\s+src="[^"]+"><\\/script>');
  outHtml = outHtml.replace(
    scriptTagRe,
    () => `<script>\n${wrappedScript}\n<` + `/script>`
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outHtml, 'utf8');

  const sizeKb = (Buffer.byteLength(outHtml, 'utf8') / 1024).toFixed(1);
  console.log(`[build] Built ${path.relative(rootDir, outPath)} (${sizeKb} KB)`);
}

function buildAll() {
  bundleHtmlPage({
    baseDir: rootDir,
    entryHtml: 'index.html',
    styles: ['./shared/styles/tokens.css', './shared/styles/hub.css'],
    modules: [
      { key: 'catalog', path: './shared/catalog.js' },
      { key: 'hub', path: './shared/hub.js', isEntry: true },
    ],
    outPath: path.join(rootDir, 'dist/index.html'),
  });

  const booksDir = path.join(rootDir, 'books');
  if (fs.existsSync(booksDir)) {
    const entries = fs.readdirSync(booksDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const dir of entries) {
      const bookDir = path.join(booksDir, dir.name);
      const manifestPath = path.join(bookDir, 'book.json');
      if (!fs.existsSync(manifestPath)) continue;
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      bundleHtmlPage({
        baseDir: bookDir,
        entryHtml: manifest.entryHtml || 'index.html',
        styles: manifest.styles || [],
        modules: manifest.modules || [],
        outPath: path.join(rootDir, 'dist/books', dir.name, 'index.html'),
      });
    }
  }
}

buildAll();
