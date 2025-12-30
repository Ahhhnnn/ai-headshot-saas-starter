-- Enum for user roles
CREATE TYPE "user_role" AS ENUM ('user', 'admin', 'super_admin');

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "emailVerified" boolean NOT NULL,
  "image" text,
  "role" "user_role" NOT NULL DEFAULT 'user',
  "paymentProviderCustomerId" text,
  "createdAt" timestamp NOT NULL,
  "updatedAt" timestamp NOT NULL
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL,
  "createdAt" timestamp NOT NULL,
  "updatedAt" timestamp NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "os" text,
  "browser" text,
  "deviceType" text,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
);

-- Accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" text PRIMARY KEY NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL,
  "updatedAt" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");

-- Verifications table
CREATE TABLE IF NOT EXISTS "verifications" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp,
  "updatedAt" timestamp
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "customerId" text NOT NULL,
  "subscriptionId" text NOT NULL,
  "productId" text NOT NULL,
  "status" text NOT NULL,
  "currentPeriodStart" timestamp,
  "currentPeriodEnd" timestamp,
  "canceledAt" timestamp,
  "createdAt" timestamp DEFAULT NOW() NOT NULL,
  "updatedAt" timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "subscriptions_userId_idx" ON "subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "subscriptions_customerId_idx" ON "subscriptions"("customerId");

-- Payments table
CREATE TABLE IF NOT EXISTS "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "customerId" text NOT NULL,
  "subscriptionId" text,
  "productId" text NOT NULL,
  "paymentId" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'usd' NOT NULL,
  "status" text NOT NULL,
  "paymentType" text NOT NULL,
  "createdAt" timestamp DEFAULT NOW() NOT NULL,
  "updatedAt" timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "payments_userId_idx" ON "payments"("userId");

-- Webhook events table
CREATE TABLE IF NOT EXISTS "webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "eventId" text NOT NULL,
  "eventType" text NOT NULL,
  "provider" text DEFAULT 'creem' NOT NULL,
  "processed" boolean DEFAULT true NOT NULL,
  "processedAt" timestamp DEFAULT NOW() NOT NULL,
  "payload" text,
  "createdAt" timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "webhook_events_eventId_idx" ON "webhook_events"("eventId");
CREATE INDEX IF NOT EXISTS "webhook_events_provider_idx" ON "webhook_events"("provider");

-- Uploads table
CREATE TABLE IF NOT EXISTS "uploads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "fileKey" text NOT NULL,
  "url" text NOT NULL,
  "fileName" text NOT NULL,
  "fileSize" integer NOT NULL,
  "contentType" text NOT NULL,
  "createdAt" timestamp DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "uploads_userId_idx" ON "uploads"("userId");
CREATE INDEX IF NOT EXISTS "uploads_fileKey_idx" ON "uploads"("fileKey");
