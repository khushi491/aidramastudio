interface FreepikImageRequest {
  prompt: string;
  aspect_ratio: 'square_1_1' | 'classic_4_3' | 'traditional_3_4' | 'widescreen_16_9' | 'social_story_9_16' | 'smartphone_horizontal_20_9' | 'smartphone_vertical_9_20' | 'film_horizontal_21_9' | 'film_vertical_9_21' | 'standard_3_2' | 'portrait_2_3' | 'horizontal_2_1' | 'vertical_1_2' | 'social_5_4' | 'social_post_4_5';
  style?: string;
  quality?: string;
}

interface FreepikTaskResponse {
  data: {
    task_id: string;
    status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    generated: Array<{
      id: string;
      url: string;
      download_url: string;
    }>;
    has_nsfw?: boolean[];
    error?: string;
  };
}

export class FreepikService {
  private apiKey: string;
  private baseUrl = 'https://api.freepik.com/v1/ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: FreepikImageRequest): Promise<string> {
    try {
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
        console.error('Freepik API error response:', errorText);
        throw new Error(`Freepik API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const taskData: FreepikTaskResponse = await response.json();
      
      if (!taskData.data.task_id) {
        throw new Error('No task ID returned from Freepik API');
      }

      // Poll for completion
      return await this.pollForCompletion(taskData.data.task_id);
    } catch (error) {
      console.error('Freepik image generation failed:', error);
      throw error;
    }
  }

  private async pollForCompletion(taskId: string, maxAttempts = 30): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/mystic/${taskId}`, {
          headers: {
            'Accept': 'application/json',
            'x-freepik-api-key': this.apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const taskData: FreepikTaskResponse = await response.json();

        if (taskData.data.status === 'COMPLETED' && taskData.data.generated.length > 0) {
          return taskData.data.generated[0].download_url;
        }

        if (taskData.data.status === 'FAILED') {
          throw new Error(`Image generation failed: ${taskData.data.error || 'Unknown error'}`);
        }

        // Wait before next poll (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(1.5, attempt), 10000)));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        console.warn(`Poll attempt ${attempt + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    throw new Error('Image generation timed out');
  }

  async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      console.log('Downloading image from URL:', imageUrl);
      
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
      console.log(`Successfully downloaded image, size: ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error('Failed to download Freepik image:', error);
      throw error;
    }
  }
}

export function getFreepikService(): FreepikService | null {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey || apiKey === 'your_freepik_api_key_here') {
    return null;
  }
  return new FreepikService(apiKey);
}
