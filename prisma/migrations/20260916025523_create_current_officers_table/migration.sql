-- CreateTable
CREATE TABLE "contact_officers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photo_key" TEXT,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_officers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_officers_position_idx" ON "contact_officers"("position");
