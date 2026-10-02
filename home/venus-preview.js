const section = document.getElementById('venus');
const stage = document.getElementById('venus-preview-stage');
const mount = document.getElementById('venus-preview-canvas');
let started = false;

async function startPreview() {
  if (started) return;
  started = true;
  try {
    const { mountVenus } = await import('../venus/model.js?v=20261002-model-controls');
    await mountVenus(stage, mount, { preview: true });
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
  } else {
    startPreview();
  }
}
