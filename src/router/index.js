import { nextTick } from 'vue';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { pages, updateSeo } from '../seo.js';

export const routes = [
  { path: pages.home.path, alias: '/index.html', name: 'home', component: () => import('../views/Home.vue'), meta: pages.home },
  { path: pages.venus.path, alias: '/venus/index.html', name: 'venus', component: () => import('../views/Venus.vue'), meta: pages.venus },
  { path: pages.mars.path, alias: '/mars/index.html', name: 'mars', component: () => import('../views/Mars.vue'), meta: pages.mars },
  { path: pages.terminal.path, alias: '/delocalized%20configuration%20project/index.html', name: 'terminal', component: () => import('../views/Terminal.vue'), meta: pages.terminal },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export function createSiteRouter({ server = false } = {}) {
  const router = createRouter({
    history: server ? createMemoryHistory() : createWebHistory(import.meta.env.BASE_URL),
    routes,
    async scrollBehavior(to, from, savedPosition) {
      await nextTick();
      if (savedPosition) return savedPosition;
      if (to.hash) {
        if (to.name === 'mars' && to.hash.startsWith('#rovers/')) return false;
        const el = document.getElementById(decodeURIComponent(to.hash.slice(1)));
        return el ? { el } : false;
      }
      return to.name === from.name ? false : { top: 0 };
    },
  });
  if (!server) router.afterEach((to, from) => {
    updateSeo(to.meta);
    document.documentElement.dataset.page = to.name;
    document.body.dataset.page = to.name;
    if (to.name !== from.name) {
      document.documentElement.classList.remove('site-menu-open', 'dc-navigation-active', 'music-playing');
    }
  });
  return router;
}
