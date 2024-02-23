import { object, optional, parse, picklist, string } from "valibot"

const envSchema = object({
  NODE_ENV: optional(
    picklist(["development", "production", "test"]),
    "development",
  ),
  DATABASE_URL: string(),
})

export const env = parse(envSchema, process.env)
