import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: './drama-studio.sqlite',
  },
  out: './drizzle',
} satisfies Config;


