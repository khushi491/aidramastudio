import { getIgEnv } from './tokens';
import { logger } from '@/lib/utils/logger';

async function igFetch(path: string, params: Record<string, any>): Promise<any> {
  const { userToken, version, igUserId, mock } = getIgEnv();
  
  if (mock) {
    logger.info('MOCK igFetch', { path, params });
    return { id: `mock_${Math.random().toString(36).slice(2)}` };
  }

  if (!userToken || userToken === 'your_instagram_access_token_here') {
    throw new Error('Instagram access token is not configured. Please set FB_USER_ACCESS_TOKEN in your .env.local file or enable MOCK_MODE=true');
  }

  if (!igUserId || igUserId === 'your_instagram_user_id_here') {
    throw new Error('Instagram user ID is not configured. Please set IG_USER_ID in your .env.local file');
  }

  const url = new URL(`https://graph.facebook.com/${version}/${igUserId}${path}`);
  url.searchParams.set('access_token', userToken);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  
  logger.info('Making Instagram API request', { url: url.toString(), path });
  
  const res = await fetch(url, { method: 'POST' });
  const json = await res.json();
  
  if (!res.ok) {
    logger.error('Instagram API error', { status: res.status, response: json, url: url.toString() });
    
    // Provide more helpful error messages for common issues
    if (res.status === 400 && json.error?.code === 190) {
      throw new Error(`Instagram OAuth token is invalid or expired. Please get a new token from the Facebook Developer Console and update FB_USER_ACCESS_TOKEN in your .env.local file. Original error: ${JSON.stringify(json)}`);
    }
    
    if (res.status === 401) {
      throw new Error(`Instagram API authentication failed. Please check your FB_USER_ACCESS_TOKEN and IG_USER_ID in your .env.local file. Original error: ${JSON.stringify(json)}`);
    }
    
    throw new Error(`Instagram API error: ${res.status} ${JSON.stringify(json)}`);
  }
  
  logger.info('Instagram API request successful', { response: json });
  return json;
}

export async function createImageContainer(imageUrl: string, caption?: string): Promise<string> {
  const { mock } = getIgEnv();
  if (mock) {
    logger.info('MOCK createImageContainer', { imageUrl, caption });
    return `mock_${Math.random().toString(36).slice(2)}`;
  }
  const json = await igFetch('/media', { image_url: imageUrl, is_carousel_item: true, caption });
  return json.id;
}

export async function createCarouselContainer(children: string[], caption: string): Promise<string> {
  const { mock } = getIgEnv();
  if (mock) {
    logger.info('MOCK createCarouselContainer', { children, caption });
    return `mock_car_${Math.random().toString(36).slice(2)}`;
  }
  const json = await igFetch('/media', { media_type: 'CAROUSEL', children: children.join(','), caption });
  return json.id;
}

export async function createReelContainer(videoUrl: string, caption: string): Promise<string> {
  const { mock } = getIgEnv();
  if (mock) {
    logger.info('MOCK createReelContainer', { videoUrl, caption });
    return `mock_reel_${Math.random().toString(36).slice(2)}`;
  }
  const json = await igFetch('/media', { media_type: 'REELS', video_url: videoUrl, caption });
  return json.id;
}

export async function publishContainer(creationId: string): Promise<string> {
  const { mock } = getIgEnv();
  if (mock) {
    logger.info('MOCK publishContainer', { creationId });
    return `mock_pub_${creationId}`;
  }
  const json = await igFetch('/media_publish', { creation_id: creationId });
  return json.id;
}



