import { NextRequest } from 'next/server';
import { episodeInputSchema } from '@/lib/utils/validators';
import { getDb, episodes } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';

export const runtime = 'edge';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const json = await req.json();
    const input = episodeInputSchema.parse(json);
    // Stub AI output until implemented
    const script = {
      episodeTitle: `Episode ${input.episodeNumber}`,
      synopsis: 'A dramatic turn of events unfolds beneath the city.',
      beats: ['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5', 'Beat 6'],
      dialogs: [],
      captions: ['Caption 1', 'Caption 2', 'Caption 3', 'Caption 4', 'Caption 5', 'Caption 6'],
      relationships: [],
      cliffhanger: 'To be continued...'
    };

    const db = getDb();
    await db
      .insert(episodes)
      .values({
        id,
        seriesId: input.seriesTitle,
        number: input.episodeNumber,
        theme: input.theme,
        tone: input.tone,
        setting: input.setting,
        language: input.language,
        scriptJson: JSON.stringify(script),
        captionsJson: JSON.stringify(script.captions),
        synopsis: script.synopsis,
        status: 'draft',
      })
      .onConflictDoUpdate({
        target: episodes.id,
        set: {
          number: input.episodeNumber,
          theme: input.theme,
          tone: input.tone,
          setting: input.setting,
          language: input.language,
          scriptJson: JSON.stringify(script),
          captionsJson: JSON.stringify(script.captions),
          synopsis: script.synopsis,
        },
      });

    return new Response(JSON.stringify({ id, ...input, script }), { status: 200 });
  } catch (err: any) {
    logger.error('generate episode failed', { error: String(err) });
    return new Response(JSON.stringify({ error: 'Invalid input or server error' }), { status: 400 });
  }
}


