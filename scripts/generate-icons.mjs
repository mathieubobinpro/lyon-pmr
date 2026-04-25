/**
 * Génère les icônes PWA (192/256/384/512 + maskable) depuis un SVG source.
 * Usage : node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');

await mkdir(OUT_DIR, { recursive: true });

// SVG source — fond bleu #0066FF, symbole ISA blanc centré
const iconSvg = (size, maskable = false) => {
  const pad = maskable ? size * 0.15 : size * 0.1;
  const inner = size - pad * 2;
  const r = maskable ? size * 0.5 : size * 0.22; // maskable = plein fond, any = coins arrondis
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Fond -->
  <rect width="${size}" height="${size}" rx="${r}" fill="#0066FF"/>
  <!-- Symbole ISA (International Symbol of Access) simplifié, centré -->
  <g transform="translate(${size / 2}, ${size / 2}) scale(${inner / 48})">
    <!-- Tête -->
    <circle cx="0" cy="-17" r="4.5" fill="white"/>
    <!-- Corps et bras -->
    <path d="M-2-11 L-2 4 L-9 12" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <!-- Bras tendu -->
    <path d="M-2-5 L8-2" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <!-- Jambes -->
    <path d="M-2 4 L-6 14 M-2 4 L4 14" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <!-- Roue fauteuil -->
    <circle cx="7" cy="14" r="6" stroke="white" stroke-width="3" fill="none"/>
    <!-- Dossier fauteuil -->
    <path d="M1 6 L1 13 L13 13" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;
};

const sizes = [192, 256, 384, 512];

for (const size of sizes) {
  // Icône standard (any)
  await sharp(Buffer.from(iconSvg(size, false)))
    .png()
    .toFile(path.join(OUT_DIR, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);

  // Icône maskable (192 et 512 seulement — les navigateurs en ont besoin)
  if (size === 192 || size === 512) {
    await sharp(Buffer.from(iconSvg(size, true)))
      .png()
      .toFile(path.join(OUT_DIR, `icon-${size}-maskable.png`));
    console.log(`✓ icon-${size}-maskable.png`);
  }
}

// Favicon SVG (copié dans public/)
import { writeFile } from 'fs/promises';
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0066FF"/>
  <g transform="translate(16,16) scale(0.55)">
    <circle cx="0" cy="-17" r="4.5" fill="white"/>
    <path d="M-2-11 L-2 4 L-9 12" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M-2-5 L8-2" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M-2 4 L-6 14 M-2 4 L4 14" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <circle cx="7" cy="14" r="6" stroke="white" stroke-width="3" fill="none"/>
    <path d="M1 6 L1 13 L13 13" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;
await writeFile(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSvg);
console.log('✓ favicon.svg');

// Placeholder screenshots (fond bleu, texte blanc)
const screenshotSvg = (label) => `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844">
  <rect width="390" height="844" fill="#0066FF"/>
  <text x="195" y="422" font-family="system-ui" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
</svg>`;

const screenshots = [
  ['mobile-map.png',  'Lyon PMR — Carte'],
  ['mobile-list.png', 'Lyon PMR — Liste'],
];

for (const [filename, label] of screenshots) {
  await sharp(Buffer.from(screenshotSvg(label)))
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'screenshots', filename));
  console.log(`✓ screenshots/${filename}`);
}

// Splash screens iOS (fond bleu #0066FF + icône centrée)
const SPLASH_DIR = path.join(__dirname, '..', 'public', 'splash');
await mkdir(SPLASH_DIR, { recursive: true });

const splashSizes = [
  ['splash-750x1334.png',   750,  1334],  // iPhone SE
  ['splash-1170x2532.png', 1170, 2532],  // iPhone 14
  ['splash-1290x2796.png', 1290, 2796],  // iPhone 14 Pro Max
];

for (const [filename, w, h] of splashSizes) {
  const iconSize = Math.round(Math.min(w, h) * 0.28);
  const iconPng = await sharp(Buffer.from(iconSvg(iconSize, false))).png().toBuffer();
  await sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 102, b: 255, alpha: 1 } } })
    .composite([{ input: iconPng, gravity: 'center' }])
    .png()
    .toFile(path.join(SPLASH_DIR, filename));
  console.log(`✓ splash/${filename}`);
}

console.log('\nToutes les icônes générées avec succès !');
