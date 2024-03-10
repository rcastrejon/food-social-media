"use server"

import type { MediaInsert } from "../db/schema"
import { db } from "../db"
import { mediaTable } from "../db/schema"

export async function createMedia({
  key,
  name,
  size,
  url,
  userId,
}: MediaInsert) {
  const { rowsAffected } = await db.insert(mediaTable).values({
    key,
    name,
    size,
    url,
    userId,
  })
  return rowsAffected === 1
}
