let enginePromise;
function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(path, import.meta.url).href;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load Venus renderer'));
    document.head.append(script);
  });
}
async function loadEngine() {
  if (!enginePromise) {
    enginePromise = (async () => {
      if (!window.THREE) await loadScript('../shared/vendor/three/build/three.min.js');
      if (!window.OrbitControls) await loadScript('../shared/vendor/three/examples/jsm/controls/OrbitControls.global.js');
      return window.THREE;
    })();
  }
  return enginePromise;
}

// Share the project's original globe, surface map and glow with the home preview.
export async function mountVenus(stage, mount, { preview = false, surface = './venus-surface.jpg', tilt = 177.4 } = {}) {
  try {
    const THREE = await loadEngine();
    const OrbitControls = window.OrbitControls;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
      camera.position.set(0, .08, 4.25);

      const renderer = new THREE.WebGLRenderer({
        antialias: (window.devicePixelRatio || 1) <= 1.25,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.15));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      mount.appendChild(renderer.domElement);

      const world = new THREE.Group();
      world.rotation.z = THREE.MathUtils.degToRad(tilt);
      scene.add(world);

      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        toneMapped: false
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.34, 64, 64), material);
      world.add(sphere);

      const textureSource = new URL(surface, import.meta.url).href;
      const texture = new THREE.TextureLoader().load(
        textureSource,
        map => {
          map.colorSpace = THREE.SRGBColorSpace;
          map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
          material.map = map;
          material.needsUpdate = true;
          stage.classList.remove('is-error');
          // Upload the completed texture and paint one real frame before revealing
          // the canvas, so a blank sphere can never flash on screen.
          renderer.render(scene, camera);
          stage.classList.add('is-ready');
        },
        undefined,
        () => stage.classList.add('is-error')
      );
      texture.colorSpace = THREE.SRGBColorSpace;

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.39, 40, 40),
        new THREE.MeshBasicMaterial({
          color: 0xf0b458,
          transparent: true,
          opacity: .045,
          side: THREE.FrontSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      world.add(atmosphere);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(1.47, 40, 40),
        new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.BackSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { glowColor: { value: new THREE.Color(0xc68e35) } },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `,
          fragmentShader: `
            uniform vec3 glowColor;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            void main() {
              vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
              float rim = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 2.8);
              gl_FragColor = vec4(glowColor, rim * 0.24);
            }
          `
        })
      );
      world.add(glow);

      scene.add(new THREE.HemisphereLight(0xfff4df, 0x6c4b2d, 1.8));
      const keyLight = new THREE.DirectionalLight(0xfff1cf, 4.3);
      keyLight.position.set(-3.6, 2.1, 4.8);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x8bc8dd, 1.35);
      rimLight.position.set(4, -.8, -2.2);
      scene.add(rimLight);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enabled = !preview;
      controls.enableDamping = !preview;
      controls.dampingFactor = .075;
      controls.enablePan = false;
      controls.minDistance = 2.7;
      controls.maxDistance = 6;
      controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.autoRotateSpeed = .55;
      controls.rotateSpeed = 1.2;
      controls.zoomSpeed = .9;

      const resize = () => {
        const width = Math.max(mount.clientWidth, 1);
        const height = Math.max(mount.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // Fit the globe to the narrower field of view, including portrait phones.
        const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
        const angle = Math.min(halfFov, Math.atan(Math.tan(halfFov) * camera.aspect));
        const fitDistance = 1.60 / Math.sin(angle);
        camera.position.setLength(fitDistance);
        controls.maxDistance = Math.max(6, fitDistance * 1.6);
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      let isInView = true;
      let isRunning = false;
      let animationFrame = 0;
      let lastRenderTime = 0;
      const frameInterval = 1000 / (preview ? 30 : 60);
      const animate = time => {
        if (!isRunning) return;
        animationFrame = requestAnimationFrame(animate);
        if (time - lastRenderTime < frameInterval) return;
        const delta = Math.min((time - lastRenderTime) / 1000, .05);
        lastRenderTime = time;
        controls.update(delta);
        renderer.render(scene, camera);
      };

      const syncAnimation = () => {
        const shouldRun = isInView && !document.hidden && !document.documentElement.classList.contains('dc-navigation-active');
        if (shouldRun && !isRunning) {
          isRunning = true;
          lastRenderTime = performance.now();
          animationFrame = requestAnimationFrame(animate);
        } else if (!shouldRun && isRunning) {
          isRunning = false;
          cancelAnimationFrame(animationFrame);
        }
      };

      const visibilityObserver = new IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting;
        syncAnimation();
      }, { rootMargin: '120px 0px' });
      visibilityObserver.observe(stage);
      document.addEventListener('visibilitychange', syncAnimation);
      window.addEventListener('site-navigation', syncAnimation);
      window.addEventListener('pageshow', syncAnimation);
      syncAnimation();
  } catch (error) {
    stage.classList.add('is-error');
    console.error('Venus engine unavailable:', error);
  }
}
