"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { desc } from "drizzle-orm"

import type { RecipeInsert } from "../db/schema"
import { newId } from "~/lib/utils"
import { validateRequest } from "../auth/validate-request"
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

export async function createRecipe({
  title,
  ingredients,
  mediaKey,
}: Omit<RecipeInsert, "content" | "id" | "userId"> & {
  ingredients: RecipeInsert["content"]["ingredients"]
}) {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/new")
  }

  await db.insert(recipeTable).values({
    id: newId("recipe"),
    title,
    content: {
      ingredients,
    },
    userId: user.id,
    mediaKey,
  })
  revalidatePath("/")
  redirect("/")
}
