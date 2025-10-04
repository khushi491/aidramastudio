import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'node:path';
import { moveTempFile } from './storage';
import fs from 'node:fs';
import { getFreepikService } from '../freepik/freepikService';
import { getVoiceService } from '../audio/voiceService';
import { getSubtitleService } from './subtitleService';

// Use system ffmpeg if available, otherwise fall back to ffmpeg-static
const systemFfmpeg = '/usr/local/bin/ffmpeg';
if (fs.existsSync(systemFfmpeg)) {
  ffmpeg.setFfmpegPath(systemFfmpeg);
} else if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

export async function renderTrailer(episodeId: string, panelPaths: string[], hook: string, scriptData?: any): Promise<string> {
  const tmpOut = path.join('/tmp', `ep-${episodeId}-trailer.mp4`);
  
  try {
    // Generate cinematic video frames using Freepik
    const cinematicFrames = await generateCinematicFrames(episodeId, panelPaths, scriptData);
    
    // Create audio tracks (voice + background music)
    const audioTracks = await generateAudioTracks(episodeId, hook, scriptData);
    
    // Generate subtitles
    const subtitlePath = await generateSubtitles(episodeId, scriptData);
    
    // Render final cinematic video with subtitles
    return await renderCinematicVideo(episodeId, cinematicFrames, audioTracks, subtitlePath, tmpOut);
  } catch (error) {
    console.error('Cinematic rendering failed, falling back to basic slideshow:', error);
    return renderBasicSlideshow(episodeId, panelPaths, tmpOut);
  }
}

async function generateCinematicFrames(episodeId: string, panelPaths: string[], scriptData?: any): Promise<string[]> {
  const freepikService = getFreepikService();
  
  if (!freepikService) {
    console.warn('Freepik not available, using original panels');
    return panelPaths;
  }

  const cinematicFrames: string[] = [];
  
  for (let i = 0; i < panelPaths.length; i++) {
    try {
      // Create cinematic prompt for video frame
      const prompt = createCinematicPrompt(panelPaths[i], scriptData, i);
      
      // Generate cinematic frame
      const imageUrl = await freepikService.generateImage({
        prompt,
        aspect_ratio: 'film_vertical_9_21', // Perfect for mobile video
        style: 'cinematic',
        quality: 'ultra'
      });
      
      // Download and save cinematic frame
      const imageBuffer = await freepikService.downloadImage(imageUrl);
      const framePath = path.join('/tmp', `ep-${episodeId}-cinematic-${i}.jpg`);
      fs.writeFileSync(framePath, imageBuffer);
      cinematicFrames.push(framePath);
      
    } catch (error) {
      console.error(`Failed to generate cinematic frame ${i}:`, error);
      cinematicFrames.push(panelPaths[i]); // Fallback to original
    }
  }
  
  return cinematicFrames;
}

function createCinematicPrompt(panelPath: string, scriptData: any, frameIndex: number): string {
  const { episodeTitle, setting, characters, tone } = scriptData || {};
  
  let basePrompt = `Cinematic movie frame: ${episodeTitle || 'Drama Series Episode'}`;
  
  if (setting) {
    basePrompt += `, set in ${setting}`;
  }
  
  if (characters) {
    const characterNames = characters.split(',').map((c: string) => c.trim().split(' ')[0]);
    basePrompt += `, featuring ${characterNames.join(' and ')}`;
  }
  
  // Add cinematic styling based on tone
  switch (tone) {
    case 'fantasy':
      basePrompt += ', epic fantasy cinematography, magical atmosphere, dramatic lighting, cinematic composition, movie quality, high production value';
      break;
    case 'comedy':
      basePrompt += ', bright comedy cinematography, vibrant colors, dynamic camera angles, cinematic composition, movie quality';
      break;
    case 'epic':
      basePrompt += ', epic cinematography, dramatic lighting, heroic composition, cinematic scale, movie quality, high production value';
      break;
    default:
      basePrompt += ', cinematic composition, dramatic lighting, movie quality, high production value, professional cinematography';
  }
  
  // Add technical cinematic specifications
  basePrompt += ', cinematic frame, movie quality, professional cinematography, dramatic lighting, film grain, cinematic color grading, high resolution, 4K quality, vertical video format, mobile optimized, Instagram story format, cinematic transitions, movie poster quality';
  
  return basePrompt;
}

async function generateAudioTracks(episodeId: string, hook: string, scriptData?: any): Promise<{ voice?: string; music?: string }> {
  const audioTracks: { voice?: string; music?: string } = {};
  
  try {
    // Generate voice narration for the hook
    const voicePath = await generateVoiceNarration(episodeId, hook);
    if (voicePath) {
      audioTracks.voice = voicePath;
    }
    
    // Generate background music based on tone
    const musicPath = await generateBackgroundMusic(episodeId, scriptData);
    if (musicPath) {
      audioTracks.music = musicPath;
    }
  } catch (error) {
    console.error('Audio generation failed:', error);
  }
  
  return audioTracks;
}

async function generateVoiceNarration(episodeId: string, hook: string): Promise<string | null> {
  const voiceService = getVoiceService();
  
  if (!hook || hook.trim().length === 0) {
    console.log('No hook provided for voice narration');
    return null;
  }
  
  try {
    // Generate voice narration with appropriate emotion
    const voiceOptions = {
      voice: 'narrator',
      emotion: 'dramatic' as const,
      speed: 0.9,
      pitch: 5
    };
    
    const voicePath = await voiceService.generateVoice(hook, voiceOptions);
    
    if (voicePath) {
      console.log(`Generated voice narration for episode ${episodeId}`);
      return voicePath;
    }
  } catch (error) {
    console.error('Voice generation failed:', error);
  }
  
  // Fallback to existing audio
  const existingAudio = path.join(process.cwd(), 'public', 'audio', 'theme.mp3');
  if (fs.existsSync(existingAudio)) {
    return existingAudio;
  }
  
  return null;
}

async function generateBackgroundMusic(episodeId: string, scriptData?: any): Promise<string | null> {
  const { tone } = scriptData || {};
  
  // Select background music based on tone
  let musicFile = 'theme.mp3'; // Default
  
  switch (tone) {
    case 'fantasy':
      musicFile = 'fantasy-theme.mp3';
      break;
    case 'comedy':
      musicFile = 'comedy-theme.mp3';
      break;
    case 'epic':
      musicFile = 'epic-theme.mp3';
      break;
    default:
      musicFile = 'theme.mp3';
  }
  
  const musicPath = path.join(process.cwd(), 'public', 'audio', musicFile);
  
  if (fs.existsSync(musicPath)) {
    console.log(`Using ${tone || 'default'} background music: ${musicFile}`);
    return musicPath;
  }
  
  // Fallback to default theme
  const defaultMusic = path.join(process.cwd(), 'public', 'audio', 'theme.mp3');
  if (fs.existsSync(defaultMusic)) {
    console.log('Using default theme music');
    return defaultMusic;
  }
  
  return null;
}

async function generateSubtitles(episodeId: string, scriptData?: any): Promise<string | null> {
  const subtitleService = getSubtitleService();
  
  try {
    // Extract captions from script data
    const captions = scriptData?.captions || [];
    
    if (captions.length === 0) {
      return null;
    }
    
    // Generate ASS subtitles with cinematic styling
    const subtitleOptions = {
      fontSize: 28,
      fontColor: 'white',
      backgroundColor: 'black@0.7',
      position: 'bottom' as const,
      outline: true,
      outlineColor: 'black'
    };
    
    const subtitlePath = subtitleService.generateASS(episodeId, captions, 4, subtitleOptions);
    console.log(`Generated subtitles for episode ${episodeId}`);
    
    return subtitlePath;
  } catch (error) {
    console.error('Subtitle generation failed:', error);
    return null;
  }
}

async function renderCinematicVideo(episodeId: string, frames: string[], audioTracks: { voice?: string; music?: string }, subtitlePath: string | null, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();
    
    // Add video frames with cinematic effects
    frames.forEach((frame, index) => {
      cmd.input(frame);
      cmd.inputOptions([
        `-loop 1`,
        `-t 4`, // 4 seconds per frame
        `-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black`
      ]);
    });
    
    // Add audio tracks
    if (audioTracks.voice) {
      cmd.input(audioTracks.voice);
    }
    if (audioTracks.music) {
      cmd.input(audioTracks.music);
    }
    
    // Add subtitles if available
    if (subtitlePath && fs.existsSync(subtitlePath)) {
      cmd.input(subtitlePath);
    }
    
    // Create cinematic filter complex
    const filters = [];
    
    // Video filters for cinematic effects
    if (frames.length > 1) {
      // Add crossfade transitions between frames
      for (let i = 0; i < frames.length - 1; i++) {
        if (i === 0) {
          filters.push(`[0:v][1:v]xfade=transition=fade:duration=0.5:offset=3.5[v${i}]`);
        } else {
          filters.push(`[v${i-1}][${i+1}:v]xfade=transition=fade:duration=0.5:offset=3.5[v${i}]`);
        }
      }
      
      // Add final video output with subtitles
      const finalVideo = `v${frames.length - 2}`;
      let videoFilter = `[${finalVideo}]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,unsharp=5:5:0.8:3:3:0.4`;
      
      // Add subtitle filter if subtitles exist
      if (subtitlePath && fs.existsSync(subtitlePath)) {
        const subtitleIndex = frames.length + (audioTracks.voice ? 1 : 0) + (audioTracks.music ? 1 : 0);
        videoFilter += `,ass=${subtitleIndex}:ass`;
      }
      
      filters.push(`${videoFilter}[video]`);
    } else {
      // Single frame with cinematic effects and subtitles
      let videoFilter = `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,unsharp=5:5:0.8:3:3:0.4`;
      
      // Add subtitle filter if subtitles exist
      if (subtitlePath && fs.existsSync(subtitlePath)) {
        const subtitleIndex = frames.length + (audioTracks.voice ? 1 : 0) + (audioTracks.music ? 1 : 0);
        videoFilter += `,ass=${subtitleIndex}:ass`;
      }
      
      filters.push(`${videoFilter}[video]`);
    }
    
    // Audio filters for professional mixing
    if (audioTracks.voice && audioTracks.music) {
      filters.push(
        `[${frames.length}:a]volume=1.0,highpass=f=80,lowpass=f=8000[voice]`,
        `[${frames.length + 1}:a]volume=0.25,highpass=f=200,lowpass=f=5000[music]`,
        `[voice][music]amix=inputs=2:duration=first:weights=1 0.3[audio]`
      );
    } else if (audioTracks.voice) {
      filters.push(`[${frames.length}:a]volume=1.0,highpass=f=80,lowpass=f=8000[audio]`);
    } else if (audioTracks.music) {
      filters.push(`[${frames.length}:a]volume=0.7,highpass=f=200,lowpass=f=5000[audio]`);
    }
    
    // Apply all filters
    if (filters.length > 0) {
      cmd.complexFilter(filters);
    }
    
    // Configure video output with cinematic quality
    const outputOptions = [
      '-r 30',
      '-pix_fmt yuv420p',
      '-crf 16', // Even higher quality
      '-preset slow', // Better compression
      '-profile:v high',
      '-level 4.0',
      '-movflags +faststart', // Optimize for streaming
      '-shortest',
      '-b:a 192k', // Higher audio quality
      '-ac 2',
      '-ar 48000' // Higher sample rate
    ];
    
    // Add mapping options
    if (audioTracks.voice || audioTracks.music) {
      outputOptions.push('-map [video]', '-map [audio]');
    } else {
      outputOptions.push('-map [video]');
    }
    
    cmd
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(outputOptions);
    
    cmd
      .on('end', () => {
        const url = moveTempFile(episodeId, outputPath, `ep-${episodeId}-trailer.mp4`);
        resolve(url);
      })
      .on('error', (err: any) => reject(err))
      .save(outputPath);
  });
}

async function renderBasicSlideshow(episodeId: string, panelPaths: string[], outputPath: string): Promise<string> {
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
        const url = moveTempFile(episodeId, outputPath, `ep-${episodeId}-trailer.mp4`);
        resolve(url);
      })
      .on('error', (err: any) => reject(err))
      .save(outputPath);
  });
}



