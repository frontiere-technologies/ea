import { pgTable, serial, text, integer, json } from 'drizzle-orm/pg-core';

export const eaDrawings = pgTable('ea-drawings', {
  id: serial('id').primaryKey(),
  filename: text('filename'),
  version: integer('version'),
  drawings: json('drawings'),
  userId: integer('user_id'),
});

export type EaDrawing = typeof eaDrawings.$inferSelect;
export type NewEaDrawing = typeof eaDrawings.$inferInsert;
