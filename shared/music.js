(() => {
  const audio = document.getElementById('bg-music');
  if (!audio) return;
  const terminal = document.body.dataset.page === 'terminal';
  const toggle = document.getElementById('music-toggle');
  const preference = 'site.music.mainEnabled';
  const position = 'site.music.time';
  const get = (key) => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const set = (key, value) => { try { sessionStorage.setItem(key, value); } catch {} };
  let mainEnabled = get(preference) === '1';
  let resumePending = false;

  function savePosition() {
    if (Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
      set(position, String(audio.currentTime));
    }
  }
  function restorePosition() {
    const time = Number(get(position));
    if (Number.isFinite(time) && time > 0) {
      try { audio.currentTime = time; } catch {}
    }
  }
  function updateIcon() {
    document.documentElement.classList.toggle('music-playing', !audio.paused);
    toggle?.setAttribute('aria-pressed', String(!audio.paused));
  }
  async function play() {
    audio.volume = 0.4;
    audio.muted = false;
    try {
      await audio.play();
      resumePending = false;
    } catch {
      // Browsers can require a new gesture after a full page navigation.
      resumePending = !terminal && mainEnabled;
    }
  }
  toggle?.addEventListener('click', () => {
    if (audio.paused) {
      mainEnabled = true;
      set(preference, '1');
      restorePosition();
      play();
    } else {
      mainEnabled = false;
      resumePending = false;
      set(preference, '0');
      savePosition();
      audio.pause();
    }
  });
  ['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, event => {
    if (resumePending && !toggle?.contains(event.target)) play();
  }, { passive: true }));
  audio.addEventListener('play', updateIcon);
  audio.addEventListener('pause', updateIcon);
  setInterval(() => { if (!audio.paused) savePosition(); }, 2000);
  window.addEventListener('pagehide', () => {
    savePosition();
    audio.pause();
  });
  window.addEventListener('pageshow', () => {
    mainEnabled = get(preference) === '1';
    if (!terminal && mainEnabled) {
      restorePosition();
      play();
    }
  });
  window.SiteMusic = {
    startTerminal() {
      if (!terminal) return;
      restorePosition();
      play();
    }
  };
})();
