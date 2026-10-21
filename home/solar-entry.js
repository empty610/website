(() => {
  'use strict';
  const section = document.getElementById('projects');
  const chart = document.getElementById('solar-orbital-art');
  if (!section || !chart) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sun = [...chart.querySelectorAll('.solar-sun, .solar-sun-aura')];
  const planetLayer = chart.querySelector('.solar-planets');
  const orbits = [...chart.querySelectorAll('.solar-orbit')];
  const PLANETS_AT = .5, ORBITS_AT = PLANETS_AT, ORBITS_DURATION = 1.5;
  const RUN_AT = ORBITS_AT, INTRO_END = ORBITS_AT + ORBITS_DURATION;
  const planets = [...section.querySelectorAll('[data-orbit]')].map(node => ({
    node,
    radius: Number(node.dataset.radius),
    size: Number(node.dataset.size),
    angle: Number(node.dataset.angle) * Math.PI / 180,
    // Deliberately compressed exhibition periods, not physical orbital periods.
    speed: Math.PI * 2 / Number(node.dataset.period),
    light: node.querySelector('.solar-illumination'),
    day: node.querySelector('.solar-daylight'),
    glow: node.querySelector('radialGradient[id^="solar-day-"]'),
    rim: node.querySelector('.solar-lit-rim'),
    ring: node.querySelector('#solar-ring-light'),
    label: node.querySelector('.solar-planet-label'),
    leader: node.querySelector('.solar-leader')
  }));
  let visible = false, frame = 0, previous = null, elapsed = 0;
  let entered = section.classList.contains('enter');
  const tilt = -24 * Math.PI / 180, cos = Math.cos(tilt), sin = Math.sin(tilt);
  const flattening = .49, depth = Math.sqrt(1 - flattening * flattening);
  function render(delta) {
    for (const planet of planets) {
      planet.angle = (planet.angle + delta * planet.speed) % (Math.PI * 2);
      const x = planet.radius * Math.cos(planet.angle);
      const y = planet.radius * flattening * Math.sin(planet.angle);
      const px = x * cos - y * sin, py = x * sin + y * cos;
      planet.node.setAttribute('transform', `translate(${(450 + px).toFixed(2)} ${(350 + py).toFixed(2)})`);
      // The Sun is the light source. The projected direction rotates the bright
      // limb; its camera-space depth determines the visible illuminated phase.
      const lightAngle = Math.atan2(-py, -px) * 180 / Math.PI;
      const lightZ = -depth * Math.sin(planet.angle);
      const r = planet.size;
      const terminator = Math.max(.001, Math.abs(lightZ) * r).toFixed(3);
      planet.light.setAttribute('transform', `rotate(${lightAngle.toFixed(2)})`);
      planet.day.setAttribute('d', `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${terminator} ${r} 0 0 ${lightZ >= 0 ? 1 : 0} 0 ${-r} Z`);
      planet.glow.setAttribute('cx', (r * Math.sqrt(1 - lightZ * lightZ) * .55).toFixed(3));
      planet.rim.setAttribute('opacity', (.22 + .24 * (1 - lightZ) / 2).toFixed(3));
      if (planet.ring) {
        const distance = Math.hypot(px, py);
        const lx = -px / distance, ly = -py / distance;
        // Ring geometry is itself tilted; undo that tilt for its light field.
        const rx = (lx * cos + ly * sin) * 28;
        const ry = (-lx * sin + ly * cos) * 28;
        for (const [name, value] of [['x1', rx], ['y1', ry], ['x2', -rx], ['y2', -ry]]) {
          planet.ring.setAttribute(name, value.toFixed(2));
        }
      }
      if (planet.label) {
        const side = px > 280 ? -1 : 1;
        planet.label.setAttribute('x', (side * (r + 10)).toFixed(1));
        planet.label.setAttribute('text-anchor', side < 0 ? 'end' : 'start');
        planet.leader.setAttribute('d', `M ${side * (r + 8)} 0 h ${side * 16} l ${side * 10} -12 h ${side * 24}`);
      }
    }
  }
  const clamp = value => Math.max(0, Math.min(1, value));
  function reveal() {
    const time = reduced.matches ? INTRO_END : elapsed;
    for (const node of sun) node.style.opacity = clamp(time / .3);
    planetLayer.style.opacity = clamp((time - PLANETS_AT) / .3);
    for (const orbit of orbits) orbit.style.strokeDashoffset = 1 - clamp((time - ORBITS_AT) / ORBITS_DURATION);
  }
  function canRun() {
    return !reduced.matches && entered && visible && !document.hidden && !document.documentElement.classList.contains('dc-navigation-active');
  }
  function setMotion(value) {
    if (section.dataset.motion !== value) section.dataset.motion = value;
  }
  function tick(now) {
    frame = 0;
    if (!canRun()) return;
    const delta = previous === null ? 0 : Math.min((now - previous) / 1000, .1);
    previous = now;
    const before = elapsed;
    elapsed += delta;
    if (before < INTRO_END) reveal();
    // Planet lighting, motion and path drawing share one start time.
    const motionDelta = Math.max(0, elapsed - RUN_AT) - Math.max(0, before - RUN_AT);
    if (motionDelta > 0) render(motionDelta);
    setMotion(elapsed >= RUN_AT ? 'running' : 'intro');
    frame = requestAnimationFrame(tick);
  }
  function update() {
    cancelAnimationFrame(frame); frame = 0; previous = null;
    const nextEntered = section.classList.contains('enter');
    if (entered && !nextEntered) {
      elapsed = 0;
      for (const planet of planets) planet.angle = Number(planet.node.dataset.angle) * Math.PI / 180;
      render(0);
    }
    entered = nextEntered;
    reveal();
    setMotion(canRun() ? (elapsed >= RUN_AT ? 'running' : 'intro') : 'paused');
    if (canRun()) frame = requestAnimationFrame(tick);
  }
  new MutationObserver(update).observe(section, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', update);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; update();
  }, { threshold: 0 }).observe(chart);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('site-navigation', update);
  window.addEventListener('pagehide', () => { visible = false; update(); });
  window.addEventListener('pageshow', () => {
    const box = chart.getBoundingClientRect(); visible = box.bottom > 0 && box.top < innerHeight; update();
  });
  render(0);
  update();
})();
