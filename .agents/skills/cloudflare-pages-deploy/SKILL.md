---
name: cloudflare-pages-deploy
description: "Deploy built folder to CF Pages via Wrangler OAuth."
version: 1.0.0
author: Hermes
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [cloudflare, pages, deploy, static-site, wrangler, hosting, cdn]
---

# Cloudflare Pages Direct Deploy (Wrangler CLI)

Use when the user has a **pre-built** static site folder (e.g. `dist/`, `build/`, `public/`, `_site/`, `out/`) and wants to push it to Cloudflare Pages via the **OAuth browser login** flow.

## What this skill does NOT do

- Does not run the build step. The folder must already contain the final static files.
- Does not use GitHub / Git integration. Pure CLI direct upload.
- Does not use API tokens. Login is via `wrangler login` (OAuth, browser opens).
- Does not configure custom domains or DNS.

## Workflow

### Step 1 — Verify the build folder exists
Confirm `dist/index.html` and every `dist/books/<slug>/index.html` are freshly built.

### Step 2 — Verify Cloudflare login
```powershell
npx wrangler whoami
```
If not logged in, run `npx wrangler login` (or `npx wrangler login --device` on headless/SSH machines).

### Step 3 — Deploy
```powershell
npx wrangler pages deploy dist --project-name=teaching-book-studio
```

### Step 4 — Verify Live URL
Check HTTP 200 and expected `<title>` on the returned `<branch>.<project-name>.pages.dev` URL.

---

## Project Context: Teaching Book & Presentation Studio

- Always run `npm test`, `npm run audit-books`, and `npm run build` first so `dist/index.html` and every `dist/books/<slug>/index.html` are freshly generated and pass pedagogical checks before deploying.
- Deploy with:
  ```powershell
  $env:PYTHONIOENCODING="utf-8"; chcp 65001 | Out-Null
  npx wrangler pages deploy dist --project-name=teaching-book-studio
  ```
- Keep `dist/` git-ignored (never force-add `dist/` to Git).
