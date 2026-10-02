(() => {
  const toggle = document.getElementById('site-nav-toggle');
  const closeButton = document.getElementById('site-nav-close');
  const menu = document.getElementById('site-navigation');
  const main = document.getElementById('main');
  const links = Array.from(menu.querySelectorAll('nav a'));
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  const darkSectionIds = new Set(['dc', 'venus', 'mars']);
  const backgroundSections = Array.from(main.querySelectorAll('section[id]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let idleTimer;

  function revealToggle() {
    clearTimeout(idleTimer);
    toggle.classList.remove('is-idle-hidden');
    if (toggle.hidden || menu.open) return;
    idleTimer = window.setTimeout(() => toggle.classList.add('is-idle-hidden'), 2000);
  }
  // Physical input renews the timer; automatic scroll and rendering do not.
  ['pointermove', 'pointerdown', 'touchstart', 'keydown'].forEach(type => {
    document.addEventListener(type, revealToggle, { passive: true });
  });
  toggle.addEventListener('focus', revealToggle);

  function updateToggleContrast() {
    if (toggle.hidden || menu.open) return;
    const probe = toggle.getBoundingClientRect();
    const probeY = probe.top + probe.height / 2;
    const current = backgroundSections.find(section => {
      const box = section.getBoundingClientRect();
      return box.top <= probeY && box.bottom >= probeY;
    });
    toggle.classList.toggle('is-on-dark-background', Boolean(current && darkSectionIds.has(current.id)));
  }

  function updateCurrent() {
    const point = Math.min(innerHeight * .4, 320);
    let current = -1;
    sections.forEach((section, i) => {
      const box = section.getBoundingClientRect();
      if (box.top <= point && box.bottom > point) current = i;
    });
    const mars = document.getElementById('mars');
    if (mars) {
      const box = mars.getBoundingClientRect();
      if (box.top <= point && box.bottom > point) current = links.findIndex(link => link.hash === '#venus');
    }
    // The last section can be shorter than a viewport and cannot scroll to the top.
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) current = sections.length - 1;
    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function closeMenu() {
    if (menu.open) menu.close();
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('site-menu-open');
    revealToggle();
    updateToggleContrast();
  }

  toggle.addEventListener('click', () => {
    updateCurrent();
    menu.showModal();
    clearTimeout(idleTimer);
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('site-menu-open');
    closeButton.focus({ preventScroll: true });
    window.dispatchEvent(new Event('idle-controls-reset'));
  });
  closeButton.addEventListener('click', closeMenu);
  menu.addEventListener('close', closeMenu);
  menu.addEventListener('cancel', event => {
    event.preventDefault();
    closeMenu();
  });
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    closeMenu();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    const section = sections[i];
    section.focus({ preventScroll: true });
    // Wait until the dialog has released the mobile viewport, then calculate
    // an absolute target. This keeps the section heading at the real top.
    requestAnimationFrame(() => {
      const top = Math.max(0, Math.round(scrollY + section.getBoundingClientRect().top));
      window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
  }));

  // The main content is initially hidden. Show the menu only once its targets exist on screen.
  const ready = () => { toggle.hidden = false; updateToggleContrast(); revealToggle(); };
  if (!main.hidden) ready();
  window.addEventListener('site-ready', ready, { once: true });
  window.addEventListener('pagehide', () => { closeMenu(); clearTimeout(idleTimer); });
  window.addEventListener('pageshow', closeMenu);
  window.addEventListener('scroll', updateToggleContrast, { passive: true });
  window.addEventListener('resize', updateToggleContrast);
})();
