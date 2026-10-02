(() => {
  const controls = Array.from(document.querySelectorAll('[data-idle-hide]'));
  if (!controls.length) return;

  let timer;
  const visibleControls = () => controls.filter((control) => control.getClientRects().length > 0);
  const reveal = () => {
    window.clearTimeout(timer);
    const visible = visibleControls();
    visible.forEach((control) => control.classList.remove('is-idle-hidden'));
    if (!document.hidden && visible.length) {
      timer = window.setTimeout(() => {
        visibleControls().forEach((control) => control.classList.add('is-idle-hidden'));
      }, 2000);
    }
  };

  // Only direct input renews an exit control. Rendering and scripted scrolling do not.
  ['pointermove', 'pointerdown', 'touchstart', 'keydown'].forEach((type) => {
    document.addEventListener(type, reveal, { passive: true });
  });
  controls.forEach((control) => {
    control.addEventListener('focus', reveal);
    control.addEventListener('pointerenter', reveal);
  });
  window.addEventListener('idle-controls-reset', reveal);
  window.addEventListener('pageshow', reveal);
  window.addEventListener('pagehide', () => window.clearTimeout(timer));
  reveal();
})();
