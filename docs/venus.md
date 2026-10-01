# Venus

Integrated from the user's `E:/solar system/venus/venus_v3.html` project.

- Public entry: `/venus/`. BACK returns to `/#venus`.
- The home page includes a 90vh preview (100vh on phones) between DC and Future, with replayable scroll-entry fades; its renderer loads only near the viewport and pauses when hidden or navigating away.
- `src/scripts/venus/model.js` shares the original sphere, glow and texture between the preview and the interactive project. It uses Three.js r160 and OrbitControls from `public/vendor/three/`, with no CDN or iframe.
- `src/assets/images/venus/venus-surface.jpg` is the lossless extraction of the JPEG embedded in the original `venus-texture.js`; the other project images are copied unchanged. Vite emits hashed media URLs.
- `src/views/Venus.vue` contains the complete planet page. Astronomy scripts are in `src/scripts/venus/`, styles in `src/assets/styles/venus/`. The page starts and releases its renderer through Vue lifecycle hooks.
- `src/components/MusicPlayer.vue` carries the user's playback preference and position across pages. Browser autoplay restrictions may require one interaction to resume playback.

Use `bun run dev` for development, or `bun run build` followed by `bun run preview` to check the static output. Deploy `dist/`; no backend is required.
