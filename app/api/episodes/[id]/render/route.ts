import { NextRequest } from 'next/server';
import { getDb, episodes, media } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';
import { composePanels } from '@/lib/media/composePanels';
import { composePanelsWithFreepik } from '@/lib/media/composePanelsFreepik';
import { renderTrailer } from '@/lib/media/renderTrailer';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const ep = (await db.select().from(episodes).where(eq(episodes.id, id))).at(0);
    const captions: string[] = ep?.captionsJson ? JSON.parse(ep.captionsJson) : new Array(6).fill('Panel');
    
    // Try Freepik first, fallback to placeholder if not configured
    let panelUrls: string[];
    try {
      const scriptData = ep?.scriptJson ? JSON.parse(ep.scriptJson) : {};
      panelUrls = await composePanelsWithFreepik(id, captions, ep?.number ?? 1, scriptData);
    } catch (error) {
      logger.warn('Freepik generation failed, using fallback', { error: String(error) });
      panelUrls = await composePanels(id, captions, ep?.number ?? 1);
    }
    const panelPaths = panelUrls.map(u => u.replace(process.env.MEDIA_BASE_URL || 'http://localhost:3000', process.cwd() + '/public'));
    const scriptData = ep?.scriptJson ? JSON.parse(ep.scriptJson) : {};
    const hook = ep?.hook || '';
    const trailerUrl = await renderTrailer(id, panelPaths, hook, scriptData);

    for (const url of panelUrls) {
      await db.insert(media).values({ episodeId: id, type: 'panel', url, width: 1080, height: 1350 });
    }
    await db.insert(media).values({ episodeId: id, type: 'trailer', url: trailerUrl, width: 1080, height: 1920, durationSec: 18 });

    return new Response(JSON.stringify({ panels: panelUrls, trailer: trailerUrl }), { status: 200 });
  } catch (err: any) {
    logger.error('render episode failed', { error: String(err) });
    return new Response(JSON.stringify({ error: 'Render failed' }), { status: 500 });
  }
}



