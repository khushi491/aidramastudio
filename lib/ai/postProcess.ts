import { EpisodeAI } from './generateEpisode';

export function mergeWithPriorSynopsis(current: EpisodeAI, prior?: string): EpisodeAI {
  if (!prior) return current;
  const prefix = prior.endsWith('.') ? prior : prior + '.';
  return { ...current, synopsis: `${prefix} ${current.synopsis}` };
}

export function ensureCaptionsLength(captions: string[]): string[] {
  return captions.map((c) => (c.length > 140 ? c.slice(0, 137) + '...' : c));
}



