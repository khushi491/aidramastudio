import { getIgEnv } from './tokens';
import { logger } from '@/lib/utils/logger';

async function igFetch(path: string, params: Record<string, any>): Promise<any> {
  const { userToken, version, igUserId } = getIgEnv();
  const url = new URL(`https://graph.facebook.com/${version}/${igUserId}${path}`);
  url.searchParams.set('access_token', userToken);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { method: 'POST' });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`IG error: ${res.status} ${JSON.stringify(json)}`);
  }
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



