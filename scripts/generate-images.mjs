// Gera as imagens estáticas de SEO/compartilhamento em /public a partir de SVG.
// Uso: npm run images  (rodar de novo só quando mudar a marca ou a headline da imagem social)
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const FONT = "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const mark = (color, x, y, size, strokeWidth = 11) => `
  <g transform="translate(${x} ${y}) scale(${size / 132})">
    <circle cx="66" cy="66" r="11" fill="${color}" />
    <circle cx="66" cy="66" r="30" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="118 250" transform="rotate(-45 66 66)" fill="none" />
    <circle cx="66" cy="66" r="54" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="212 400" transform="rotate(-45 66 66)" opacity=".45" fill="none" />
  </g>`;

const ogImage = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="85%" cy="100%" r="70%">
      <stop offset="0%" stop-color="#14b8a6" stop-opacity=".28" />
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0f172a" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <g fill="none" stroke="#2dd4bf" stroke-opacity=".14" stroke-width="2">
    <circle cx="1040" cy="520" r="120" />
    <circle cx="1040" cy="520" r="220" />
    <circle cx="1040" cy="520" r="320" />
    <circle cx="1040" cy="520" r="420" />
  </g>
  ${mark('#2DD4BF', 80, 72, 64)}
  <text x="162" y="115" font-family="${FONT}" font-size="40" font-weight="700" fill="#f8fafc">Sonar</text>
  <text x="80" y="236" font-family="${FONT}" font-size="30" font-weight="600" fill="#2dd4bf" letter-spacing="1">ANÁLISE DE LIGAÇÕES DE VENDAS COM IA</text>
  <text font-family="${FONT}" font-size="64" font-weight="700" fill="#ffffff">
    <tspan x="80" y="330">Saiba o que acontece em</tspan>
    <tspan x="80" y="410">cada ligação do seu time</tspan>
  </text>
  <g font-family="${FONT}" font-size="24" font-weight="600">
    <rect x="80" y="478" width="200" height="52" rx="12" fill="#1e293b" stroke="#334155" />
    <text x="180" y="512" text-anchor="middle" fill="#e2e8f0">Nota 0 a 100</text>
    <rect x="296" y="478" width="170" height="52" rx="12" fill="#1e293b" stroke="#334155" />
    <text x="381" y="512" text-anchor="middle" fill="#e2e8f0">Objeções</text>
    <rect x="482" y="478" width="210" height="52" rx="12" fill="#1e293b" stroke="#334155" />
    <text x="587" y="512" text-anchor="middle" fill="#e2e8f0">Concorrentes</text>
    <rect x="708" y="478" width="210" height="52" rx="12" fill="#0d9488" />
    <text x="813" y="512" text-anchor="middle" fill="#ffffff">Feedback 1:1</text>
  </g>
</svg>`;

const squareIcon = (size, padding, background) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${background}" />
  ${mark('#0D9488', padding, padding, size - padding * 2)}
</svg>`;

await mkdir(publicDir, { recursive: true });

await Promise.all([
  sharp(Buffer.from(ogImage)).png({ compressionLevel: 9 }).toFile(`${publicDir}og-image.png`),
  sharp(Buffer.from(squareIcon(180, 28, '#ffffff'))).png().toFile(`${publicDir}apple-touch-icon.png`),
  sharp(Buffer.from(squareIcon(512, 64, '#ffffff'))).png().toFile(`${publicDir}logo.png`),
]);

process.stdout.write('Imagens geradas em public/: og-image.png, apple-touch-icon.png, logo.png\n');
