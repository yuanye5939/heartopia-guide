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

Astro v5 static site, GitHub → Vercel auto-deploy. 9 languages, 23 content categories.

```
src/
├── pages/
│   ├── index.astro                # EN homepage
│   ├── beginner-guide.astro ...   # 23 EN guide pages (one per category)
│   ├── world-map.astro            # Interactive map (iframe embed from webresources.cc)
│   ├── [lang]/[slug].astro       # Dynamic route: non-EN guide pages
│   ├── [lang]/world-map.astro    # Redirects all non-EN /lang/world-map → /world-map (302)
│   └── de/index.astro ...         # 8 static lang homepages
├── layouts/Layout.astro           # Global shell: SEO, AdSense, Pagefind, hreflang
├── components/
│   ├── Header.astro               # Nav + Search + LanguageSwitcher (accepts hideLangSwitcher prop)
│   ├── HomeContent.astro          # Homepage hero (blob glows, floating stars) + 23 icon cards
│   ├── Search.astro               # Pagefind modal (Ctrl+K)
│   ├── LanguageSwitcher.astro     # Language dropdown using getLocalizedPath()
│   └── Footer.astro               # Footer with SVG wave divider
├── content/
│   ├── config.ts                  # Zod schema: 23 categories, 9 langs, P0-P3 priority
│   └── guide/*.{en,de,it,fr,es,ja,ko,id,pl}.md  # 102 files (22 EN + 80 translated)
├── i18n/
│   ├── ui.ts                      # Language type, UIStrings interface, LANGUAGES array
│   ├── utils.ts                   # getLangFromPath(), getUIStrings(), getLocalizedPath()
│   └── {en,de,it,fr,es,ja,ko,id,pl}.ts  # UI strings per language
├── styles/global.css              # Tailwind directives
├── consts.ts                      # SITE, NAV (12 items), MODULES (23 entries)
└── env.d.ts
public/                            # favicon.svg, og-default.png
```

## i18n Routing

- **EN (default)**: `src/pages/xxx.astro` → `/xxx`, no prefix (`prefixDefaultLocale: false`)
- **Other 8 langs**: `src/pages/[lang]/[slug].astro` → `/de/beginner-guide`, `/ja/codes`, etc.
- Homepages are static: `src/pages/de/index.astro`, etc.
- **world-map exception**: All non-EN map URLs (`/de/world-map`, `/ja/world-map`) 302 redirect to `/world-map`. The map iframe content is English-only.
- `getLocalizedPath()` strips current lang prefix, adds target prefix. Used for hreflang and language switcher.
- Content Collection `lang` field filters translations. Only 10 core categories have all 9 languages translated (beginner-guide, codes, walkthrough, characters, resources, hobbies, crafting, building, events, multiplayer). The 13 collection categories (fish, bugs, birds, crops, flowers, forageables, pets-cats, pets-dogs, wild-animals, achievements, recipes, songs) are EN-only.

## Content Collection

Schema (`src/content/config.ts`): `category` enum has 23 values matching URL slugs. `lang` defaults to `"en"`. Each `.md` file uses `lang: de` etc. in frontmatter. Build warns "Duplicate id" — expected, harmless. Filter by `data.lang` in page queries.

23 categories by priority:
- **P0**: beginner-guide, codes, walkthrough, world-map
- **P1**: characters, resources, fish, bugs, birds, crops, recipes
- **P2**: hobbies, crafting, flowers, forageables, pets-cats, pets-dogs, wild-animals, achievements
- **P3**: building, events, multiplayer, songs

## World Map Page

`world-map.astro` embeds an interactive map from `https://webresources.cc/heartopia/en.html` via iframe. This is a Next.js app hosted externally. Key details:
- Uses `referrerpolicy="no-referrer"` + `sandbox="allow-scripts allow-same-origin allow-popups allow-forms"` to bypass a frame-busting script on the external host
- The external app's redirect allowlist only includes `heartopia.live, localhost, 127.0.0.1` — `referrerpolicy="no-referrer"` makes `document.referrer` empty so the busting condition `if(!isAllowed&&referrer)` evaluates false
- Self-hosting the map was attempted and reverted (Next.js Turbopack dev build requires WebSocket/HMR, can't work statically)
- Dropdown reveals more features (300+ markers, real-time search, etc.)

## Pagefind Search

- Pagefind runs in `npm run build` after astro: `npx pagefind --site dist`
- Korean (`ko`) and Japanese (`ja`) trigger stemming warnings — expected, search still works
- `Layout.astro` loads CSS + JS with `<script is:inline src="...">` and `<link>` (static, not bundled by Vite)
- `Search.astro` initializes `PagefindUI` on dialog open — no dynamic script injection
- In dev mode (`PagefindUI` missing), shows fallback message

## GitHub Actions

`.github/workflows/update-codes.yml`:
- Runs every 6 hours (cron: `23 */6 * * *`) + manual trigger (`workflow_dispatch`)
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
- Tailwind v3 with `@tailwindcss/typography` plugin (config at `tailwind.config.cjs`, NOT Tailwind v4)
- `max-w-4xl` for article prose, `max-w-5xl`/`max-w-6xl` for grids
- AdSense `<script>` in Layout `<head>` applies to every page:
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2441650437092903" crossorigin="anonymous"></script>`
- Pagefind UI styled with CSS custom properties for dark theme
- Homepage has custom decorations: hero blob glows (3 gradient blur circles), floating sparkle stars (✦) + hearts with CSS animations, card hover effects (`hover:scale-[1.03]` + pink shadow glow), hand-drawn SVG decorative line under "All Guides", footer wave divider
- Header nav has a hidden Collections dropdown (`class="hidden"`) and hidden mobile accordion — use `{false && ...}` pattern to conditionally hide sections without deleting code
