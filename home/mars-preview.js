const section = document.getElementById('mars');
const stage = document.getElementById('mars-preview-stage');
const mount = document.getElementById('mars-preview-canvas');
let started = false;
async function startPreview() {
  if (started) return;
  started = true;
  try {
    const { mountVenus } = await import('../venus/model.js?v=20260923-mars');
    await mountVenus(stage, mount, { preview: true, surface: '../mars/assets/mars-texture.jpg', tilt: 25.19 });
  } catch {
    stage.classList.add('is-error');
  }
}
if (section && stage && mount) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      startPreview();
    }, { rootMargin: '240px 0px' });
    observer.observe(section);
  } else startPreview();
}
