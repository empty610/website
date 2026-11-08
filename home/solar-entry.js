(() => {
  'use strict';
  const section = document.getElementById('projects');
  const chart = document.getElementById('solar-orbital-art');
  if (!section || !chart) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sun = [...chart.querySelectorAll('.solar-sun, .solar-sun-aura')];
  const planetLayer = chart.querySelector('.solar-planets');
  const orbits = [...chart.querySelectorAll('.solar-orbit')];
  const orbitGeometry = orbits.map(node => ({ node, rx: Number(node.getAttribute('rx')),
    ry: node.getAttribute('ry'), transform: node.getAttribute('transform') }));
  // Open one shared orbital plane; bodies stay on their tracks throughout.
  const INTRO_END = 2.2, RUN_AT = 0, RUN_RAMP = .5;
  const ARC_AT = .06, ARC_DURATION = 1.56, ARC_STAGGER = .025;
  const LEADERS_AT = 1.18, LEADERS_DURATION = .42;
  const LABELS_AT = 1.32, LABEL_DURATION = .55, LABEL_END = LABELS_AT + LABEL_DURATION;
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
    planet.leader.setAttribute('pathLength', '1');
    planet.leaderMount.append(planet.leader);
    labelLayer.append(planet.labelMount);
    leaderLayer.append(planet.leaderMount);
    return planet;
  });
  let visible = false, frame = 0, previous = null, elapsed = 0;
  let entered = section.classList.contains('enter');
  const tilt = -24 * Math.PI / 180, cos = Math.cos(tilt), sin = Math.sin(tilt);
  const flattening = .49;
  function render(delta) {
    const pose = orbitalPose();
    const viewCos = Math.cos(pose.tilt * Math.PI / 180), viewSin = Math.sin(pose.tilt * Math.PI / 180);
    const depth = Math.sqrt(1 - pose.flattening * pose.flattening);
    for (const planet of planets) {
      planet.angle = (planet.angle + delta * planet.speed) % (Math.PI * 2);
      const x = planet.radius * pose.scale * Math.cos(planet.angle);
      const y = planet.radius * pose.scale * pose.flattening * Math.sin(planet.angle);
      const px = x * viewCos - y * viewSin, py = x * viewSin + y * viewCos;
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
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const smoother = value => { const t = clamp(value); return t * t * t * (t * (6 * t - 15) + 10); };
  function setAttribute(node, name, value) {
    const next = String(value);
    if (node.getAttribute(name) !== next) node.setAttribute(name, next);
  }
  // Avoid reapplying settled intro styles while the scene is still arriving.
  function setStyle(node, name, value) {
    const next = String(value);
    if (node.style[name] !== next) node.style[name] = next;
  }
  // Integrate the velocity ramp so pause/resume and frame rate stay consistent.
  function motionTime(time) {
    const t = Math.max(0, time - RUN_AT);
    const u = t / RUN_RAMP;
    return t < RUN_RAMP ? RUN_RAMP * (u * u * u - .5 * u * u * u * u) : t - RUN_RAMP / 2;
  }
  function orbitalPose() {
    const t = reduced.matches ? 1 : clamp(elapsed / INTRO_END);
    // A gentle start, then a long deceleration with no snap or overshoot.
    const progress = 1 - Math.pow(1 - t, 4) * (1 + 4 * t);
    return { scale: .78 + .22 * progress, flattening: .18 + (flattening - .18) * progress, tilt: -10 - 14 * progress };
  }
  function reveal() {
    const time = reduced.matches ? INTRO_END : elapsed;
    const pose = orbitalPose();
    setStyle(svg, 'opacity', .6 + .4 * smooth(time / .5));
    for (const node of sun) setStyle(node, 'opacity', .25 + .75 * smooth(time / .7));
    setStyle(planetLayer, 'opacity', 1);
    for (const planet of planets) setStyle(planet.node, 'opacity', .2 + .8 * smooth(time / .65));
    for (const [index, { node, rx, ry, transform }] of orbitGeometry.entries()) {
      const progress = smoother((time - ARC_AT - index * ARC_STAGGER) / ARC_DURATION);
      const arc = .12 + .88 * progress;
      // Restore the exact static geometry once the opening finishes.
      setAttribute(node, 'rx', time >= INTRO_END ? rx : (rx * pose.scale).toFixed(3));
      setAttribute(node, 'ry', time >= INTRO_END ? ry : (rx * pose.scale * pose.flattening).toFixed(3));
      setAttribute(node, 'transform', time >= INTRO_END ? transform : 'rotate(' + pose.tilt.toFixed(3) + ' 450 350)');
      // Opposing short arcs grow towards each other and quietly close the orbit.
      setStyle(node, 'strokeDasharray', progress >= 1 ? 'none' : (arc / 2).toFixed(5) + ' ' + ((1 - arc) / 2).toFixed(5));
      setStyle(node, 'strokeDashoffset', progress >= 1 ? 0 : (arc / 4).toFixed(5));
      setStyle(node, 'opacity', .2 + .8 * smooth(time / .8));
    }
  }
  function revealLabels() {
    const time = reduced.matches ? LABEL_END : elapsed;
    const leaderProgress = smooth((time - LEADERS_AT) / LEADERS_DURATION);
    setStyle(leaderLayer, 'opacity', Number(leaderProgress.toFixed(3)));
    for (const planet of annotations) {
      setStyle(planet.leader, 'strokeDasharray', leaderProgress >= 1 ? 'none' : '1');
      setStyle(planet.leader, 'strokeDashoffset', Number((1 - leaderProgress).toFixed(4)));
    }
    setStyle(labelLayer, 'opacity', Number(smooth((time - LABELS_AT) / LABEL_DURATION).toFixed(3)));
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
    // The opening plane and orbital motion share active time, so both pause together.
    const motionDelta = motionTime(elapsed) - motionTime(before);
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
    }
    entered = nextEntered;
    render(0);
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
