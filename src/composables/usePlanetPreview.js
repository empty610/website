import { onMounted, onBeforeUnmount } from 'vue';
import { mountVenus } from '../scripts/venus/model.js';

export function usePlanetPreview(planet) {
  let observer;
  let cleanup;
  let started = false;
  let disposed = false;
  onMounted(() => {
    const section = document.getElementById(planet);
    const stage = document.getElementById(`${planet}-preview-stage`);
    const mount = document.getElementById(`${planet}-preview-canvas`);
    async function start() {
      if (started || disposed) return;
      started = true;
      const dispose = await mountVenus(stage, mount, {
        preview: true,
        surface: planet === 'mars' ? 'images/mars/mars-texture.jpg' : 'images/venus/venus-surface.jpg',
        tilt: planet === 'mars' ? 25.19 : 177.4,
      });
      if (disposed) dispose?.();
      else cleanup = dispose;
    }
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        start();
      }, { rootMargin: '240px 0px' });
      observer.observe(section);
    } else start();
  });
  onBeforeUnmount(() => {
    disposed = true;
    observer?.disconnect();
    cleanup?.();
  });
}
