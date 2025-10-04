import { NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    logger.error('Instagram OAuth error', { error, error_description: searchParams.get('error_description') });
    return new Response(
      JSON.stringify({
        error: 'OAuth authorization failed',
        error_description: searchParams.get('error_description'),
      }),
      { status: 400 }
    );
  }

  if (!code) {
    return new Response(
      JSON.stringify({
        error: 'No authorization code provided',
      }),
      { status: 400 }
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.FB_APP_ID || '',
        client_secret: process.env.FB_APP_SECRET || '',
        redirect_uri: `${process.env.MEDIA_BASE_URL || 'http://localhost:3000'}/api/instagram/oauth/callback`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      logger.error('Token exchange failed', { status: tokenResponse.status, error: errorData });
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    logger.info('Token exchange successful', { access_token: tokenData.access_token ? 'present' : 'missing' });

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`);
    
    if (!longLivedResponse.ok) {
      const errorData = await longLivedResponse.json();
      logger.error('Long-lived token exchange failed', { status: longLivedResponse.status, error: errorData });
      throw new Error(`Long-lived token exchange failed: ${longLivedResponse.status}`);
    }

    const longLivedData = await longLivedResponse.json();
    
    return new Response(
      JSON.stringify({
        message: 'OAuth flow completed successfully',
        access_token: longLivedData.access_token,
        expires_in: longLivedData.expires_in,
        token_type: longLivedData.token_type,
        instructions: 'Update your .env.local file with the new access token:',
        env_update: `FB_USER_ACCESS_TOKEN=${longLivedData.access_token}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    logger.error('OAuth callback failed', { error: String(error) });
    return new Response(
      JSON.stringify({
        error: 'OAuth callback failed',
        details: String(error),
      }),
      { status: 500 }
    );
  }
}



