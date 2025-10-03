import { NextRequest } from 'next/server';
import { publishInputSchema } from '@/lib/utils/validators';
import { logger } from '@/lib/utils/logger';

export const runtime = 'edge';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const json = await req.json();
    const input = publishInputSchema.parse(json);
    const mock = process.env.MOCK_MODE !== 'false';
    if (mock) {
      logger.info('MOCK publish', { id, input });
      return new Response(
        JSON.stringify({ carouselId: `mock_car_${id}`, reelId: `mock_reel_${id}`, permalinks: [] }),
        { status: 200 }
      );
    }
    // Real IG integration will be wired in lib/instagram/publish
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    logger.error('publish failed', { error: String(err) });
    return new Response(JSON.stringify({ error: 'Publish failed' }), { status: 400 });
  }
}


