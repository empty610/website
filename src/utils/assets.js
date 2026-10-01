// Vite resolves imported media in development and hashes it for production.
// The map also covers filenames selected dynamically by the rover/model UI.
const assets = import.meta.glob('../assets/**/*.{jpg,png,webp,mp3,woff2}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function assetUrl(path) {
  const asset = assets[`../assets/${path}`];
  if (asset) return asset;
  if (!path.startsWith('vendor/') && !path.startsWith('data/')) {
    throw new Error(`Unknown asset: ${path}`);
  }
  return import.meta.env.BASE_URL + path;
}
