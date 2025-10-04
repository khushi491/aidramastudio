import fs from 'node:fs';
import path from 'node:path';

export interface SubtitleOptions {
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  position?: 'bottom' | 'center' | 'top';
  outline?: boolean;
  outlineColor?: string;
}

export class SubtitleService {
  private defaultOptions: SubtitleOptions = {
    fontSize: 24,
    fontColor: 'white',
    backgroundColor: 'black@0.7',
    position: 'bottom',
    outline: true,
    outlineColor: 'black'
  };

  generateSRT(episodeId: string, captions: string[], durationPerCaption: number = 4): string {
    const srtContent: string[] = [];
    
    captions.forEach((caption, index) => {
      const startTime = index * durationPerCaption;
      const endTime = (index + 1) * durationPerCaption;
      
      srtContent.push(`${index + 1}`);
      srtContent.push(`${this.formatTime(startTime)} --> ${this.formatTime(endTime)}`);
      srtContent.push(caption);
      srtContent.push(''); // Empty line between subtitles
    });
    
    const srtPath = path.join('/tmp', `ep-${episodeId}-subtitles.srt`);
    fs.writeFileSync(srtPath, srtContent.join('\n'));
    
    return srtPath;
  }

  generateASS(episodeId: string, captions: string[], durationPerCaption: number = 4, options: SubtitleOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    
    const assHeader = `[Script Info]
Title: Drama Series Episode ${episodeId}
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,${opts.fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

    const assContent: string[] = [assHeader];
    
    captions.forEach((caption, index) => {
      const startTime = index * durationPerCaption;
      const endTime = (index + 1) * durationPerCaption;
      
      const startTimeFormatted = this.formatTimeASS(startTime);
      const endTimeFormatted = this.formatTimeASS(endTime);
      
      // Create styled text with outline
      const styledText = opts.outline 
        ? `{\\1c&H${this.colorToHex(opts.fontColor)}&\\3c&H${this.colorToHex(opts.outlineColor)}&\\3a&H80&}${caption}`
        : `{\\1c&H${this.colorToHex(opts.fontColor)}&}${caption}`;
      
      assContent.push(`Dialogue: 0,${startTimeFormatted},${endTimeFormatted},Default,,0,0,0,,${styledText}`);
    });
    
    const assPath = path.join('/tmp', `ep-${episodeId}-subtitles.ass`);
    fs.writeFileSync(assPath, assContent.join('\n'));
    
    return assPath;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  }

  private formatTimeASS(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  private colorToHex(color: string): string {
    const colorMap: Record<string, string> = {
      'white': 'FFFFFF',
      'black': '000000',
      'red': 'FF0000',
      'green': '00FF00',
      'blue': '0000FF',
      'yellow': 'FFFF00',
      'cyan': '00FFFF',
      'magenta': 'FF00FF'
    };
    
    return colorMap[color.toLowerCase()] || 'FFFFFF';
  }
}

export function getSubtitleService(): SubtitleService {
  return new SubtitleService();
}
