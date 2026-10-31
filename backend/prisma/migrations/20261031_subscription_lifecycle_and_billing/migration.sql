-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'PAUSED';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'cancelled';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "unitAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billingInterval" "BillingInterval" NOT NULL DEFAULT 'month';
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "nextBillingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billingCycleAnchor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billingSequence" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "lastBillingKey" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "lastBilledAt" TIMESTAMP(3);
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "pausedAt" TIMESTAMP(3);
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subscriptions_status_nextBillingDate_idx" ON "subscriptions"("status", "nextBillingDate");
CREATE INDEX IF NOT EXISTS "subscriptions_customerId_idx" ON "subscriptions"("customerId");
CREATE INDEX IF NOT EXISTS "subscriptions_planId_idx" ON "subscriptions"("planId");
