import { integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { newsTable } from "./news.ts";
import { playersTable } from "./players.ts";

export const newsPlayersTable = pgTable(
  "news_players",
  {
    newsId: integer("news_id")
      .notNull()
      .references(() => newsTable.id, { onDelete: "cascade" }),
    playerId: integer("player_id")
      .notNull()
      .references(() => playersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.newsId, table.playerId],
      name: "news_players_pk",
    }),
  ],
);