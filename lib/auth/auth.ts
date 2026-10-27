import { betterAuth } from "better-auth";
import { Pool } from "pg";

import { sendAuthEmail } from "@/lib/email";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_OebGKymr2u9Y@ep-calm-morning-b32vk7iu.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.APP_URL ||
    "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    "xu28NJY9/pdKSQQLtpQXQLlfCry0V5diN2COkf0U6fk=",
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data: any) => {
      await sendAuthEmail({
        to: data.user.email,
        type: "password_reset",
        actionUrl: data.url,
        recipientName: data.user.name,
      });
    },
    sendVerificationEmail: async (data: any) => {
      await sendAuthEmail({
        to: data.user.email,
        type: "verify_email",
        actionUrl: data.url,
        recipientName: data.user.name,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      preferredLocale: { type: "string", required: false, defaultValue: "en" },
      userType: { type: "string", required: false, defaultValue: "patient" },
    },
  },
});
