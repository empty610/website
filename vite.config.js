import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // Keep the production CSP. Vite's development client needs injected styles
  // and a WebSocket; this change applies only to local development responses.
  plugins: [vue({ template: { compilerOptions: { comments: false } } }), {
    name: 'development-csp',
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(/\s*<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi, '');
    },
  }, {
    name: 'page-lifecycle-reload',
    // Astronomy modules own long-lived animation state. Recreate the page on
    // component/script edits so old observers and render loops cannot survive.
    handleHotUpdate({ file, server }) {
      if (file.includes('/src/') && /\.(vue|js)$/.test(file)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  }],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
  css: {
    postcss: {
      plugins: [{
        postcssPlugin: 'route-styles',
        Rule(rule) {
          const file = rule.source?.input.file?.replaceAll('\\', '/') ?? '';
          const page = file.match(/\/assets\/styles\/(home|mars|venus|terminal)\//)?.[1];
          const shared = file.endsWith('/src/assets/main.css');
          if (!page && !shared) return;
          for (let parent = rule.parent; parent; parent = parent.parent) {
            if (parent.type === 'atrule' && parent.name.endsWith('keyframes')) return;
          }
          // Route CSS stays loaded after navigation. Gate its selectors so
          // similarly named astronomy panels and page backgrounds cannot clash.
          const prefix = shared
            ? 'html:is([data-page="home"], [data-page="terminal"])'
            : `html[data-page="${page}"]`;
          rule.selectors = rule.selectors.map(selector => {
            if (selector.startsWith(':root')) return prefix + selector.slice(5);
            if (selector.startsWith('html')) return prefix + selector.slice(4);
            return prefix + ' ' + selector;
          });
        },
      }],
    },
  },
  build: {
    manifest: true,
    assetsInlineLimit: 0,
  },
});
