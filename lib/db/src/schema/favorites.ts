import { integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { newsTable } from "./news.ts";
import { usersTable } from "./users.ts";

export const favoritesTable = pgTable(
  "favorites",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    newsId: integer("news_id")
      .notNull()
      .references(() => newsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.newsId],
      name: "favorites_pk",
    }),
  ],
);