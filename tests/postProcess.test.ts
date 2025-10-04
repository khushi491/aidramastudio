import { describe, it, expect } from 'vitest';
import { ensureCaptionsLength, mergeWithPriorSynopsis } from '@/lib/ai/postProcess';

describe('postProcess', () => {
  it('trims captions to 140 chars', () => {
    const input = ['a'.repeat(200)];
    const out = ensureCaptionsLength(input);
    expect(out[0].length).toBe(140);
  });
  it('merges prior synopsis', () => {
    const out = mergeWithPriorSynopsis({ episodeTitle: '', synopsis: 'Now', beats: ['a','b','c','d','e','f'], dialogs: [], captions: ['','','','','',''], relationships: [], cliffhanger: '' }, 'Before');
    expect(out.synopsis.startsWith('Before')).toBe(true);
  });
});



