-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "fullResKey" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLon" DOUBLE PRECISION,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_id_key" ON "Photo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_thumbnailKey_key" ON "Photo"("thumbnailKey");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_fullResKey_key" ON "Photo"("fullResKey");

-- CreateIndex
CREATE INDEX "Photo_takenAt_thumbnailKey_fullResKey_idx" ON "Photo"("takenAt", "thumbnailKey", "fullResKey");

-- CreateIndex
CREATE INDEX "Photo_mimeType_idx" ON "Photo"("mimeType");
