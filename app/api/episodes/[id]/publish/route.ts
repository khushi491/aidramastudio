import { NextRequest } from 'next/server';
import { publishInputSchema } from '@/lib/utils/validators';
import { logger } from '@/lib/utils/logger';
import { createImageContainer, createCarouselContainer, createReelContainer, publishContainer } from '@/lib/instagram/publish';
import { getDb, media, igPublish, episodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const json = await req.json();
    const input = publishInputSchema.parse(json);
    const mock = process.env.MOCK_MODE === 'true';
    if (mock) {
      logger.info('MOCK publish', { id, input });
      return new Response(
        JSON.stringify({ carouselId: `mock_car_${id}`, reelId: `mock_reel_${id}`, permalinks: [] }),
        { status: 200 }
      );
    }
    const db = getDb();
    const assets = await db.select().from(media).where(eq(media.episodeId, id));
    const panels = assets.filter(a => a.type === 'panel').map(a => a.url);
    const trailer = assets.find(a => a.type === 'trailer')?.url;
    const ep = (await db.select().from(episodes).where(eq(episodes.id, id))).at(0);
    const captions: string[] = ep?.captionsJson ? JSON.parse(ep.captionsJson) : [];
    const script = ep?.scriptJson ? JSON.parse(ep.scriptJson) : { episodeTitle: '' };
    const caption = `${ep?.seriesId} – Ep ${ep?.number}: ${script.episodeTitle}\n${ep?.synopsis}\n#AI #Series #NYC #Fantasy #Hackathon`;

    let carouselId: string | undefined;
    let reelId: string | undefined;
    if (input.publishCarousel && panels.length) {
      const children: string[] = [];
      for (const url of panels) {
        children.push(await createImageContainer(url));
      }
      carouselId = await createCarouselContainer(children, caption);
      await publishContainer(carouselId);
    }
    if (input.publishReel && trailer) {
      reelId = await createReelContainer(trailer, caption);
      await publishContainer(reelId);
    }
    await db.insert(igPublish).values({ episodeId: id, carouselId, reelId, caption });
    return new Response(JSON.stringify({ carouselId, reelId }), { status: 200 });
  } catch (err: any) {
    logger.error('publish failed', { error: String(err) });
    return new Response(JSON.stringify({ error: 'Publish failed' }), { status: 400 });
  }
}



