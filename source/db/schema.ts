import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const learners = sqliteTable('learners', {
  owner: text('owner').notNull(), id: text('id').notNull(), profile: text('profile').notNull(),
  revision: integer('revision').notNull().default(0), updatedAt: text('updated_at').notNull(),
}, t => [primaryKey({columns:[t.owner,t.id]})]);
export const learningStates = sqliteTable('learning_states', {
  owner: text('owner').notNull(), learner: text('learner').notNull(), state: text('state').notNull(),
  revision: integer('revision').notNull().default(0), lastEvent: text('last_event'), updatedAt: text('updated_at').notNull(),
}, t => [primaryKey({columns:[t.owner,t.learner]})]);
export const commandReceipts = sqliteTable('command_receipts', {
  owner: text('owner').notNull(), learner: text('learner').notNull(), eventId: text('event_id').notNull(),
  digest: text('digest').notNull(), revision: integer('revision').notNull(), at: text('at').notNull(),
}, t => [primaryKey({columns:[t.owner,t.learner,t.eventId]})]);
export const learningAttempts = sqliteTable('learning_attempts', {
  owner: text('owner').notNull(), learner: text('learner').notNull(), id: text('id').notNull(),
  session: text('session').notNull(), contentId: text('content_id').notNull(), contentVersion: integer('content_version').notNull(),
  correct: integer('correct').notNull(), payload: text('payload').notNull(), at: text('at').notNull(),
}, t => [primaryKey({columns:[t.owner,t.learner,t.id]})]);
export const kanaStates = sqliteTable('kana_states', {
  owner:text('owner').notNull(), learner:text('learner').notNull(), state:text('state').notNull(),
  revision:integer('revision').notNull().default(0), lastEvent:text('last_event'), updatedAt:text('updated_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.learner]})]);
export const kanaDrawings = sqliteTable('kana_drawings', {
  owner:text('owner').notNull(), learner:text('learner').notNull(), char:text('char').notNull(), strokes:text('strokes').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.learner,t.char]})]);
export const kanaPractices = sqliteTable('kana_practices', {
  owner:text('owner').notNull(), learner:text('learner').notNull(),eventId:text('event_id').notNull(),char:text('char').notNull(),
  strokeCount:integer('stroke_count').notNull(),evidence:text('evidence').notNull(),at:text('at').notNull(),
},t=>[primaryKey({columns:[t.owner,t.learner,t.eventId]})]);
