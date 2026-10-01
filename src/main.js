import { createApp, createSSRApp } from 'vue';
import App from './App.vue';
import { createSiteRouter } from './router/index.js';
import './assets/main.css';

document.documentElement.classList.add('js');
const container = document.getElementById('website-app');
const app = container.innerHTML.trim() ? createSSRApp(App) : createApp(App);
const router = createSiteRouter();
app.use(router);
await router.isReady();
app.mount(container);
