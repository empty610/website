import { assetUrl } from './assets.js';

const scripts = new Map();
let enginePromise;

export function loadScript(path) {
  if (!scripts.has(path)) {
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = assetUrl(path);
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${path}`));
      document.head.append(script);
    });
    scripts.set(path, promise.catch(error => {
      scripts.delete(path);
      throw error;
    }));
  }
  return scripts.get(path);
}

export function loadEngine({ mars = false } = {}) {
  if (!enginePromise) {
    const folder = mars ? 'vendor/mars/' : 'vendor/three/';
    enginePromise = (async () => {
      await loadScript(folder + (mars ? 'three.js' : 'build/three.min.js'));
      await loadScript(folder + (mars ? 'OrbitControls.js' : 'examples/jsm/controls/OrbitControls.global.js'));
      return window.THREE;
    })().catch(error => {
      enginePromise = undefined;
      throw error;
    });
  }
  return enginePromise;
}
