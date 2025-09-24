import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // This is optional because it's only used in development.
    // See https://next-auth.js.org/deployment.
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    STRIPE_API_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z.string().optional(),
    ADMIN_EMAIL: z.string().optional(),
    IS_DEBUG: z.string().optional(),
    POSTGRES_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "default-secret-for-build",
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "1",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "1",
    STRIPE_API_KEY: process.env.STRIPE_API_KEY || "1",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "1",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    RESEND_API_KEY: process.env.RESEND_API_KEY || "1",
    RESEND_FROM: process.env.RESEND_FROM || "noreply@example.com",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    IS_DEBUG: process.env.IS_DEBUG,
    POSTGRES_URL: process.env.POSTGRES_URL || "postgresql://localhost:5432/postgres",
  },
});
