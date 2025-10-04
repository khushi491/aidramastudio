import sharp from 'sharp';
import { saveBuffer } from './storage';
import { getFreepikService } from '../freepik/freepikService';

const WIDTH = 1080;
const HEIGHT = 1350;

export async function composePanelsWithFreepik(episodeId: string, captions: string[], epNumber: number, scriptData: Record<string, unknown>): Promise<string[]> {
  const freepikService = getFreepikService();
  
  if (!freepikService) {
    console.warn('Freepik API key not configured, falling back to placeholder images');
    return composePanelsFallback(episodeId, captions, epNumber);
  }

  const urls: string[] = [];
  
  // Generate all 6 panels for the episode
  for (let i = 0; i < 6; i++) {
    const caption = captions[i] ?? `Panel ${i + 1}`;
    
    try {
      // Create a detailed prompt for Freepik
      const prompt = createFreepikPrompt(caption, scriptData, i);
      
      // Generate image with Freepik
      const imageUrl = await freepikService.generateImage({
        prompt,
        aspect_ratio: 'social_post_4_5', // 4:5 aspect ratio for Instagram posts
        style: 'cartoon',
        quality: 'high'
      });
      
      console.log(`Generated image URL for panel ${i + 1}:`, imageUrl);
      
      if (!imageUrl) {
        throw new Error('No image URL returned from Freepik');
      }
      
      // Download the generated image
      const imageBuffer = await freepikService.downloadImage(imageUrl);
      
      // Add episode branding overlay
      const finalBuffer = await addEpisodeOverlay(imageBuffer, caption, epNumber);
      
      // Save the final image
      const url = saveBuffer(episodeId, `ep-${episodeId}-p${i + 1}.jpg`, finalBuffer);
      urls.push(url);
      
    } catch (error) {
      console.error(`Failed to generate panel ${i + 1} with Freepik:`, error);
      // Fallback to placeholder for this panel
      const fallbackUrl = await createFallbackPanel(episodeId, caption, epNumber, i);
      urls.push(fallbackUrl);
    }
  }
  
  return urls;
}

function createFreepikPrompt(caption: string, scriptData: any, panelIndex: number): string {
  const { episodeTitle, setting, characters, tone } = scriptData;
  
  // Extract character names from the characters string
  const characterNames = characters ? characters.split(',').map((c: string) => c.trim().split(' ')[0]) : [];
  
  // Create a comic book style prompt based on the episode context
  let basePrompt = `Comic book panel: ${caption}`;
  
  if (setting) {
    basePrompt += `, set in ${setting}`;
  }
  
  if (characterNames.length > 0) {
    basePrompt += `, featuring ${characterNames.join(' and ')}`;
  }
  
  // Add tone-specific comic book styling
  switch (tone) {
    case 'fantasy':
      basePrompt += ', comic book art style, fantasy comic, bold lines, vibrant colors, magical atmosphere';
      break;
    case 'comedy':
      basePrompt += ', bright comic book style, cartoon-style, humorous, bold outlines, vibrant colors';
      break;
    case 'epic':
      basePrompt += ', epic comic book style, heroic comic art, bold lines, dramatic composition';
      break;
    default:
      basePrompt += ', comic book art style, bold lines, vibrant colors, dynamic composition';
  }
  
  // Add comic book technical specifications
  basePrompt += ', comic book panel, bold outlines, vibrant colors, high quality, detailed, professional comic art, Instagram story format, vertical composition';
  
  return basePrompt;
}

async function addEpisodeOverlay(imageBuffer: Buffer, caption: string, epNumber: number): Promise<Buffer> {
  // Create overlay with episode branding
  const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="${HEIGHT - 260}" width="${WIDTH - 80}" height="200" rx="16" fill="rgba(0,0,0,0.7)" />
      <text x="${WIDTH - 120}" y="80" text-anchor="end" fill="#ffffff" font-size="44" font-family="Inter, sans-serif" font-weight="bold">Ep ${epNumber}</text>
      <text x="70" y="${HEIGHT - 200}" fill="#ffffff" font-size="32" font-family="Inter, sans-serif" font-weight="600">
        ${escapeXml(caption)}
      </text>
      <text x="70" y="${HEIGHT - 40}" fill="#a1a1aa" font-size="22" font-family="Inter, sans-serif">@drama.studio</text>
    </svg>
  `;
  
  const overlayBuffer = await sharp(Buffer.from(overlaySvg)).png().toBuffer();
  
  // Composite the overlay onto the Freepik image
  return await sharp(imageBuffer)
    .composite([{ input: overlayBuffer, blend: 'over' }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function createFallbackPanel(episodeId: string, caption: string, epNumber: number, index: number): Promise<string> {
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
      <text x="${WIDTH/2}" y="${HEIGHT/2}" text-anchor="middle" fill="#666" font-size="24" font-family="Inter, sans-serif" font-weight="bold">
        Comic Book Style - Freepik API not configured
      </text>
    </svg>
  `;
  
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
  return saveBuffer(episodeId, `ep-${episodeId}-p${index + 1}.jpg`, buf);
}

// Fallback function (original implementation)
async function composePanelsFallback(episodeId: string, captions: string[], epNumber: number): Promise<string[]> {
  const urls: string[] = [];
  // Generate all 6 panels for the episode
  for (let i = 0; i < 6; i++) {
    const caption = captions[i] ?? `Panel ${i + 1}`;
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
        <text x="${WIDTH/2}" y="${HEIGHT/2}" text-anchor="middle" fill="#666" font-size="24" font-family="Inter, sans-serif" font-weight="bold">
          Comic Book Style - Placeholder
        </text>
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
