-- CreateTable
CREATE TABLE "ea-drawings" (
    "id" SERIAL NOT NULL,
    "filename" TEXT,
    "version" INTEGER,
    "drawings" JSONB,
    "user_id" INTEGER,

    CONSTRAINT "ea-drawings_pkey" PRIMARY KEY ("id")
);
