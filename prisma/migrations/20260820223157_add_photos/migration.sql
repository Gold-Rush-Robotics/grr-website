-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "thumbnail_key" TEXT NOT NULL,
    "full_res_key" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "gps_lat" DOUBLE PRECISION,
    "gps_lon" DOUBLE PRECISION,
    "taken_at" TIMESTAMP(3) NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photos_id_key" ON "photos"("id");

-- CreateIndex
CREATE UNIQUE INDEX "photos_thumbnail_key_key" ON "photos"("thumbnail_key");

-- CreateIndex
CREATE UNIQUE INDEX "photos_full_res_key_key" ON "photos"("full_res_key");

-- CreateIndex
CREATE INDEX "photos_taken_at_thumbnail_key_full_res_key_idx" ON "photos"("taken_at", "thumbnail_key", "full_res_key");

-- CreateIndex
CREATE INDEX "photos_mime_type_idx" ON "photos"("mime_type");
