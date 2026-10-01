
export function initMarsMusic(scope) {
(() => {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  const toggle = document.getElementById('music-toggle');
  const preferenceKey = 'site.music.mainEnabled';
  const positionKey = 'site.music.mars.time';
  const targetVolume = 0.4;
  const firstFadeSeconds = 2.4;
  const loopCrossfadeSeconds = 4;
  const get = key => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const set = (key, value) => { try { sessionStorage.setItem(key, value); } catch {} };

  const partner = audio.cloneNode(false);
  partner.removeAttribute('id');
  partner.setAttribute('aria-hidden', 'true');
  partner.preload = 'none';
  partner.hidden = true;
  document.body.append(partner);

  audio.loop = true;
  partner.loop = true;
  let current = audio;
  let next = partner;
  let enabled = get(preferenceKey) === '1';
  let playing = false;
  let starting = false;
  let resumePending = false;
  let firstStart = true;
  let crossfading = false;
  let volumeFrame = 0;
  let crossfadeFrame = 0;
  scope.onDispose(() => {
    savePosition();
    playing = false;
    current.pause();
    next.pause();
    partner.remove();
    document.documentElement.classList.remove('music-playing');
  });

  function updateIcon() {
    if (!scope.active) return;
    document.documentElement.classList.toggle('music-playing', playing);
    toggle?.setAttribute('aria-pressed', String(playing));
  }

  function savePosition() {
    if (Number.isFinite(current.currentTime) && current.currentTime > 0) {
      set(positionKey, String(current.currentTime));
    }
  }

  function restorePosition() {
    const saved = Number(get(positionKey));
    if (!Number.isFinite(saved) || saved <= 0) return;
    const apply = () => {
      const safeEnd = Number.isFinite(current.duration)
        ? Math.max(0, current.duration - loopCrossfadeSeconds - 0.25)
        : saved;
      try { current.currentTime = Math.min(saved, safeEnd); } catch {}
    };
    if (current.readyState) apply();
    else scope.listen(current, 'loadedmetadata', apply, { once: true });
    const syncPartner = () => { try { next.currentTime = current.currentTime; } catch {} };
    if (next.readyState) syncPartner();
    else scope.listen(next, 'loadedmetadata', syncPartner, { once: true });
  }

  function fadeVolume(element, to, seconds) {
    scope.cancelAnimationFrame(volumeFrame);
    const from = element.volume;
    const start = performance.now();
    const duration = Math.max(1, seconds * 1000);
    const step = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = progress * progress * (3 - 2 * progress);
      element.volume = from + (to - from) * eased;
      if (progress < 1 && playing && !crossfading) volumeFrame = scope.requestAnimationFrame(step);
    };
    volumeFrame = scope.requestAnimationFrame(step);
  }

  function finishCrossfade() {
    const outgoing = current;
    outgoing.volume = 0;
    current = next;
    next = outgoing;
    current.volume = targetVolume;
    crossfading = false;
  }

  async function startCrossfade() {
    if (!playing || crossfading || !Number.isFinite(current.duration)) return;
    crossfading = true;
    scope.cancelAnimationFrame(volumeFrame);
    next.preload = 'auto';
    next.muted = false;
    next.volume = 0;
    try { next.currentTime = 0; } catch {}
    if (next.paused) try {
      await next.play();
      if (!scope.active) { current.pause(); next.pause(); return; }
    } catch {
      crossfading = false;
      current.volume = targetVolume;
      return;
    }

    const remaining = Math.max(0.25, current.duration - current.currentTime);
    const duration = Math.min(loopCrossfadeSeconds, remaining) * 1000;
    const start = performance.now();
    const mix = now => {
      if (!playing || !crossfading) return;
      const progress = Math.min(1, (now - start) / duration);
      const angle = progress * Math.PI / 2;
      current.volume = targetVolume * Math.cos(angle);
      next.volume = targetVolume * Math.sin(angle);
      if (progress < 1) crossfadeFrame = scope.requestAnimationFrame(mix);
      else finishCrossfade();
    };
    crossfadeFrame = scope.requestAnimationFrame(mix);
  }

  function monitorLoop() {
    if (!playing || crossfading || !Number.isFinite(current.duration)) return;
    const remaining = current.duration - current.currentTime;
    if (remaining > 0 && remaining <= loopCrossfadeSeconds + 0.12) startCrossfade();
  }

  function stopPlayback() {
    savePosition();
    playing = false;
    resumePending = false;
    crossfading = false;
    scope.cancelAnimationFrame(volumeFrame);
    scope.cancelAnimationFrame(crossfadeFrame);
    current.pause();
    next.pause();
    current.volume = 0;
    next.volume = 0;
    try { next.currentTime = 0; } catch {}
    updateIcon();
  }

  async function startPlayback({ restore = true } = {}) {
    if (playing || starting || !scope.active) return;
    starting = true;
    current.muted = false;
    next.muted = false;
    current.volume = 0;
    next.volume = 0;
    next.preload = 'auto';
    if (restore) restorePosition();
    try {
      await Promise.all([current.play(), next.play()]);
      if (!scope.active) { current.pause(); next.pause(); return; }
      playing = true;
      resumePending = false;
      updateIcon();
      fadeVolume(current, targetVolume, firstStart ? firstFadeSeconds : 0.4);
      firstStart = false;
    } catch {
      current.pause();
      next.pause();
      resumePending = enabled;
      updateIcon();
    } finally {
      starting = false;
    }
  }

  scope.listen(toggle, 'click', () => {
    if (!playing) {
      enabled = true;
      set(preferenceKey, '1');
      startPlayback();
    } else {
      enabled = false;
      set(preferenceKey, '0');
      stopPlayback();
    }
  });

  ['pointerdown', 'keydown'].forEach(type => scope.listen(document, type, event => {
    if (resumePending && !toggle?.contains(event.target)) startPlayback();
  }, { passive: true }));

  scope.setInterval(() => {
    monitorLoop();
    if (playing) savePosition();
  }, 200);

  scope.listen(window, 'pagehide', () => {
    savePosition();
    playing = false;
    crossfading = false;
    scope.cancelAnimationFrame(volumeFrame);
    scope.cancelAnimationFrame(crossfadeFrame);
    current.pause();
    next.pause();
  });

  scope.listen(window, 'pageshow', () => {
    enabled = get(preferenceKey) === '1';
    if (enabled) startPlayback();
  });
  // SPA route entry does not emit the browser's pageshow event.
  if (enabled) startPlayback();
})();
}
