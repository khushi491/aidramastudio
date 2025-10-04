import OpenAI from 'openai';
import { z } from 'zod';
import { EpisodeInput } from '@/lib/utils/validators';

export const EpisodeSchema = z.object({
  episodeTitle: z.string(),
  synopsis: z.string(),
  beats: z.array(z.string()).min(6).max(10),
  dialogs: z.array(
    z.object({
      character: z.string(),
      line: z.string().max(140),
      mood: z.string().optional(),
    })
  ).optional().default([]),
  captions: z.array(z.string().max(140)).length(6),
  relationships: z.array(
    z.object({ a: z.string(), b: z.string(), type: z.string() })
  ).optional().default([]),
  cliffhanger: z.string(),
});

export type EpisodeAI = z.infer<typeof EpisodeSchema>;

function buildPrompt(input: EpisodeInput, priorSynopsis?: string) {
  const poll = input.audiencePollDecision ? `Audience poll decision: ${input.audiencePollDecision}` : '';
  const prior = priorSynopsis ? `Prior synopsis: ${priorSynopsis}` : 'Prior synopsis: None';
  return `System: You are a showrunner for a serialized fantasy drama. Produce tight, visual, episodic writing with cliffhangers.
User:
Series: ${input.seriesTitle}
Theme: ${input.theme}
Tone: ${input.tone}
Setting: ${input.setting}
Characters: ${input.characters}
Language: ${input.language}
Episode Number: ${input.episodeNumber}
${poll}
${prior}

Output strictly JSON with this schema:
{
  "episodeTitle": "string",
  "synopsis": "3-4 sentences",
  "beats": ["6-10 bullet points"],
  "dialogs": [{"character": "name", "line": "≤140 chars", "mood": "angry|romantic|scheming"}],
  "captions": ["6 strings, ≤140 chars each, compelling, spoiler-light"],
  "relationships": [{"a":"name","b":"name","type":"ally|enemy|secret"}],
  "cliffhanger": "1-2 sentences"
}`;
}

export async function generateEpisode(input: EpisodeInput, priorSynopsis?: string): Promise<EpisodeAI> {
  const apiKey = process.env.OPENAI_API_KEY;
  const mockMode = process.env.MOCK_MODE === 'true';
  
  if (!apiKey) {
    if (mockMode) {
      // Fallback deterministic mock when in mock mode
      return EpisodeSchema.parse({
        episodeTitle: `Ep ${input.episodeNumber}: The Iron Turnstile`,
        synopsis: 'In the Subway Kingdom, a missing metro key ignites rivalries and uneasy alliances.',
        beats: ['Inciting incident', 'Investigation begins', 'Secret revealed', 'Chase in tunnels', 'Betrayal at the platform', 'Cliffhanger at the terminal'],
        dialogs: [],
        captions: ['A key goes missing', 'Whispers in the tunnels', 'Allies or enemies?', 'A chase begins', 'Betrayal surfaces', 'The final stop...'],
        relationships: [],
        cliffhanger: 'The express lights flicker—and a familiar silhouette returns.',
      });
    } else {
      throw new Error('OPENAI_API_KEY is required for AI generation. Please add your OpenAI API key to .env.local or set MOCK_MODE=true for testing.');
    }
  }
  const client = new OpenAI({ apiKey });
  const prompt = buildPrompt(input, priorSynopsis);
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a showrunner for a serialized fantasy drama. Produce tight, visual, episodic writing with cliffhangers.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 900,
  });
  const raw = completion.choices?.[0]?.message?.content ?? '{}';
  // Attempt to extract JSON
  const jsonText = raw.trim().replace(/^```json\n?|\n?```$/g, '');
  let parsed: unknown;
  try { parsed = JSON.parse(jsonText); } catch { parsed = {}; }
  // Validate and coerce
  return EpisodeSchema.parse(parsed);
}



