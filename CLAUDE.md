# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server (http://localhost:4321)
npm run build     # Production build: astro build + pagefind index
npm run preview   # Preview built dist/
node scripts/update-codes.js  # Run code updater manually
```

## Architecture

Astro v5 static site, GitHub → Vercel auto-deploy. 9 languages, 10 guide topics = 99 pages.

```
src/
├── pages/
│   ├── index.astro                # EN homepage
│   ├── beginner-guide.astro ...   # 10 EN guide pages (one per topic)
│   ├── [lang]/[slug].astro       # Dynamic route: all 8 non-EN langs × 10 guides
│   └── de/index.astro ...         # 8 static lang homepages
├── layouts/Layout.astro           # Global shell: SEO, AdSense, Pagefind, hreflang
├── components/
│   ├── Header.astro               # Nav with lang-aware links + Search + LanguageSwitcher
│   ├── HomeContent.astro          # Homepage hero + 10 SVG icon cards (2-col grid)
│   ├── Search.astro               # Pagefind modal (Ctrl+K), init-only (no dynamic loading)
│   ├── LanguageSwitcher.astro     # Dropdown using getLocalizedPath()
│   └── Footer.astro
├── content/
│   ├── config.ts                  # Zod schema: title, description, category, priority, lang, updatedAt
│   └── guide/*.{en,de,it,fr,es,ja,ko,id,pl}.md  # 90 files (10 topics × 9 langs)
├── i18n/
│   ├── ui.ts                      # Language type, UIStrings interface
│   ├── utils.ts                   # getLangFromPath(), getUIStrings(), getLocalizedPath()
│   └── {en,de,it,fr,es,ja,ko,id,pl}.ts  # ~85 UI strings per language
├── styles/global.css              # Tailwind directives
├── consts.ts                      # SITE config, NAV, MODULES (legacy ref)
└── env.d.ts
public/                            # favicon.svg, og-default.png
```

## i18n Routing

- **EN (default)**: `src/pages/xxx.astro` → `/xxx`, no prefix (`prefixDefaultLocale: false`)
- **Other 8 langs**: `src/pages/[lang]/[slug].astro` → `/de/beginner-guide`, `/ja/codes`, etc.
- Homepages are static: `src/pages/de/index.astro`, etc.
- `getLocalizedPath()` strips current lang prefix, adds target prefix. Used for hreflang and language switcher.
- Content Collection `lang` field filters translations; falls back to `en` if lang file missing.

## Content Collection

Schema (`src/content/config.ts`): `category` enum matches URL slugs (e.g. `beginner-guide`, `codes`). `lang` defaults to `"en"`. Each `.md` file uses `lang: de` etc. in frontmatter. Build warns "Duplicate id" — expected, harmless. Filter by `data.lang` in page queries.

## Pagefind Search

- Pagefind runs in `npm run build` after astro: `npx pagefind --site dist`
- `Layout.astro` loads CSS + JS with `<script is:inline src="...">` and `<link>` (static, not bundled by Vite)
- `Search.astro` initializes `PagefindUI` on dialog open — no dynamic script injection
- In dev mode (`PagefindUI` missing), shows fallback message

## GitHub Actions

`.github/workflows/update-codes.yml`:
- Runs every 6 hours (cron) + manual trigger (`workflow_dispatch`)
- Executes `scripts/update-codes.js`, commits + pushes if changes found
- Push triggers Vercel redeploy
- Do NOT add `[skip ci]` to commit messages — Vercel needs the push event

## Translation Rules

When adding/editing guide content:
1. Write/update `topic.en.md` first
2. Match frontmatter structure: `lang`, `title`, `description`, `category`, `priority`, `updatedAt`
3. Game terms stay English in all languages: NPC names, locations, items, currencies, features, events, codes
4. Translate body text, titles, descriptions naturally
5. Preserve all markdown formatting exactly (tables, bold, blockquotes, inline code)

## Design

- Dark theme: `bg-gray-950` + `text-gray-100`, pink accent (`text-pink-400`)
- Tailwind v3 with `@tailwindcss/typography` plugin (vite config at `tailwind.config.cjs`, NOT Tailwind v4)
- `max-w-4xl` for article prose, `max-w-5xl`/`max-w-6xl` for grids
- AdSense `<script>` in Layout `<head>` applies to every page
- Pagefind UI styled with CSS custom properties for dark theme
