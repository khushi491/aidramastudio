type FreepikAspectRatio = 'square_1_1' | 'classic_4_3' | 'traditional_3_4' | 'widescreen_16_9' | 'social_story_9_16' | 'smartphone_horizontal_20_9' | 'smartphone_vertical_9_20' | 'film_horizontal_21_9' | 'film_vertical_9_21' | 'standard_3_2' | 'portrait_2_3' | 'horizontal_2_1' | 'vertical_1_2' | 'social_5_4' | 'social_post_4_5';

type FreepikStyle = 'cinematic' | 'realistic' | 'artistic' | 'cartoon' | 'anime' | 'photographic';

type FreepikQuality = 'standard' | 'high' | 'ultra';

interface FreepikImageRequest {
  prompt: string;
  aspect_ratio: FreepikAspectRatio;
  style?: FreepikStyle;
  quality?: FreepikQuality;
}

interface FreepikTaskResponse {
  data: {
    task_id: string;
    status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    generated: string[];
    has_nsfw?: boolean[];
    error?: string;
  };
}

export class FreepikService {
  private apiKey: string;
  private baseUrl: string;
  private maxWaitTime: number;
  private maxAttempts: number;
  private backoffMultiplier: number;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.FREEPIK_BASE_URL || 'https://api.freepik.com/v1/ai';
    this.maxWaitTime = parseInt(process.env.FREEPIK_MAX_WAIT_TIME || '10000');
    this.maxAttempts = parseInt(process.env.FREEPIK_MAX_ATTEMPTS || '30');
    this.backoffMultiplier = parseFloat(process.env.FREEPIK_BACKOFF_MULTIPLIER || '1.5');
  }

  async generateImage(request: FreepikImageRequest): Promise<string> {
    try {
      // Validate request
      this.validateRequest(request);
      
      // Start image generation
      const response = await fetch(`${this.baseUrl}/mystic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-freepik-api-key': this.apiKey,
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Freepik API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const taskData: FreepikTaskResponse = await response.json();
      if (!taskData.data.task_id) {
        throw new Error(`No task ID returned from Freepik API. Response: ${JSON.stringify(taskData)}`);
      }

      // Poll for completion
      const result = await this.pollForCompletion(taskData.data.task_id);
      return result;
    } catch (error) {
      throw new Error(`Freepik image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async pollForCompletion(taskId: string): Promise<string> {
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/mystic/${taskId}`, {
          headers: {
            'Accept': 'application/json',
            'x-freepik-api-key': this.apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
        }

        const taskData: FreepikTaskResponse = await response.json();

        if (taskData.data.status === 'COMPLETED' && taskData.data.generated.length > 0) {
          return taskData.data.generated[0];
        }

        if (taskData.data.status === 'FAILED') {
          throw new Error(`Image generation failed: ${taskData.data.error || 'Unknown error'}`);
        }

        // Adaptive polling based on status
        const waitTime = this.getWaitTime(attempt, taskData.data.status);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } catch (error) {
        if (attempt === this.maxAttempts - 1) {
          throw new Error(`Freepik polling failed after ${this.maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Exponential backoff for retries
        const retryWait = Math.min(2000 * Math.pow(this.backoffMultiplier, attempt), this.maxWaitTime);
        await new Promise(resolve => setTimeout(resolve, retryWait));
      }
    }

    throw new Error(`Image generation timed out after ${this.maxAttempts} attempts`);
  }

  async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error(`Invalid image URL: ${imageUrl}`);
      }
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Downloaded image is empty');
      }
      
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to download Freepik image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateRequest(request: FreepikImageRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }
    if (request.prompt.length > 1000) {
      throw new Error('Prompt too long (max 1000 characters)');
    }
  }

  private getWaitTime(attempt: number, status: string): number {
    if (status === 'IN_PROGRESS') {
      return Math.min(2000 * Math.pow(this.backoffMultiplier, attempt), this.maxWaitTime);
    }
    return 1000; // Quick retry for other statuses
  }
}

export function getFreepikService(): FreepikService | null {
  const apiKey = process.env.FREEPIK_API_KEY;

  if (!apiKey || apiKey === 'your_freepik_api_key_here') {
    return null;
  }
  return new FreepikService(apiKey);
}
