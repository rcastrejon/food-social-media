import { vercel } from "@t3-oss/env-core/presets"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    DATABASE_AUTH_TOKEN: z.string().optional(),

    UPLOADTHING_SECRET: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_SECRET_HERE"),
        "You forgot to change the default secret",
      ),
    UPLOADTHING_APP_ID: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_APP_ID_HERE"),
        "You forgot to change the default app id",
      ),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_KEY_HERE"),
        "You forgot to change the default key",
      ),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    // NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
  // Extend the Vercel preset.
  extends: [vercel()],
})
