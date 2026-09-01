import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "editor", "admin"]);
export const newsStatusEnum = pgEnum("news_status", [
  "draft",
  "published",
  "archived",
]);
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
  "postponed",
  "cancelled",
]);
export const transferStatusEnum = pgEnum("transfer_status", [
  "completed",
  "negotiation",
  "rumor",
]);
export const notificationKindEnum = pgEnum("notification_kind", [
  "breaking",
  "match",
  "transfer",
  "news",
]);