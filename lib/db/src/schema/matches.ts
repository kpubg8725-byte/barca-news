import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { matchStatusEnum } from "./enums.ts";

export const matchesTable = pgTable(
  "matches",
  {
    id: serial("id").primaryKey(),
    competition: text("competition").notNull(),
    homeTeam: text("home_team").notNull(),
    awayTeam: text("away_team").notNull(),
    homeShort: text("home_short"),
    awayShort: text("away_short"),
    kickoffAt: timestamp("kickoff_at", { withTimezone: true }).notNull(),
    venue: text("venue"),
    status: matchStatusEnum("status").notNull().default("scheduled"),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("matches_kickoff_idx").on(table.kickoffAt),
    index("matches_status_kickoff_idx").on(table.status, table.kickoffAt),
    check(
      "matches_scores_non_negative",
      sql`("home_score" IS NULL OR "home_score" >= 0) AND ("away_score" IS NULL OR "away_score" >= 0)`,
    ),
  ],
);

export const insertMatchSchema = createInsertSchema(matchesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;