import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories.ts";
import { matchesTable } from "./matches.ts";
import { newsStatusEnum } from "./enums.ts";
import { usersTable } from "./users.ts";

export const newsTable = pgTable(
  "news",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    titleAr: text("title_ar").notNull(),
    summaryAr: text("summary_ar").notNull(),
    bodyAr: text("body_ar").notNull(),
    coverImagePath: text("cover_image_path"),
    imageAltAr: text("image_alt_ar"),
    categoryId: integer("category_id").notNull(),
    authorId: integer("author_id"),
    relatedMatchId: integer("related_match_id"),
    status: newsStatusEnum("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isBreaking: boolean("is_breaking").notNull().default(false),
    readingMinutes: integer("reading_minutes"),
    tags: text("tags").array().notNull().default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("news_slug_unique").on(table.slug),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categoriesTable.id],
      name: "news_category_id_fk",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [usersTable.id],
      name: "news_author_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.relatedMatchId],
      foreignColumns: [matchesTable.id],
      name: "news_related_match_id_fk",
    }).onDelete("set null"),
    index("news_status_published_idx").on(table.status, table.publishedAt),
    index("news_category_published_idx").on(table.categoryId, table.publishedAt),
    index("news_featured_idx").on(table.isFeatured, table.publishedAt),
    index("news_breaking_idx").on(table.isBreaking, table.publishedAt),
    check(
      "news_reading_minutes_positive",
      sql`"reading_minutes" IS NULL OR "reading_minutes" > 0`,
    ),
  ],
);

export const insertNewsSchema = createInsertSchema(newsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;