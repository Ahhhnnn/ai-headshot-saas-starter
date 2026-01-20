// Brand Configuration
export const APP_NAME =
  process.env.NODE_ENV === "development"
    ? "DEV - HeadshotPro AI"
    : "HeadshotPro AI";
export const COMPANY_NAME = "HeadshotPro AI";

export const TRIAL_DAYS = 7;

// Signup bonus credits for new users
export const SIGNUP_BONUS_CREDITS = 2;
export const SIGNUP_BONUS_DESCRIPTION = "Welcome bonus for signing up";

// https://www.dicebear.com/playground/
// DEFAULT: initials
export const AVATAR_STYLE = "adventurer-neutral";

// Contact Information
export const CONTACT_EMAIL = "support@headshotpro.work";
export const LEGAL_EMAIL = "support@headshotpro.work";
export const PRIVACY_EMAIL = "support@headshotpro.work";
export const RESEND_EMAIL_FROM = "noreply@mail.headshotpro.work";

// External Links
export const GITHUB_URL = "https://github.com/Ahhhnnn";
export const VERCEL_DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https://github.com/Ahhhnnn";

export const PAYMENT_PROVIDER = "creem" as const;
// SEO
export const OGIMAGE = "https://headshotpro.work//og.png";
export const TWITTERACCOUNT = "@hehecodex";
