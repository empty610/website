<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import MusicButton from './MusicButton.vue';

const props = defineProps({ track: { type: String, required: true }, terminal: Boolean });
const audio = ref(null);
const playing = ref(false);
const preference = 'site.music.mainEnabled';
const position = 'site.music.time';
const listeners = [];
let mainEnabled = false;
let resumePending = false;
let interval;
let terminalApi;
const get = key => { try { return sessionStorage.getItem(key); } catch { return null; } };
const set = (key, value) => { try { sessionStorage.setItem(key, value); } catch {} };
function listen(target, event, handler, options) {
  target.addEventListener(event, handler, options);
  listeners.push(() => target.removeEventListener(event, handler, options));
}
function savePosition() {
  if (audio.value && Number.isFinite(audio.value.currentTime) && audio.value.currentTime > 0) {
    set(position, String(audio.value.currentTime));
  }
}
function restorePosition() {
  const time = Number(get(position));
  if (Number.isFinite(time) && time > 0) {
    try { audio.value.currentTime = time; } catch {}
  }
}
function updateIcon() {
  playing.value = !audio.value.paused;
  document.documentElement.classList.toggle('music-playing', playing.value);
}
async function play() {
  audio.value.volume = 0.4;
  try { await audio.value.play(); resumePending = false; }
  catch { resumePending = !props.terminal && mainEnabled; }
}
function toggle() {
  if (audio.value.paused) {
    mainEnabled = true;
    set(preference, '1');
    restorePosition();
    play();
  } else {
    mainEnabled = false;
    resumePending = false;
    set(preference, '0');
    savePosition();
    audio.value.pause();
  }
}
function resume() {
  mainEnabled = get(preference) === '1';
  if (!props.terminal && mainEnabled) { restorePosition(); play(); }
}
onMounted(() => {
  listen(audio.value, 'play', updateIcon);
  listen(audio.value, 'pause', updateIcon);
  for (const type of ['pointerdown', 'keydown']) {
    listen(document, type, event => {
      if (resumePending && !event.target.closest('#music-toggle')) play();
    }, { passive: true });
  }
  listen(window, 'pagehide', () => { savePosition(); audio.value.pause(); });
  listen(window, 'pageshow', resume);
  interval = window.setInterval(() => { if (!audio.value.paused) savePosition(); }, 2000);
  terminalApi = { startTerminal() { if (props.terminal) { restorePosition(); play(); } } };
  window.SiteMusic = terminalApi;
  resume();
});
onBeforeUnmount(() => {
  savePosition();
  listeners.forEach(dispose => dispose());
  clearInterval(interval);
  audio.value.pause();
  document.documentElement.classList.remove('music-playing');
  if (window.SiteMusic === terminalApi) delete window.SiteMusic;
});
</script>

<template>
  <audio id="bg-music" ref="audio" :src="track" loop preload="none" hidden></audio>
  <MusicButton :playing="playing" @toggle="toggle" />
</template>
