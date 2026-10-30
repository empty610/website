(() => {
  'use strict';
  const section = document.getElementById('projects');
  const chart = document.getElementById('solar-orbital-art');
  if (!section || !chart) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sun = [...chart.querySelectorAll('.solar-sun, .solar-sun-aura')];
  const planetLayer = chart.querySelector('.solar-planets');
  const PLANETS_AT = .5, ORBITS_AT = PLANETS_AT, OUTER_ORBIT_DURATION = 1.5;
  const RUN_AT = ORBITS_AT, INTRO_END = ORBITS_AT + OUTER_ORBIT_DURATION;
  const LABEL_DURATION = .72, LABEL_END = INTRO_END + LABEL_DURATION;
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
  const svg = planetLayer.ownerSVGElement;
  function layer(name) {
    const node = document.createElementNS(svg.namespaceURI, 'g');
    node.setAttribute('class', name);
    return node;
  }
  // Keep leaders below the bodies and text above them. Position containers own
  // translation; the two layers alone own the finite signal-reveal opacity.
  const leaderLayer = layer('solar-annotation-leaders');
  const labelLayer = layer('solar-annotations');
  planetLayer.before(leaderLayer);
  planetLayer.after(labelLayer);
  const annotations = planets.filter(planet => planet.label).map(planet => {
    planet.labelMount = layer('solar-annotation');
    planet.leaderMount = layer('solar-annotation-leader');
    planet.labelMount.append(planet.label);
    planet.leaderMount.append(planet.leader);
    labelLayer.append(planet.labelMount);
    leaderLayer.append(planet.leaderMount);
    return planet;
  });
  let labelOpacity;
  let visible = false, frame = 0, previous = null, elapsed = 0;
  let entered = section.classList.contains('enter');
  const tilt = -24 * Math.PI / 180, cos = Math.cos(tilt), sin = Math.sin(tilt);
  const flattening = .49, depth = Math.sqrt(1 - flattening * flattening);
  // Start each closed orbit at its planet's entry position. Two half-ellipse
  // arcs preserve the atlas geometry and draw in the direction of revolution.
  const orbits = planets.map(planet => {
    const ellipse = chart.querySelector('.solar-orbit[rx="' + planet.radius + '"]');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    const rx = planet.radius, ry = rx * flattening;
    const x = rx * Math.cos(planet.angle), y = ry * Math.sin(planet.angle);
    const start = (450 + x) + ' ' + (350 + y);
    const opposite = (450 - x) + ' ' + (350 - y);
    for (const name of ['class', 'pathLength', 'transform']) {
      path.setAttribute(name, ellipse.getAttribute(name));
    }
    path.setAttribute('d', 'M ' + start + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + opposite
      + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + start + ' Z');
    ellipse.replaceWith(path);
    return { node: path, length: path.getTotalLength() };
  });
  // One distance per second for all paths; the longest keeps the entry cadence.
  const ORBIT_DRAW_SPEED = Math.max(...orbits.map(orbit => orbit.length)) / OUTER_ORBIT_DURATION;
  function render(delta) {
    for (const planet of planets) {
      planet.angle = (planet.angle + delta * planet.speed) % (Math.PI * 2);
      const x = planet.radius * Math.cos(planet.angle);
      const y = planet.radius * flattening * Math.sin(planet.angle);
      const px = x * cos - y * sin, py = x * sin + y * cos;
      planet.x = 450 + px;
      planet.y = 350 + py;
      planet.extent = planet.ring ? 30 : planet.size;
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
    }
    placeLabels();
  }
  function placeLabels() {
    const occupied = [];
    const obstacles = [{ x: 450, y: 350, extent: 30 }, ...planets];
    for (const planet of annotations) {
      if (!planet.labelBox) {
        // The main page starts hidden behind its loading screen. Cache text
        // metrics only after SVG geometry is available, including reduced motion.
        const box = planet.label.getBBox();
        if (!box.width || !box.height) continue;
        planet.labelBox = { width: box.width, height: box.height,
          y: box.y - Number(planet.label.getAttribute('y')) };
      }
      const { width, height, y: top } = planet.labelBox;
      const preferred = planet.x > 730 ? -1 : 1;
      let chosen;
      candidates: for (const side of [preferred, -preferred]) for (const baseline of [-24, 32, -44, 52, -64, 72]) {
        const x = side * (planet.extent + 12);
        const rect = { left: planet.x + x - (side < 0 ? width : 0) - 3,
          right: planet.x + x + (side > 0 ? width : 0) + 3,
          top: planet.y + baseline + top - 3, bottom: planet.y + baseline + top + height + 3 };
        let penalty = rect.left < 18 || rect.right > 882 || rect.top < 72 || rect.bottom > 635 ? 100 : 0;
        for (const body of obstacles) {
          const dx = body.x - Math.max(rect.left, Math.min(rect.right, body.x));
          const dy = body.y - Math.max(rect.top, Math.min(rect.bottom, body.y));
          if (Math.hypot(dx, dy) < body.extent + 4) penalty += 10;
        }
        for (const box of occupied) {
          if (rect.left < box.right + 5 && rect.right > box.left - 5 && rect.top < box.bottom + 5 && rect.bottom > box.top - 5) penalty += 20;
        }
        if (!chosen || penalty < chosen.penalty) chosen = { side, baseline, x, rect, penalty };
        if (penalty === 0) break candidates;
      }
      occupied.push(chosen.rect);
      const position = planet.node.getAttribute('transform');
      planet.labelMount.setAttribute('transform', position);
      planet.leaderMount.setAttribute('transform', position);
      const { side, baseline, x } = chosen;
      const layout = `${side}/${baseline}/${width}`;
      if (planet.labelLayout === layout) continue;
      planet.labelLayout = layout;
      planet.label.setAttribute('x', x);
      planet.label.setAttribute('y', baseline);
      planet.label.setAttribute('text-anchor', side < 0 ? 'end' : 'start');
      planet.leader.setAttribute('d', `M ${side * (planet.extent + 6)} 0 H ${side * (planet.extent + 18)} L ${side * (planet.extent + 28)} ${baseline + 7} H ${side * (planet.extent + 12 + width)}`);
    }
  }
  const clamp = value => Math.max(0, Math.min(1, value));
  function reveal() {
    const time = reduced.matches ? INTRO_END : elapsed;
    for (const node of sun) node.style.opacity = clamp(time / .3);
    planetLayer.style.opacity = clamp((time - PLANETS_AT) / .3);
    const drawn = Math.max(0, time - ORBITS_AT) * ORBIT_DRAW_SPEED;
    for (const orbit of orbits) orbit.node.style.strokeDashoffset = 1 - clamp(drawn / orbit.length);
  }
  function revealLabels() {
    const time = reduced.matches ? LABEL_DURATION : elapsed - INTRO_END;
    // Two subdued reception pulses, then settle. This uses active time so
    // leaving the viewport or tab pauses the reveal together with the planets.
    const stops = [[0, 0], [.08, .65], [.15, .25], [.3, .85], [.39, .55], [LABEL_DURATION, 1]];
    let opacity = time <= 0 ? 0 : 1;
    for (let i = 1; time > 0 && i < stops.length; i++) {
      if (time > stops[i][0]) continue;
      const [start, from] = stops[i - 1], [end, to] = stops[i];
      opacity = from + (to - from) * (time - start) / (end - start);
      break;
    }
    const value = opacity.toFixed(3);
    if (labelOpacity === value) return;
    labelOpacity = value;
    for (const node of [leaderLayer, labelLayer]) node.style.opacity = value;
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
    if (before < LABEL_END) revealLabels();
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
    placeLabels();
    reveal();
    revealLabels();
    setMotion(canRun() ? (elapsed >= RUN_AT ? 'running' : 'intro') : 'paused');
    if (canRun()) frame = requestAnimationFrame(tick);
  }
  new MutationObserver(update).observe(section, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', update);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; update();
  }, { threshold: 0 }).observe(chart);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('site-ready', update);
  window.addEventListener('site-navigation', update);
  window.addEventListener('pagehide', () => { visible = false; update(); });
  window.addEventListener('pageshow', () => {
    const box = chart.getBoundingClientRect(); visible = box.bottom > 0 && box.top < innerHeight; update();
  });
  new ResizeObserver(() => {
    // SVG font hinting can change measured advances at a new screen scale.
    for (const planet of annotations) planet.labelBox = null;
    placeLabels();
  }).observe(svg);
  render(0);
  update();
})();
