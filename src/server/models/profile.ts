"use server"

import { desc, sql } from "drizzle-orm"

import { db } from "../db"
import { recipeTable, userTable } from "../db/schema"

export async function getProfileDataByUsername(username: string) {
  return await db.query.userTable.findFirst({
    where: sql`${userTable.username} = ${username} COLLATE NOCASE`,
    with: {
      recipes: {
        orderBy: [desc(recipeTable.createdAt)],
        columns: {
          id: true,
          title: true,
        },
        with: {
          media: {
            columns: {
              url: true,
            },
          },
        },
      },
    },
    columns: {
      id: true,
      username: true,
    },
  })
}
