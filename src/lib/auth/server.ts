import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import * as tables from "@/database/tables";
import env from "@/env";
import { db } from "@/database";
import { sendMagicLink } from "@/emails/magic-link";
import { APP_NAME, SIGNUP_BONUS_CREDITS, SIGNUP_BONUS_DESCRIPTION } from "@/lib/config/constants";
import { grantCredits, hasSignupBonusBeenGranted } from "@/lib/database/credits";
import { providerConfigs } from "./providers";

// Dynamically build social providers based on environment variables
const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string }
> = {};

// Build social providers object based on available environment variables using unified configuration
providerConfigs.forEach(({ name, clientIdKey, clientSecretKey }) => {
  const clientId = env[clientIdKey];
  const clientSecret = env[clientSecretKey];

  if (clientId && clientSecret) {
    socialProviders[name] = {
      clientId: clientId as string,
      clientSecret: clientSecret as string,
    };
  }
});

export const auth = betterAuth({
  appName: APP_NAME,
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  logger: {
    disabled: process.env.NODE_ENV === "production",
    level: "debug",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: {
      enabled: true,
    },
    additionalFields: {},
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  socialProviders,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...tables,
    },
    usePlural: true,
  }),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "linkedin"],
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // newSession is set whenever a new session is created (signup OR login)
      // We must check if user already received signup bonus to prevent duplicates
      if (ctx.context.newSession?.user?.id) {
        const userId = ctx.context.newSession.user.id;

        try {
          // Check if signup bonus was already granted by looking for the transaction record
          const hasSignupBonus = await hasSignupBonusBeenGranted(userId);

          if (!hasSignupBonus) {
            await grantCredits(
              userId,
              SIGNUP_BONUS_CREDITS,
              `signup_${userId}`, // Unique reference ID for idempotency
              SIGNUP_BONUS_DESCRIPTION
            );

            if (process.env.NODE_ENV === "development") {
              console.log(`✨ Granted ${SIGNUP_BONUS_CREDITS} signup credits to user ${userId}`);
            }
          } else if (process.env.NODE_ENV === "development") {
            console.log(`ℹ️ User ${userId} already has signup bonus, skipping`);
          }
        } catch (error) {
          // Log error but don't block signup
          console.error("Failed to grant signup credits:", error);
        }
      }
    }),
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }, context) => {
        if (process.env.NODE_ENV === "development") {
          console.log("✨ Magic link: " + url);
        }
        // Extract request from better-auth context
        const request = context?.request as Request | undefined;
        await sendMagicLink(email, url, request);
      },
    }),
  ],
});
