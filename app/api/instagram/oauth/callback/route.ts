import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  return new Response(
    JSON.stringify({
      message: 'Stub: exchange this code for a long-lived user access token via FB OAuth',
      code,
      docs: 'https://developers.facebook.com/docs/instagram-api/guides/content-publishing/',
    }),
    { status: 200 }
  );
}



