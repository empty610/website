# website

Personal website and interactive astronomy projects by **empty610**.
Built with **Bun, Vue 3, Vite, and Vue Router**. Static hosting, no backend.

## Quick start

```sh
bun install --frozen-lockfile
bun run dev
```

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the local development server |
| `bun run build` | Bundle assets and prerender all four pages into `dist/` |
| `bun run check` | Validate built HTML, assets, links, SEO, sitemap, and CSP |
| `bun run preview` | Serve the production build locally |

Run `build` before `check` or `preview`.

## Structure

```text
index.html           Single HTML source entry
src/
  App.vue            RouterView
  main.js            App setup and hydration
  views/             Home.vue, Venus.vue, Mars.vue, Terminal.vue
  components/        Shared back icon and music controls
  router/index.js    Routes and scroll behavior
  seo.js             Site URL, page metadata, and structured data
  scripts/           Interactions and astronomy logic, grouped by page
  assets/            Images, fonts, audio, and page styles
  composables/       Page lifecycle cleanup and planet previews
  utils/             Asset URLs, engine loading, and idle controls
public/              Fixed-path vendor files, model data, and hosting headers
scripts/             Prerendering and build validation
docs/                Project notes and asset sources
```

## Pages

| Route | View |
| --- | --- |
| `/` | `Home.vue` |
| `/venus/` | `Venus.vue` |
| `/mars/` | `Mars.vue` |
| `/delocalized%20configuration%20project/` | `Terminal.vue` |

Keep each page's content in its view; extract components only when shared.
Page scripts use `usePageScope()` to release listeners, timers, observers, audio, and WebGL resources on navigation.

Store media in `src/assets/`; use `assetUrl()` for dynamic references. Vite generates hashed asset URLs. Use `public/` for files that require stable paths.
Page styles are scoped by `data-page`. Vue and JavaScript edits reload the page; CSS updates in place.

To add a page, create its view, register metadata in `src/seo.js` and a route in `src/router/index.js`, then add it to `scripts/prerender.js`. Extend the page-style mapping in `vite.config.js` if it has its own style directory.

## Deploy

Run `bun run build` and publish the entire `dist/` directory at the domain root.
Each route gets a complete static `index.html`, so direct visits and refreshes work without a server renderer. Matching `/index.html` aliases remain supported.

Update the production URL (`https://empty610.com/`) and page metadata in `src/seo.js`. Builds include canonical URLs, Open Graph / Twitter tags, JSON-LD, `robots.txt`, and `sitemap.xml`. Route changes update metadata in the browser; the homepage also displays its content without JavaScript.

Production retains CSP and copies `public/_headers` for hosts that support it. Development and preview bind to localhost; development removes the CSP meta tag to support Vite updates. Rebuild after source changes; do not edit `dist/` directly.
