import "server-only"

import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import { env } from "~/env"
import * as schema from "./schema"

const libsqlClient = createClient({
  url: env.DATABASE_URL,
})

export const db = drizzle(libsqlClient, { schema })
