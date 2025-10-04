import { getDb, series } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  const db = getDb();
  const existing = await db.select().from(series).where(eq(series.slug, 'subway-thrones'));
  if (existing.length === 0) {
    await db.insert(series).values({ title: 'Subway Thrones', slug: 'subway-thrones' });
    // eslint-disable-next-line no-console
    console.log('Seeded series: Subway Thrones');
  } else {
    // eslint-disable-next-line no-console
    console.log('Series already seeded');
  }
}

main();



