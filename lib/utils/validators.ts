import { z } from 'zod';

export const episodeInputSchema = z.object({
  seriesTitle: z.string().min(2).max(100),
  theme: z.string().min(2).max(100),
  tone: z.enum(['fantasy', 'comedy', 'epic']).default('fantasy'),
  setting: z.string().min(2).max(120),
  characters: z.string().min(2).max(500),
  language: z.string().default('en'),
  episodeNumber: z.coerce.number().int().min(1),
  audiencePollDecision: z.string().max(300).optional().nullable(),
});

export const publishInputSchema = z.object({
  publishCarousel: z.boolean().default(true),
  publishReel: z.boolean().default(true),
});

export type EpisodeInput = z.infer<typeof episodeInputSchema>;
export type PublishInput = z.infer<typeof publishInputSchema>;



