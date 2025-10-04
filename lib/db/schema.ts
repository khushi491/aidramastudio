import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const series = sqliteTable('Series', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const episodes = sqliteTable('Episode', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  seriesId: text('seriesId').notNull(),
  number: integer('number').notNull(),
  theme: text('theme').notNull(),
  tone: text('tone').notNull(),
  setting: text('setting').notNull(),
  language: text('language').notNull(),
  scriptJson: text('scriptJson'),
  synopsis: text('synopsis'),
  captionsJson: text('captionsJson'),
  status: text('status', { enum: ['draft', 'rendered', 'published'] }).notNull().default('draft'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const media = sqliteTable('Media', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  episodeId: text('episodeId').notNull(),
  type: text('type', { enum: ['panel', 'trailer'] }).notNull(),
  url: text('url').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  durationSec: integer('durationSec'),
});

export const igPublish = sqliteTable('IgPublish', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  episodeId: text('episodeId').notNull(),
  carouselId: text('carouselId'),
  reelId: text('reelId'),
  caption: text('caption').notNull(),
  igPermalink: text('igPermalink'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

let _db: ReturnType<typeof drizzle> | null = null;
export function getDb() {
  if (_db) return _db;
  const sqlite = new Database('drama-studio.sqlite');
  _db = drizzle(sqlite);
  return _db;
}



