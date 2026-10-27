ALTER TABLE "public"."ai_phone_settings"
  ADD COLUMN "call_handling_mode" TEXT NOT NULL DEFAULT 'ALL_CALLS',
  ADD COLUMN "business_phone_number" TEXT,
  ADD COLUMN "ring_timeout_seconds" INTEGER NOT NULL DEFAULT 20;
