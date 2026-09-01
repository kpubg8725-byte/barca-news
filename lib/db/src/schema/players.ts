import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    nameAr: text("name_ar").notNull(),
    nameLatin: text("name_latin"),
    position: text("position").notNull(),
    avatarUrl: text("avatar_url"),
    noteAr: text("note_ar"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("players_slug_unique").on(table.slug),
    index("players_active_name_idx").on(table.isActive, table.nameAr),
  ],
);

export const insertPlayerSchema = createInsertSchema(playersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;