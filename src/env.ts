import { object, optional, parse, picklist, string, url } from "valibot"

const envSchema = object({
  NODE_ENV: optional(
    picklist(["development", "production", "test"]),
    "development",
  ),
  DATABASE_URL: string(),
  DATABASE_AUTH_TOKEN: optional(string()),
  HOST: string([url()]),
})

export const env = parse(envSchema, process.env)
