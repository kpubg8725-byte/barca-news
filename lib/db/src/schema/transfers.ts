import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { playersTable } from "./players.ts";
import { transferStatusEnum } from "./enums.ts";

export const transfersTable = pgTable(
  "transfers",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id"),
    playerNameAr: text("player_name_ar").notNull(),
    position: text("position"),
    fromClub: text("from_club"),
    toClub: text("to_club").notNull(),
    feeAmount: numeric("fee_amount", { precision: 12, scale: 2 }),
    feeCurrency: text("fee_currency"),
    feeLabelAr: text("fee_label_ar"),
    status: transferStatusEnum("status").notNull(),
    confidence: integer("confidence").notNull().default(0),
    notesAr: text("notes_ar"),
    announcedAt: timestamp("announced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.playerId],
      foreignColumns: [playersTable.id],
      name: "transfers_player_id_fk",
    }).onDelete("set null"),
    index("transfers_status_idx").on(table.status),
    index("transfers_player_idx").on(table.playerId),
    check(
      "transfers_confidence_range",
      sql`"confidence" >= 0 AND "confidence" <= 100`,
    ),
    check(
      "transfers_fee_non_negative",
      sql`"fee_amount" IS NULL OR "fee_amount" >= 0`,
    ),
  ],
);

export const insertTransferSchema = createInsertSchema(transfersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Transfer = typeof transfersTable.$inferSelect;