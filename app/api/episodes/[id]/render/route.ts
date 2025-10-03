import { NextRequest } from 'next/server';
import { getDb, media } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    // Stub URLs for now; real implementation composes images and trailer
    const base = `/generated/${id}`;
    const panelUrls = Array.from({ length: 6 }).map((_, i) => `${base}/ep-${id}-p${i + 1}.jpg`);
    const trailerUrl = `${base}/ep-${id}-trailer.mp4`;

    const db = getDb();
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


