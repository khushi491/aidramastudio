import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'node:path';
import { moveTempFile } from './storage';
import fs from 'node:fs';

// Use system ffmpeg if available, otherwise fall back to ffmpeg-static
const systemFfmpeg = '/usr/local/bin/ffmpeg';
if (fs.existsSync(systemFfmpeg)) {
  ffmpeg.setFfmpegPath(systemFfmpeg);
} else if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

export async function renderTrailer(episodeId: string, panelPaths: string[], hook: string): Promise<string> {
  // For hackathon MVP: generate a simple slideshow using the panels
  const tmpOut = path.join('/tmp', `ep-${episodeId}-trailer.mp4`);
  
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();
    panelPaths.forEach((p) => cmd.input(p).loop(3));
    cmd
      .videoCodec('libx264')
      .outputOptions([
        '-r 30',
        '-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
        '-pix_fmt yuv420p',
        '-shortest'
      ])
      .on('end', () => {
        const url = moveTempFile(episodeId, tmpOut, `ep-${episodeId}-trailer.mp4`);
        resolve(url);
      })
      .on('error', (err) => reject(err))
      .save(tmpOut);
  });
}



