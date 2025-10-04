import { NextRequest } from 'next/server';
import { episodeInputSchema } from '@/lib/utils/validators';
import { getDb, episodes } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';
import { generateEpisode } from '@/lib/ai/generateEpisode';
import { mergeWithPriorSynopsis, ensureCaptionsLength } from '@/lib/ai/postProcess';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const json = await req.json();
    const input = episodeInputSchema.parse(json);
    // Pull prior synopsis if available (simple query by seriesId + number-1)
    const db = getDb();
    let priorSynopsis: string | undefined;
    try {
      const prior = await db.execute<any>(`select synopsis from Episode where seriesId = ? and number = ? limit 1`, [input.seriesTitle, input.episodeNumber - 1]);
      if ((prior as any)?.rows?.[0]?.synopsis) priorSynopsis = (prior as any).rows[0].synopsis as string;
    } catch {}

    const ai = await generateEpisode(input, priorSynopsis);
    const merged = mergeWithPriorSynopsis(ai, priorSynopsis);
    merged.captions = ensureCaptionsLength(merged.captions);

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
        scriptJson: JSON.stringify(merged),
        captionsJson: JSON.stringify(merged.captions),
        synopsis: merged.synopsis,
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
          scriptJson: JSON.stringify(merged),
          captionsJson: JSON.stringify(merged.captions),
          synopsis: merged.synopsis,
        },
      });

    return new Response(JSON.stringify({ id, ...input, script: merged }), { status: 200 });
  } catch (err: any) {
    logger.error('generate episode failed', { error: String(err) });
    return new Response(JSON.stringify({ error: 'Invalid input or server error' }), { status: 400 });
  }
}



