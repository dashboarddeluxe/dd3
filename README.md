# Dashboard Deluxe 2

A personal link launcher: one scrollable page of categorized shortcuts to websites and resources. Built with [Hugo](https://gohugo.io/) and Tailwind CSS v4. All links live in markdown and YAML — no layout code changes needed to add or edit shortcuts.

## Features

- **Single-page dashboard** — every category renders as a section on the home page; no per-category URLs.
- **Keyboard search** — press `/` to filter; `↓`/`↑` to browse matches; `Enter` to open; `Esc` clears. Fuzzy matching handles typos and out-of-order letters (`gmial` → Gmail, `ytb` → YouTube). Matches section titles, group headings, and link labels with inline highlighting.
- **Recent links** — last 10 clicked links appear at the top; stored in `localStorage`.
- **Add to Home Screen** — web app manifest and `theme-color` for standalone mobile use.
- **Category navigation** — header links jump to sections; active section tracks as you scroll. Mobile hamburger menu on small screens.
- **Dark / light theme** — follows system preference on first visit; choice persists in `localStorage`. Toggle in the header.
- **Hidden links** — mark individual links or whole categories as hidden; reveal everything with `disableHiding` in site config.
- **Parameterized link groups** — reusable URL templates in YAML expand into full rows of links (BoardGameGeek filters, NBA stats, Amazon genres, etc.).
- **Accessible** — skip link, focus-visible styles, keyboard search navigation, `aria-live` match status, `prefers-reduced-motion` respected for scroll behavior.

## Project layout

```
content/          One markdown file per category (type: dashboard)
data/
  link-groups.yaml   Parameterized URL templates
layouts/          Hugo templates (partials for link parsing, blocks, nav)
assets/
  css/main.css    Tailwind v4 entry + theme tokens
  js/             Search, navigation, theme toggle
scripts/          Dev helpers (Hugo runner, env check, link-group validation)
archetypes/       Template for new categories
```

## Categories

Each category is a markdown file in `content/` with `type: dashboard`. Pages are not rendered individually (`build.render: never`); they feed the home page list.

```yaml
---
title: "Board Games"       # Section heading and anchor ID (#board-games)
link_name: "Board Games"   # Shorter label in the nav bar (optional)
weight: 3                  # Sort order (lower = higher on page and in nav)
hidden: false              # Hide entire section when disableHiding is false
type: dashboard
build:
  render: never
  list: always
blocks:
  # … link blocks (see below)
---
```

Create a new category from the archetype:

```bash
hugo new content/my-category.md --kind dashboard
```

Or copy an existing `content/*.md` file and edit the front matter.

Set `disableHiding: true` in `hugo.toml` `[params]` to show hidden links and hidden sections (useful for personal deploys).

## Link format

Every link uses the same pipe shorthand inside a `row` (or `links`) list:

```yaml
blocks:
  - row:
      - "Gmail | https://gmail.com"                    # visible link
      - "XL | https://colevintage.com/... | hidden"   # hidden unless disableHiding
      - "Search | header"                              # row label (no URL)
      - Search                                         # label shorthand (no pipe)
  - label: Complexity                                  # label + expanded group
    from: bgg:complexity
```

**Parsing rules**

- `Title | URL` — clickable link (opens in a new tab).
- `Title | header` or a bare word — inline row label, not a link.
- `| hidden` — omit link unless `disableHiding` is on. Up to three trailing flags are stripped.
- Titles that contain `|` work — everything before the last `|` segment is the title.

**Block shapes**

| Shape | Renders as |
|-------|------------|
| `- row: [ … ]` | Pipe-separated links on one line |
| `- title: "Name"` then `- row:` | Group heading (`<h3>`) above the row |
| `- label: "Name"` + `from:` | Row label followed by expanded group links |
| `- from: bgg:complexity` | Full expanded group, no label |
| `- title: "Name"` alone | Heading only; links in the next `row` block |

Links in a row are separated by `|` characters in the rendered output.

## Link groups

Parameterized rows live in `data/link-groups.yaml`. Hugo loads this as `hugo.Data.link-groups`.

Each top-level key is a namespace (e.g. `bgg`, `nba_advanced`, `amazon`). Under it:

```yaml
bgg:
  base: https://boardgamegeek.com/search/boardgame
  groups:
    complexity:
      template: sort=rank&advsearch=1&floatrange%5Bavgweight%5D%5Bmin%5D={min}&floatrange%5Bavgweight%5D%5Bmax%5D={max}&…
      keys: [min, max]
      items:
        - id: very_light
          title: Very Light
          values: ["1", "1.49"]
```

- `template` — URL query string (or path) with `{placeholder}` tokens.
- `keys` — placeholder names, in order.
- `items` — each item has `id`, `title`, and `values` (same length as `keys`).

**Expand a whole group** in content:

```yaml
- label: Complexity
  from: bgg:complexity
```

**Reference one item**:

```yaml
- "Very Light | bgg:complexity.very_light"
```

Syntax: `namespace:group.item_id`. The template engine substitutes values and joins with `base`:

- Default: `{base}?{template}` (query-string groups).
- `join: path` on a group: `{base}{template}` (path-suffix groups, e.g. Amazon genres, NYT lists).

Add another namespace by copying an existing block under a new top-level key, then use `from: spotify:playlists` or `spotify:playlists.chill` in content. One-off links stay as full URLs in markdown.

Validate all groups resolve without leftover placeholders:

```bash
npm test
# or: npm run validate-link-groups
#     npm run validate-content-links
```

`npm test` runs both link-group and content markdown URL validation.

Requires Python 3 (`scripts/run-python.js` finds `python` / `python3` / `py` on Windows).

## Search

| Key | Action |
|-----|--------|
| `/` | Focus the search field (when not already in an input) |
| `↓` / `↑` | Browse visible links after filtering (from search or between links) |
| `Enter` | Open the first match (from search) or the focused link |
| `Esc` | Clear search and blur |

Filtering is hierarchical: a section title match shows the whole section; a group heading match shows that group; otherwise only matching rows stay visible. Unmatched sections are hidden. A status message announces match counts and zero results (`aria-live="polite"`).

Append `?debugSearch=1` to the URL to run client-side search assertions in the browser console.

## Theme

- Default: `prefers-color-scheme` on first visit.
- Toggle: sun/moon button in the header; stored under `dd4-theme` in `localStorage`.
- Tokens: `assets/css/main.css` `@theme` block and `[data-theme="light"]` / `[data-theme="dark"]` palettes. Inter variable font is self-hosted under `static/fonts/inter/`.

## Develop

Works on macOS, Windows, and Linux. Requires **Node 22+** (see `engines` in `package.json`).

```bash
npm install   # hugo-extended + @tailwindcss/cli
npm run dev   # local server — do not run bare `hugo server`
npm run build # production build to public/
npm test      # validate link-groups.yaml
```

With [nvm](https://github.com/nvm-sh/nvm): `nvm use` (reads `.nvmrc`). Otherwise install Node 22 from [nodejs.org](https://nodejs.org/).

`npm run dev` and `npm run build` invoke Hugo through `scripts/run-hugo.js`, which uses the local `hugo-extended` package (not a global Hugo install) and puts `node_modules/.bin` on `PATH` so Hugo can find `tailwindcss`.

**Stack**

- Hugo **0.163+** extended, via the `hugo-extended` npm package
- Tailwind CSS v4 through Hugo's `css.TailwindCSS` (no `tailwind.config.js`)
- CSS entry: `assets/css/main.css`; class detection via `hugo_stats.json`
- `scripts/check-env.js` runs before dev/build (Node version + dependencies)

**Troubleshooting**

| Error | Fix |
|-------|-----|
| `binary with name "tailwindcss" not found` | Run `npm install`; use `npm run dev` |
| `Cannot find module … hugo.mjs` | Use `npm run dev`, not `npx hugo` or a global Hugo |
| Node too old | Install Node 22+ and rerun `npm install` |

## Deploy

Static output goes to `public/`.

**Netlify** — `netlify.toml` runs `npm ci && npm run build` with `NODE_VERSION=22` and `HUGO_VERSION=0.163.3`.

**Cloudflare Pages** — see `wrangler.toml`; build command `npm ci && npm run build`, output directory `public`.

Edit links in `content/*.md` and `data/link-groups.yaml`; no rebuild of components required beyond `npm run build`.
