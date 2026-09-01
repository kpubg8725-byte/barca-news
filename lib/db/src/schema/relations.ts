import { relations } from "drizzle-orm";
import { categoriesTable } from "./categories.ts";
import { favoritesTable } from "./favorites.ts";
import { matchesTable } from "./matches.ts";
import { newsPlayersTable } from "./news-players.ts";
import { newsTable } from "./news.ts";
import { notificationsTable } from "./notifications.ts";
import { playersTable } from "./players.ts";
import { transfersTable } from "./transfers.ts";
import { usersTable } from "./users.ts";

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  news: many(newsTable),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  news: many(newsTable, { relationName: "newsAuthor" }),
  favorites: many(favoritesTable),
  notifications: many(notificationsTable),
}));

export const newsRelations = relations(newsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [newsTable.categoryId],
    references: [categoriesTable.id],
  }),
  author: one(usersTable, {
    fields: [newsTable.authorId],
    references: [usersTable.id],
    relationName: "newsAuthor",
  }),
  relatedMatch: one(matchesTable, {
    fields: [newsTable.relatedMatchId],
    references: [matchesTable.id],
  }),
  players: many(newsPlayersTable),
  favorites: many(favoritesTable),
  notifications: many(notificationsTable),
}));

export const playersRelations = relations(playersTable, ({ many }) => ({
  transfers: many(transfersTable),
  news: many(newsPlayersTable),
}));

export const matchesRelations = relations(matchesTable, ({ many }) => ({
  news: many(newsTable),
  notifications: many(notificationsTable),
}));

export const transfersRelations = relations(transfersTable, ({ one }) => ({
  player: one(playersTable, {
    fields: [transfersTable.playerId],
    references: [playersTable.id],
  }),
}));

export const favoritesRelations = relations(favoritesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [favoritesTable.userId],
    references: [usersTable.id],
  }),
  news: one(newsTable, {
    fields: [favoritesTable.newsId],
    references: [newsTable.id],
  }),
}));

export const notificationsRelations = relations(
  notificationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [notificationsTable.userId],
      references: [usersTable.id],
    }),
    news: one(newsTable, {
      fields: [notificationsTable.newsId],
      references: [newsTable.id],
    }),
    match: one(matchesTable, {
      fields: [notificationsTable.matchId],
      references: [matchesTable.id],
    }),
  }),
);