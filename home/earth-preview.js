(() => {
  const scriptURL = document.currentScript.src;
  const section = document.getElementById('projects');
  const stage = document.getElementById('solar-preview-stage');
  const mount = document.getElementById('solar-earth-canvas');
  if (!section || !stage || !mount) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false, visible = false, ready = false, frame = 0;
  let renderer, scene, camera, earthGroup, spin, lastTime;

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(path, scriptURL).href;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function animate(now) {
    frame = 0;
    if (!ready || !visible || document.hidden || reduced.matches) return;
    const delta = Math.min(Math.max((now - lastTime) / 1000, 0), 0.1);
    lastTime = now;
    earthGroup.rotation.y += spin * delta;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  }
  function update() {
    if (!ready) return;
    if (!visible || document.hidden || reduced.matches) {
      stop();
      return;
    }
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }
  function resize() {
    if (!renderer) return;
    const width = Math.max(1, mount.clientWidth), height = Math.max(1, mount.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (ready) renderer.render(scene, camera);
  }
  async function start() {
    if (started) return;
    started = true;
    try {
      if (!window.THREE) await loadScript('../shared/vendor/three/build/three.min.js');
      const { createDCEarth, addEarthLighting, EARTH_SPIN } = await import(new URL('../delocalized configuration project/earth-model.js?v=20261007', scriptURL).href);
      const THREE = window.THREE;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
      camera.position.set(2.6, 1.73, 3.47);
      camera.lookAt(0, 0, 0);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      mount.append(renderer.domElement);
      addEarthLighting(THREE, scene);
      ({ earthGroup } = createDCEarth(THREE,
        new URL('../delocalized configuration project/assets/textures/earth_atmos_2048.jpg', scriptURL).href,
        () => {
          ready = true;
          resize();
          stage.classList.add('is-ready');
          update();
        },
        () => stage.classList.add('is-error')
      ));
      earthGroup.rotation.y = -1.1;
      scene.add(earthGroup);
      spin = EARTH_SPIN;
      resize();
      new ResizeObserver(resize).observe(mount);
    } catch {
      stage.classList.add('is-error');
    }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      update();
    }).observe(section);
  } else {
    visible = true;
    start();
  }
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', update);
})();
