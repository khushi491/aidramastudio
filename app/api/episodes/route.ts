import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db/schema';
import { episodes } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    const db = getDb();
    const allEpisodes = await db.select().from(episodes).orderBy(desc(episodes.createdAt));
    
    return new Response(JSON.stringify(allEpisodes), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Failed to fetch episodes:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch episodes' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
