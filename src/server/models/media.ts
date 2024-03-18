"use server"

import { eq } from "drizzle-orm"

import type { MediaInsert } from "../db/schema"
import { db } from "../db"
import { mediaTable } from "../db/schema"
import { utapi } from "../uploadthing"

export async function createMedia({
  key,
  name,
  size,
  url,
  userId,
  customId,
}: MediaInsert) {
  const { rowsAffected } = await db.insert(mediaTable).values({
    key,
    name,
    size,
    url,
    userId,
    customId,
  })
  return rowsAffected === 1
}

export async function deleteMedia(key: string) {
  const ok = await utapi.deleteFiles(key)
  if (!ok) {
    return false
  }
  const [deleted] = await db
    .delete(mediaTable)
    .where(eq(mediaTable.key, key))
    .returning({ deletedKey: mediaTable.key })
  return deleted !== undefined
}
