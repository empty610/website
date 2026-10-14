(() => {
  'use strict';
  const section = document.getElementById('projects');
  const chart = document.getElementById('solar-motion-toggle');
  if (!section || !chart) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
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
  let playing = !reduced.matches, visible = false, frame = 0, previous = 0, lastPaint = 0;
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
  function canRun() {
    return playing && visible && !document.hidden && !document.documentElement.classList.contains('dc-navigation-active');
  }
  function tick(now) {
    frame = 0;
    if (!canRun()) return;
    if (!previous) previous = now;
    if (now - lastPaint >= 16) {
      render(Math.min((now - previous) / 1000, .1));
      previous = now; lastPaint = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function update() {
    cancelAnimationFrame(frame); frame = 0; previous = 0; lastPaint = 0;
    chart.setAttribute('aria-pressed', String(playing));
    chart.setAttribute('aria-label', playing ? '暂停行星公转动画' : '播放行星公转动画');
    section.dataset.motion = canRun() ? 'running' : 'paused';
    if (canRun()) frame = requestAnimationFrame(tick);
  }
  function toggle() { playing = !playing; update(); }
  chart.addEventListener('click', toggle);
  chart.addEventListener('keydown', event => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault(); toggle();
    }
  });
  reduced.addEventListener('change', () => { playing = !reduced.matches; update(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; update();
  }, { threshold: 0 }).observe(section);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('site-navigation', update);
  window.addEventListener('pagehide', () => { visible = false; update(); });
  window.addEventListener('pageshow', () => {
    const box = section.getBoundingClientRect(); visible = box.bottom > 0 && box.top < innerHeight; update();
  });
  render(0);
  update();
})();
