import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const GENERATED_DIR = path.join(PUBLIC_DIR, 'generated');

export function ensureEpisodeDir(episodeId: string): string {
  const dir = path.join(GENERATED_DIR, episodeId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveBuffer(episodeId: string, filename: string, data: Buffer): string {
  const dir = ensureEpisodeDir(episodeId);
  const out = path.join(dir, filename);
  fs.writeFileSync(out, data);
  return publicUrl(episodeId, filename);
}

export function moveTempFile(episodeId: string, tmpPath: string, filename: string): string {
  const dir = ensureEpisodeDir(episodeId);
  const dest = path.join(dir, filename);
  fs.copyFileSync(tmpPath, dest);
  return publicUrl(episodeId, filename);
}

export function publicUrl(episodeId: string, filename: string): string {
  const base = process.env.MEDIA_BASE_URL || 'http://localhost:3000';
  return `${base}/generated/${episodeId}/${filename}`;
}



