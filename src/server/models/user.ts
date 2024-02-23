"use server"

import { DrizzleError } from "drizzle-orm/errors"
import { sql } from "drizzle-orm/sql"
import { Argon2id } from "oslo/password"

import type { UserInsert, UserSelect } from "../db/schema"
import { newId } from "~/lib/utils"
import { db } from "../db"
import { userTable } from "../db/schema"

const ERROR = {
  usernameTaken: "username-taken",
  invalidUsernamePass: "invalid-username-pass",
} as const

async function getUserByUsername(username: UserSelect["username"]) {
  return await db.query.userTable.findFirst({
    where: sql`${userTable.username} = ${username} COLLATE NOCASE`,
  })
}

export async function createUser(
  username: UserInsert["username"],
  password: string,
) {
  const hashedPassword = await new Argon2id().hash(password)
  const userId = newId("user")

  // check if username is unique, for that we have to do a case insensitive search.
  // if the username is unique, create the user.
  try {
    await db.transaction(async (tx) => {
      const existingUser = await tx.query.userTable.findFirst({
        where: sql`${userTable.username} = ${username} COLLATE NOCASE`,
        columns: {
          id: true,
        },
      })
      if (existingUser) {
        tx.rollback()
        return
      }
      await tx.insert(userTable).values({
        id: userId,
        username,
        hashedPassword,
      })
    })
  } catch (e) {
    if (e instanceof DrizzleError) {
      // rollback ocurred, username is taken.
      return {
        error: ERROR.usernameTaken,
      }
    }
    throw e
  }
  return { userId }
}

export async function verifyUsernamePassword(
  username: UserSelect["username"],
  password: string,
) {
  const existingUser = await getUserByUsername(username)
  if (!existingUser) {
    return { error: ERROR.invalidUsernamePass }
  }
  const validPassword = await new Argon2id().verify(
    existingUser.hashedPassword,
    password,
  )
  if (!validPassword) {
    return { error: ERROR.invalidUsernamePass }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hashedPassword: _, ...userWithoutPassword } = existingUser
  return { user: userWithoutPassword }
}
