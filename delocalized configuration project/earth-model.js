// The original DC globe, atmosphere, lighting and rotation speed, shared with home.
export const EARTH_SPIN = 0.15;

export function addEarthLighting(THREE, scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xffeedd, 2.2);
  sun.position.set(8, 6, 5);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xccddff, 0.6);
  fill.position.set(-4, -2, -6);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffeeee, 0.7);
  rim.position.set(-3, 5, -4);
  scene.add(rim);
}

export function createDCEarth(THREE, textureUrl, onReady, onError) {
  const earthGroup = new THREE.Group();
  const radius = 1.25;
  const tex = new THREE.TextureLoader().load(textureUrl, onReady, undefined, onError);
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.08 })
  );
  earthGroup.add(earth);
  earthGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.015, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x8a9bb5, transparent: true, opacity: 0.09, side: THREE.BackSide })
  ));
  return { earthGroup, earth };
}
