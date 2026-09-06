import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const settings=sqliteTable('settings',{userId:text('user_id').primaryKey(),keywords:text('keywords').notNull(),regions:text('regions').notNull(),updatedAt:integer('updated_at').notNull()});
export const credentials=sqliteTable('credentials',{userId:text('user_id').primaryKey(),encrypted:text('encrypted').notNull()});
export const reports=sqliteTable('reports',{id:text('id').primaryKey(),userId:text('user_id').notNull(),title:text('title').notNull(),sourceUrl:text('source_url').notNull(),sourceText:text('source_text').notNull(),mode:text('mode').notNull(),result:text('result').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_reports_user_date').on(t.userId,t.createdAt)]);
export const locks=sqliteTable('locks',{userId:text('user_id').primaryKey(),token:text('token').notNull(),expiresAt:integer('expires_at').notNull()});
