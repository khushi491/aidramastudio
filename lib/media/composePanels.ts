import sharp from 'sharp';
import { saveBuffer } from './storage';

const WIDTH = 1080;
const HEIGHT = 1350;

export async function composePanels(episodeId: string, captions: string[], epNumber: number): Promise<string[]> {
  const urls: string[] = [];
  // Generate all 6 panels for the episode
  for (let i = 0; i < 6; i++) {
    const caption = captions[i] ?? `Panel ${i + 1}`;
    // Simple placeholder panel with dark background and overlay, no external assets to avoid network
    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0a0a0a"/>
            <stop offset="100%" stop-color="#1f1f1f"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <rect x="40" y="${HEIGHT - 260}" width="${WIDTH - 80}" height="200" rx="16" fill="rgba(0,0,0,0.55)" />
        <text x="${WIDTH - 120}" y="80" text-anchor="end" fill="#ffffff" font-size="44" font-family="Inter, sans-serif">Ep ${epNumber}</text>
        <text x="70" y="${HEIGHT - 200}" fill="#ffffff" font-size="38" font-family="Inter, sans-serif">
          ${escapeXml(caption)}
        </text>
        <text x="70" y="${HEIGHT - 40}" fill="#a1a1aa" font-size="22" font-family="Inter, sans-serif">@drama.studio</text>
      </svg>
    `;
    const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
    const url = saveBuffer(episodeId, `ep-${episodeId}-p${i + 1}.jpg`, buf);
    urls.push(url);
  }
  return urls;
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



