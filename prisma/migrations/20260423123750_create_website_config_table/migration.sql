-- CreateTable
CREATE TABLE "website_config" (
    "name" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "website_config_name_idx" ON "website_config"("name");

-- CreateIndex
CREATE UNIQUE INDEX "website_config_name_key" ON "website_config"("name");
