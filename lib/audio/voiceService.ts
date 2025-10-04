import fs from 'node:fs';
import path from 'node:path';

export interface VoiceOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  emotion?: 'neutral' | 'excited' | 'dramatic' | 'mysterious';
}

export class VoiceService {
  private apiKey?: string;
  private provider: 'freepik' | 'elevenlabs' | 'azure' | 'google' | 'fallback';
  private baseUrl: string;

  constructor() {
    // Check for available TTS services - prioritize Freepik
    if (process.env.FREEPIK_API_KEY) {
      this.provider = 'freepik';
      this.apiKey = process.env.FREEPIK_API_KEY;
      this.baseUrl = process.env.FREEPIK_BASE_URL || 'https://api.freepik.com/v1/ai';
    } else if (process.env.ELEVENLABS_API_KEY) {
      this.provider = 'elevenlabs';
      this.apiKey = process.env.ELEVENLABS_API_KEY;
      this.baseUrl = '';
    } else if (process.env.AZURE_SPEECH_KEY) {
      this.provider = 'azure';
      this.apiKey = process.env.AZURE_SPEECH_KEY;
      this.baseUrl = '';
    } else if (process.env.GOOGLE_TTS_KEY) {
      this.provider = 'google';
      this.apiKey = process.env.GOOGLE_TTS_KEY;
      this.baseUrl = '';
    } else {
      this.provider = 'fallback';
      this.baseUrl = '';
    }
  }

  async generateVoice(text: string, options: VoiceOptions = {}): Promise<string | null> {
    try {
      switch (this.provider) {
        case 'freepik':
          return await this.generateWithFreepik(text, options);
        case 'elevenlabs':
          return await this.generateWithElevenLabs(text, options);
        case 'azure':
          return await this.generateWithAzure(text, options);
        case 'google':
          return await this.generateWithGoogle(text, options);
        default:
          return await this.generateFallback(text, options);
      }
    } catch (error) {
      console.error('Voice generation failed:', error);
      return await this.generateFallback(text, options);
    }
  }

  private async generateWithFreepik(text: string, options: VoiceOptions): Promise<string | null> {
    // Freepik AI Video Generation with voice synthesis
    const voicePrompt = this.createFreepikVoicePrompt(text, options);
    
    const response = await fetch(`${this.baseUrl}/mystic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-freepik-api-key': this.apiKey!
      },
      body: JSON.stringify({
        prompt: voicePrompt,
        aspect_ratio: 'film_vertical_9_21', // Vertical format for mobile
        style: 'cinematic',
        quality: 'high',
        duration: 4, // 4 seconds for voice narration
        voice_enabled: true,
        voice_settings: {
          emotion: options.emotion || 'neutral',
          speed: options.speed || 1.0,
          pitch: options.pitch || 0
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freepik API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const taskData = await response.json();
    if (!taskData.data.task_id) {
      throw new Error(`No task ID returned from Freepik API. Response: ${JSON.stringify(taskData)}`);
    }

    // Poll for completion
    const result = await this.pollForFreepikCompletion(taskData.data.task_id);
    
    // Extract audio from video (Freepik returns video with voice)
    const audioPath = await this.extractAudioFromVideo(result, text);
    
    return audioPath;
  }

  private createFreepikVoicePrompt(text: string, options: VoiceOptions): string {
    const emotion = options.emotion || 'neutral';
    const voice = options.voice || 'narrator';
    
    let prompt = `Cinematic voice narration: "${text}"`;
    
    // Add voice characteristics
    switch (voice) {
      case 'narrator':
        prompt += ', professional narrator voice, clear and authoritative';
        break;
      case 'female':
        prompt += ', female voice, warm and engaging';
        break;
      case 'male':
        prompt += ', male voice, deep and commanding';
        break;
      case 'dramatic':
        prompt += ', dramatic voice, intense and powerful';
        break;
      case 'mysterious':
        prompt += ', mysterious voice, intriguing and suspenseful';
        break;
    }
    
    // Add emotional context
    switch (emotion) {
      case 'excited':
        prompt += ', excited tone, energetic delivery';
        break;
      case 'dramatic':
        prompt += ', dramatic tone, intense emotion';
        break;
      case 'mysterious':
        prompt += ', mysterious tone, intriguing atmosphere';
        break;
      default:
        prompt += ', neutral tone, clear delivery';
    }
    
    prompt += ', high quality audio, professional voice synthesis, cinematic narration';
    
    return prompt;
  }

  private async pollForFreepikCompletion(taskId: string): Promise<string> {
    const maxAttempts = 30;
    const backoffMultiplier = 1.5;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/mystic/${taskId}`, {
          headers: {
            'Accept': 'application/json',
            'x-freepik-api-key': this.apiKey!
          }
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
        }

        const taskData = await response.json();

        if (taskData.data.status === 'COMPLETED' && taskData.data.generated.length > 0) {
          return taskData.data.generated[0];
        }

        if (taskData.data.status === 'FAILED') {
          throw new Error(`Voice generation failed: ${taskData.data.error || 'Unknown error'}`);
        }

        // Wait before next attempt
        const waitTime = Math.min(2000 * Math.pow(backoffMultiplier, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw new Error(`Freepik voice polling failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        const retryWait = Math.min(2000 * Math.pow(backoffMultiplier, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, retryWait));
      }
    }

    throw new Error(`Voice generation timed out after ${maxAttempts} attempts`);
  }

  private async extractAudioFromVideo(videoUrl: string, text: string): Promise<string> {
    try {
      // Download the video
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.status}`);
      }
      
      const videoBuffer = await videoResponse.arrayBuffer();
      const videoPath = path.join('/tmp', `freepik-voice-${Date.now()}.mp4`);
      fs.writeFileSync(videoPath, Buffer.from(videoBuffer));
      
      // Extract audio using ffmpeg
      const audioPath = path.join('/tmp', `freepik-voice-${Date.now()}.mp3`);
      
      return new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const ffmpeg = spawn('ffmpeg', [
          '-i', videoPath,
          '-vn', // No video
          '-acodec', 'mp3',
          '-ab', '128k',
          '-ar', '44100',
          '-y', // Overwrite output file
          audioPath
        ]);
        
        ffmpeg.on('close', (code: number) => {
          // Clean up video file
          try {
            fs.unlinkSync(videoPath);
          } catch (e) {
            console.warn('Failed to delete temporary video file:', e);
          }
          
          if (code === 0) {
            resolve(audioPath);
          } else {
            reject(new Error(`FFmpeg failed with code ${code}`));
          }
        });
        
        ffmpeg.on('error', (err: any) => {
          reject(new Error(`FFmpeg error: ${err.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Failed to extract audio from Freepik video: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateWithElevenLabs(text: string, options: VoiceOptions): Promise<string | null> {
    // ElevenLabs API integration
    const voiceId = this.getElevenLabsVoiceId(options.voice, options.emotion);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey!
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: options.emotion === 'dramatic' ? 0.8 : 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const outputPath = path.join('/tmp', `voice-${Date.now()}.mp3`);
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    return outputPath;
  }

  private async generateWithAzure(text: string, options: VoiceOptions): Promise<string | null> {
    // Azure Speech Services integration
    const voiceName = this.getAzureVoiceName(options.voice, options.emotion);
    const ssml = this.createSSML(text, voiceName, options);
    
    const response = await fetch(`https://${process.env.AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey!,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!response.ok) {
      throw new Error(`Azure TTS error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const outputPath = path.join('/tmp', `voice-${Date.now()}.mp3`);
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    return outputPath;
  }

  private async generateWithGoogle(text: string, options: VoiceOptions): Promise<string | null> {
    // Google Cloud Text-to-Speech integration
    const voiceName = this.getGoogleVoiceName(options.voice, options.emotion);
    
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: voiceName,
          ssmlGender: options.voice?.includes('female') ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.speed || 1.0,
          pitch: options.pitch || 0.0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google TTS error: ${response.status}`);
    }

    const result = await response.json();
    const audioBuffer = Buffer.from(result.audioContent, 'base64');
    const outputPath = path.join('/tmp', `voice-${Date.now()}.mp3`);
    fs.writeFileSync(outputPath, audioBuffer);
    
    return outputPath;
  }

  private async generateFallback(text: string, options: VoiceOptions): Promise<string | null> {
    // Use existing theme audio as fallback
    const existingAudio = path.join(process.cwd(), 'public', 'audio', 'theme.mp3');
    if (fs.existsSync(existingAudio)) {
      console.log(`Using fallback audio for: ${text}`);
      return existingAudio;
    }
    
    return null;
  }

  private getElevenLabsVoiceId(voice?: string, emotion?: string): string {
    // Map voice preferences to ElevenLabs voice IDs
    const voiceMap: Record<string, string> = {
      'narrator': 'pNInz6obpgDQGcFmaJgB', // Adam
      'female': 'EXAVITQu4vr4xnSDxMaL', // Bella
      'male': 'VR6AewLTigWG4xSOukaG', // Arnold
      'dramatic': 'pNInz6obpgDQGcFmaJgB', // Adam for dramatic
      'mysterious': 'EXAVITQu4vr4xnSDxMaL' // Bella for mysterious
    };
    
    return voiceMap[voice || 'narrator'] || voiceMap['narrator'];
  }

  private getAzureVoiceName(voice?: string, emotion?: string): string {
    // Map to Azure voice names
    const voiceMap: Record<string, string> = {
      'narrator': 'en-US-GuyNeural',
      'female': 'en-US-AriaNeural',
      'male': 'en-US-GuyNeural',
      'dramatic': 'en-US-GuyNeural',
      'mysterious': 'en-US-AriaNeural'
    };
    
    return voiceMap[voice || 'narrator'] || voiceMap['narrator'];
  }

  private getGoogleVoiceName(voice?: string, emotion?: string): string {
    // Map to Google Cloud TTS voice names
    const voiceMap: Record<string, string> = {
      'narrator': 'en-US-Neural2-A',
      'female': 'en-US-Neural2-C',
      'male': 'en-US-Neural2-A',
      'dramatic': 'en-US-Neural2-A',
      'mysterious': 'en-US-Neural2-C'
    };
    
    return voiceMap[voice || 'narrator'] || voiceMap['narrator'];
  }

  private createSSML(text: string, voiceName: string, options: VoiceOptions): string {
    const rate = options.speed || 1.0;
    const pitch = options.pitch || 0.0;
    const emotion = options.emotion || 'neutral';
    
    let prosody = '';
    if (emotion === 'dramatic') {
      prosody = 'rate="0.8" pitch="+10%" volume="+20%"';
    } else if (emotion === 'mysterious') {
      prosody = 'rate="0.9" pitch="-5%" volume="+10%"';
    } else if (emotion === 'excited') {
      prosody = 'rate="1.1" pitch="+5%" volume="+15%"';
    }
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voiceName}">
          <prosody ${prosody}>
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
  }
}

export function getVoiceService(): VoiceService {
  return new VoiceService();
}
