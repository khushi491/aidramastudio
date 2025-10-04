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
      basePrompt += ', comic book art style, fantasy comic, bold lines, vibrant colors, magical atmosphere, expressive character design, diverse characters, anthropomorphic elements';
      break;
    case 'comedy':
      basePrompt += ', bright comic book style, cartoon-style, humorous, bold outlines, vibrant colors, exaggerated expressions, diverse character designs, expressive faces';
      break;
    case 'epic':
      basePrompt += ', epic comic book style, heroic comic art, bold lines, dramatic composition, dynamic poses, expressive character reactions';
      break;
    default:
      basePrompt += ', comic book art style, bold lines, vibrant colors, dynamic composition, expressive characters, diverse character designs';
  }
  
  // Add comic book technical specifications inspired by the reference image
  basePrompt += ', comic book panel, bold outlines, vibrant colors, high quality, detailed, professional comic art, Instagram story format, vertical composition, speech bubbles, white dialogue bubbles with black outlines, bold uppercase text, expressive character reactions, clean line art, flat coloring, warm color palette, anthropomorphic characters, fantasy elements, dramatic expressions, comic book lettering, continuous narrative flow, diverse character designs, expressive faces, character emotions, dynamic poses, storytelling composition';
  
  return basePrompt;
}

async function addEpisodeOverlay(imageBuffer: Buffer, caption: string, epNumber: number): Promise<Buffer> {
  // Get the actual dimensions of the Freepik image
  const imageMetadata = await sharp(imageBuffer).metadata();
  const actualWidth = imageMetadata.width || WIDTH;
  const actualHeight = imageMetadata.height || HEIGHT;
  
  console.log(`Freepik image dimensions: ${actualWidth}x${actualHeight}, expected: ${WIDTH}x${HEIGHT}`);
  
  // Create overlay with episode branding - Authentic comic book style with speech bubbles
  const overlaySvg = `
    <svg width="${actualWidth}" height="${actualHeight}" viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.8"/>
        </filter>
        <filter id="episodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
        <filter id="speechBubbleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="1" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      
      <!-- Episode number in corner -->
      <text x="${actualWidth - 100}" y="100" text-anchor="end" fill="#ffffff" font-size="72" font-family="Impact, Arial Black, sans-serif" font-weight="bold" filter="url(#episodeShadow)">Ep ${epNumber}</text>
      
      <!-- Speech bubble for caption -->
      <ellipse cx="${actualWidth/2}" cy="${actualHeight - 180}" rx="${actualWidth/2 - 40}" ry="80" fill="white" stroke="#000000" stroke-width="4" filter="url(#speechBubbleShadow)"/>
      <!-- Speech bubble tail -->
      <polygon points="${actualWidth/2 - 20},${actualHeight - 100} ${actualWidth/2 + 20},${actualHeight - 100} ${actualWidth/2},${actualHeight - 80}" fill="white" stroke="#000000" stroke-width="4"/>
      
      <!-- Caption text in speech bubble -->
      <text x="${actualWidth/2}" y="${actualHeight - 190}" text-anchor="middle" fill="#000000" font-size="42" font-family="Impact, Arial Black, sans-serif" font-weight="bold">
        ${escapeXml(caption.toUpperCase())}
      </text>
      
      <!-- Watermark -->
      <text x="60" y="${actualHeight - 50}" fill="#ffd700" font-size="28" font-family="Arial, sans-serif" font-weight="bold" filter="url(#textShadow)">@drama.studio</text>
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
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.8"/>
        </filter>
        <filter id="episodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
        <filter id="speechBubbleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="1" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      
      <!-- Episode number in corner -->
      <text x="${WIDTH - 100}" y="100" text-anchor="end" fill="#ffffff" font-size="72" font-family="Impact, Arial Black, sans-serif" font-weight="bold" filter="url(#episodeShadow)">Ep ${epNumber}</text>
      
      <!-- Speech bubble for caption -->
      <ellipse cx="${WIDTH/2}" cy="${HEIGHT - 180}" rx="${WIDTH/2 - 40}" ry="80" fill="white" stroke="#000000" stroke-width="4" filter="url(#speechBubbleShadow)"/>
      <!-- Speech bubble tail -->
      <polygon points="${WIDTH/2 - 20},${HEIGHT - 100} ${WIDTH/2 + 20},${HEIGHT - 100} ${WIDTH/2},${HEIGHT - 80}" fill="white" stroke="#000000" stroke-width="4"/>
      
      <!-- Caption text in speech bubble -->
      <text x="${WIDTH/2}" y="${HEIGHT - 190}" text-anchor="middle" fill="#000000" font-size="42" font-family="Impact, Arial Black, sans-serif" font-weight="bold">
        ${escapeXml(caption.toUpperCase())}
      </text>
      
      <!-- Watermark -->
      <text x="60" y="${HEIGHT - 50}" fill="#ffd700" font-size="28" font-family="Arial, sans-serif" font-weight="bold" filter="url(#textShadow)">@drama.studio</text>
      
      <!-- Placeholder text -->
      <text x="${WIDTH/2}" y="${HEIGHT/2}" text-anchor="middle" fill="#666" font-size="32" font-family="Impact, Arial Black, sans-serif" font-weight="bold" filter="url(#textShadow)">
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
          <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.8"/>
          </filter>
          <filter id="episodeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.9"/>
          </filter>
          <filter id="speechBubbleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="1" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        
        <!-- Episode number in corner -->
        <text x="${WIDTH - 100}" y="100" text-anchor="end" fill="#ffffff" font-size="72" font-family="Impact, Arial Black, sans-serif" font-weight="bold" filter="url(#episodeShadow)">Ep ${epNumber}</text>
        
        <!-- Speech bubble for caption -->
        <ellipse cx="${WIDTH/2}" cy="${HEIGHT - 180}" rx="${WIDTH/2 - 40}" ry="80" fill="white" stroke="#000000" stroke-width="4" filter="url(#speechBubbleShadow)"/>
        <!-- Speech bubble tail -->
        <polygon points="${WIDTH/2 - 20},${HEIGHT - 100} ${WIDTH/2 + 20},${HEIGHT - 100} ${WIDTH/2},${HEIGHT - 80}" fill="white" stroke="#000000" stroke-width="4"/>
        
        <!-- Caption text in speech bubble -->
        <text x="${WIDTH/2}" y="${HEIGHT - 190}" text-anchor="middle" fill="#000000" font-size="42" font-family="Impact, Arial Black, sans-serif" font-weight="bold">
          ${escapeXml(caption.toUpperCase())}
        </text>
        
        <!-- Watermark -->
        <text x="60" y="${HEIGHT - 50}" fill="#ffd700" font-size="28" font-family="Arial, sans-serif" font-weight="bold" filter="url(#textShadow)">@drama.studio</text>
        
        <!-- Placeholder text -->
        <text x="${WIDTH/2}" y="${HEIGHT/2}" text-anchor="middle" fill="#666" font-size="32" font-family="Impact, Arial Black, sans-serif" font-weight="bold" filter="url(#textShadow)">
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
