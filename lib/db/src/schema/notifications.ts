import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { notificationKindEnum } from "./enums.ts";
import { matchesTable } from "./matches.ts";
import { newsTable } from "./news.ts";
import { usersTable } from "./users.ts";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  newsId: integer("news_id").references(() => newsTable.id, {
    onDelete: "set null",
  }),
  matchId: integer("match_id").references(() => matchesTable.id, {
    onDelete: "set null",
  }),
  kind: notificationKindEnum("kind").notNull(),
  titleAr: text("title_ar").notNull(),
  bodyAr: text("body_ar").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(
  notificationsTable,
).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;