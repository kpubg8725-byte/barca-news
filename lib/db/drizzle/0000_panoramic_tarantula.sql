CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'finished', 'postponed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."news_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('breaking', 'match', 'transfer', 'news');--> statement-breakpoint
CREATE TYPE "public"."transfer_status" AS ENUM('completed', 'negotiation', 'rumor');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'editor', 'admin');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" integer NOT NULL,
	"news_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_pk" PRIMARY KEY("user_id","news_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition" text NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"home_short" text,
	"away_short" text,
	"kickoff_at" timestamp with time zone NOT NULL,
	"venue" text,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"home_score" integer,
	"away_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_scores_non_negative" CHECK (("home_score" IS NULL OR "home_score" >= 0) AND ("away_score" IS NULL OR "away_score" >= 0))
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_ar" text NOT NULL,
	"summary_ar" text NOT NULL,
	"body_ar" text NOT NULL,
	"cover_image_path" text,
	"image_alt_ar" text,
	"category_id" integer NOT NULL,
	"author_id" integer,
	"related_match_id" integer,
	"status" "news_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_breaking" boolean DEFAULT false NOT NULL,
	"reading_minutes" integer,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_reading_minutes_positive" CHECK ("reading_minutes" IS NULL OR "reading_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "news_players" (
	"news_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_players_pk" PRIMARY KEY("news_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"news_id" integer,
	"match_id" integer,
	"kind" "notification_kind" NOT NULL,
	"title_ar" text NOT NULL,
	"body_ar" text NOT NULL,
	"read_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_latin" text,
	"position" text NOT NULL,
	"avatar_url" text,
	"note_ar" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"player_name_ar" text NOT NULL,
	"position" text,
	"from_club" text,
	"to_club" text NOT NULL,
	"fee_amount" numeric(12, 2),
	"fee_currency" text,
	"fee_label_ar" text,
	"status" "transfer_status" NOT NULL,
	"confidence" integer DEFAULT 0 NOT NULL,
	"notes_ar" text,
	"announced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transfers_confidence_range" CHECK ("confidence" >= 0 AND "confidence" <= 100),
	CONSTRAINT "transfers_fee_non_negative" CHECK ("fee_amount" IS NULL OR "fee_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth_subject" text,
	"email" text,
	"display_name" text,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_subject_unique" UNIQUE("auth_subject")
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_related_match_id_fk" FOREIGN KEY ("related_match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_players" ADD CONSTRAINT "news_players_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_players" ADD CONSTRAINT "news_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_active_order_idx" ON "categories" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "matches_kickoff_idx" ON "matches" USING btree ("kickoff_at");--> statement-breakpoint
CREATE INDEX "matches_status_kickoff_idx" ON "matches" USING btree ("status","kickoff_at");--> statement-breakpoint
CREATE UNIQUE INDEX "news_slug_unique" ON "news" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_status_published_idx" ON "news" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "news_category_published_idx" ON "news" USING btree ("category_id","published_at");--> statement-breakpoint
CREATE INDEX "news_featured_idx" ON "news" USING btree ("is_featured","published_at");--> statement-breakpoint
CREATE INDEX "news_breaking_idx" ON "news" USING btree ("is_breaking","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "players_slug_unique" ON "players" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "players_active_name_idx" ON "players" USING btree ("is_active","name_ar");--> statement-breakpoint
CREATE INDEX "transfers_status_idx" ON "transfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transfers_player_idx" ON "transfers" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");