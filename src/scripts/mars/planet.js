
export function initMarsPlanet(scope) {
(function(){

    const stage = document.getElementById('mars-stage');
    const mount = document.getElementById('mars-3d');
    stage.classList.add('model-visual-pending');

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
      camera.position.set(0, .08, 4.8);

      const renderer = new THREE.WebGLRenderer({
        antialias: (window.devicePixelRatio || 1) <= 1.25,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.15));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      mount.appendChild(renderer.domElement);

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let modelLoaded = false;
      let revealFrame = 0;
      let revealRequested = false;
      const setModelView = active => {
        scope.cancelAnimationFrame(revealFrame);
        revealRequested = active && modelLoaded;
        stage.classList.toggle('model-view-leaving', !active && modelLoaded);
        stage.classList.remove('model-view-active');
        if (!active || !modelLoaded) return;
        stage.classList.remove('model-view-leaving');
        if (reducedMotion.matches) {
          stage.classList.add('model-view-active');
          revealRequested = false;
          return;
        }
        // Reveal only after a textured frame has actually reached the canvas.
      };
      scope.expose('MarsModelView', {
        enter: () => setModelView(true),
        exit: () => setModelView(false),
        get loaded(){ return modelLoaded; }
      });

      const world = new THREE.Group();
      world.rotation.z = THREE.MathUtils.degToRad(25.19);
      scene.add(world);

      const surfaceMaterialOptions = {
        color: 0xffffff,
        roughness: .88,
        metalness: 0,
        emissive: 0xffffff,
        emissiveIntensity: .2
      };
      const material = new THREE.MeshStandardMaterial({
        ...surfaceMaterialOptions,
        color: 0xffcdb6,
        emissive: 0xffcdb6
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.34, 64, 64), material);
      world.add(sphere);

      const textureSource = window.MARS_TEXTURE_DATA;
      if (!textureSource) throw new Error('Embedded Mars texture is unavailable');
      const texture = new THREE.TextureLoader().load(
        textureSource,
        map => {
          if (!scope.active) { map.dispose(); return; }
          map.colorSpace = THREE.SRGBColorSpace;
          map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
          material.map = map;
          material.emissiveMap = map;
          material.needsUpdate = true;
          stage.classList.remove('is-error');
          modelLoaded = true;
          stage.classList.remove('model-visual-pending');
          stage.classList.add('model-visual-ready');
          if (!stage.hidden) setModelView(true);
        },
        undefined,
        () => stage.classList.add('is-error')
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      scope.onDispose(() => texture.dispose());

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.355, 40, 40),
        new THREE.MeshBasicMaterial({
          color: 0xf0b458,
          transparent: true,
          opacity: .012,
          side: THREE.FrontSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      world.add(atmosphere);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(1.38, 40, 40),
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
              gl_FragColor = vec4(glowColor, rim * 0.075);
            }
          `
        })
      );
      world.add(glow);

      scene.add(new THREE.HemisphereLight(0xfff4df, 0x62544b, 1.75));
      const keyLight = new THREE.DirectionalLight(0xfff1e7, 2.0);
      keyLight.position.set(-3.6, 2.1, 4.8);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x8bc8dd, .35);
      rimLight.position.set(4, -.8, -2.2);
      scene.add(rimLight);

      const controls = new OrbitControls(camera, renderer.domElement);
      scope.trackScene(scene, renderer, controls);
      controls.enableDamping = true;
      controls.dampingFactor = .075;
      controls.enablePan = false;
      controls.minDistance = 2.7;
      controls.maxDistance = 6;
      controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.autoRotateSpeed = .55;
      const rotationButton = document.getElementById('rotation-toggle');
      function syncRotationButton(){ rotationButton.textContent=controls.autoRotate?'暂停自转':'自动旋转'; rotationButton.setAttribute('aria-pressed',String(!controls.autoRotate)); }
      rotationButton.onclick=()=>{controls.autoRotate=!controls.autoRotate;syncRotationButton()};
      syncRotationButton();
      controls.rotateSpeed = 1.2;
      controls.zoomSpeed = .9;

      const moons=window.setupMarsMoons({scene,camera,renderer,controls,world,sphere,stage,mount,surfaceMaterialOptions});

      const resize = () => {
        const width = Math.max(mount.clientWidth, 1);
        const height = Math.max(mount.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.fov = camera.aspect < 1 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19)) / camera.aspect)) : 38;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new scope.ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      let isInView = true;
      let isRunning = false;
      let animationFrame = 0;
      let lastRenderTime = 0;
      const frameInterval = 1000 / 40;
      const animate = time => {
        if (!isRunning) return;
        animationFrame = scope.requestAnimationFrame(animate);
        if (time - lastRenderTime < frameInterval) return;
        lastRenderTime = time;
        moons.beforeFrame(time);
        controls.update();
        renderer.render(scene, camera);
        moons.afterFrame();
        if (revealRequested && !stage.hidden) {
          revealRequested = false;
          revealFrame = scope.requestAnimationFrame(() => {
            revealFrame = scope.requestAnimationFrame(() => stage.classList.add('model-view-active'));
          });
        }
      };

      const syncAnimation = () => {
        const shouldRun = isInView && !document.hidden;
        if (shouldRun && !isRunning) {
          isRunning = true;
          animationFrame = scope.requestAnimationFrame(animate);
        } else if (!shouldRun && isRunning) {
          isRunning = false;
          scope.cancelAnimationFrame(animationFrame);
        }
      };

      const visibilityObserver = new scope.IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting;
        syncAnimation();
      }, { rootMargin: '120px 0px' });
      visibilityObserver.observe(stage);
      scope.listen(document, 'visibilitychange', syncAnimation);
      syncAnimation();
    } catch (error) {
      console.error('Mars 3D model failed to initialize:', error);
      stage.classList.add('is-error');
    }
  
})();
}
