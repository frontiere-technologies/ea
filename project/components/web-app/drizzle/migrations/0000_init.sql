CREATE TABLE IF NOT EXISTS "ea-drawings" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text,
	"version" integer,
	"drawings" json,
	"user_id" integer
);
