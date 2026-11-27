// Look up an image in src/assets by file name, e.g. img('medal.jpg').
// Astro then resizes it and serves modern formats (AVIF/WebP) automatically.
import type { ImageMetadata } from 'astro';

const all = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{jpg,jpeg,png}', { eager: true });

export function img(name: string): ImageMetadata {
  const key = Object.keys(all).find((k) => k.endsWith('/' + name));
  if (!key) throw new Error(`Image not found in src/assets: ${name}`);
  return all[key].default;
}
