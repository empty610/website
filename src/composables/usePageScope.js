import { onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

// Each routed page owns its timers, observers, listeners and WebGL resources.
// Legacy astronomy modules receive this scope explicitly; browser APIs stay intact.
export function usePageScope() {
  let active = true;
  const cleanups = [];
  const frames = new Set();
  const timeouts = new Set();
  const intervals = new Set();
  const controller = new AbortController();
  const onDispose = cleanup => active ? cleanups.push(cleanup) : cleanup();
  const scope = {
    router: useRouter(),
    get active() { return active; },
    onDispose,
    listen(target, event, handler, options = {}) {
      if (!active || !target) return;
      target.addEventListener(event, handler, {
        ...(typeof options === 'boolean' ? { capture: options } : options),
        signal: controller.signal,
      });
    },
    requestAnimationFrame(callback) {
      if (!active) return 0;
      const id = window.requestAnimationFrame(time => {
        frames.delete(id);
        if (active) callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelAnimationFrame(id) { frames.delete(id); window.cancelAnimationFrame(id); },
    setTimeout(callback, delay, ...args) {
      if (!active) return 0;
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        if (active) callback(...args);
      }, delay);
      timeouts.add(id);
      return id;
    },
    clearTimeout(id) { timeouts.delete(id); window.clearTimeout(id); },
    setInterval(callback, delay, ...args) {
      if (!active) return 0;
      const id = window.setInterval(() => { if (active) callback(...args); }, delay);
      intervals.add(id);
      return id;
    },
    clearInterval(id) { intervals.delete(id); window.clearInterval(id); },
    expose(name, value) {
      if (!active) return value;
      window[name] = value;
      onDispose(() => { if (window[name] === value) delete window[name]; });
      return value;
    },
    trackScene(scene, renderer, controls) {
      onDispose(() => {
        controls.dispose();
        const resources = new Set();
        scene.traverse(object => {
          if (object.geometry) resources.add(object.geometry);
          for (const material of [object.material].flat().filter(Boolean)) {
            resources.add(material);
            for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
          }
        });
        resources.forEach(resource => resource.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      });
    },
  };
  for (const name of ['ResizeObserver', 'IntersectionObserver', 'PerformanceObserver']) {
    scope[name] = function(callback, options) {
      const observer = new window[name]((...args) => { if (active) callback(...args); }, options);
      onDispose(() => observer.disconnect());
      return observer;
    };
  }
  onBeforeUnmount(() => {
    active = false;
    controller.abort();
    frames.forEach(id => window.cancelAnimationFrame(id));
    timeouts.forEach(id => window.clearTimeout(id));
    intervals.forEach(id => window.clearInterval(id));
    cleanups.reverse().forEach(cleanup => cleanup());
    frames.clear(); timeouts.clear(); intervals.clear();
  });
  return scope;
}
