
export function initIdleControls(scope) {
(() => {
  const controls = Array.from(document.querySelectorAll('[data-idle-hide]'));
  if (!controls.length) return;

  let timer;
  const visibleControls = () => controls.filter((control) => control.getClientRects().length > 0);
  const reveal = () => {
    scope.clearTimeout(timer);
    const visible = visibleControls();
    visible.forEach((control) => control.classList.remove('is-idle-hidden'));
    if (!document.hidden && visible.length) {
      timer = scope.setTimeout(() => {
        visibleControls().forEach((control) => control.classList.add('is-idle-hidden'));
      }, 2000);
    }
  };

  // Only direct input renews an exit control. Rendering and scripted scrolling do not.
  ['pointermove', 'pointerdown', 'touchstart', 'keydown'].forEach((type) => {
    scope.listen(document, type, reveal, { passive: true });
  });
  controls.forEach((control) => {
    scope.listen(control, 'focus', reveal);
    scope.listen(control, 'pointerenter', reveal);
  });
  scope.listen(window, 'idle-controls-reset', reveal);
  scope.listen(window, 'pageshow', reveal);
  scope.listen(window, 'pagehide', () => scope.clearTimeout(timer));
  reveal();
})();
}
