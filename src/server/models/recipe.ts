"use server"

import { desc } from "drizzle-orm"

import { db } from "../db"
import { recipeTable } from "../db/schema"

export async function getFeedPage(page: number) {
  // await new Promise((resolve) => setTimeout(resolve, 4000))
  const itemsPerPage = 4
  const offset = (page - 1) * itemsPerPage
  const rows = await db.query.recipeTable.findMany({
    orderBy: [desc(recipeTable.createdAt)],
    limit: itemsPerPage + 1,
    offset,
    with: {
      media: {
        columns: {
          url: true,
        },
      },
      user: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  })

  if (rows.length > itemsPerPage) {
    return { rows: rows.slice(0, itemsPerPage), nextPage: page + 1 }
  }
  return { rows, nextPage: null }
}
