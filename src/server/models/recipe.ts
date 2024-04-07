"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, desc, eq, sql } from "drizzle-orm"

import type { RecipeInsert } from "../db/schema"
import { newId } from "~/lib/utils"
import { validateRequest } from "../auth/validate-request"
import { db } from "../db"
import { recipeTable, usersToRecipes } from "../db/schema"
import { deleteMedia } from "./media"

export type FeedRow = Awaited<ReturnType<typeof getFeedPage>>["rows"][number]

export async function getFeedPage(page: number) {
  const { user } = await validateRequest()

  // await new Promise((resolve) => setTimeout(resolve, 4000))
  const itemsPerPage = 4
  const offset = (page - 1) * itemsPerPage
  const feedQuery = db.query.recipeTable
    .findMany({
      orderBy: [desc(recipeTable.createdAt)],
      limit: sql.placeholder("limit"),
      offset: sql.placeholder("offset"),
      with: {
        media: {
          columns: {
            url: true,
          },
        },
        user: {
          columns: {
            username: true,
          },
        },
        likes: {
          columns: {
            userId: true,
          },
        },
      },
      extras: {
        redirectUrl: sql<string>`concat('/p/', ${recipeTable.id})`.as(
          "redirect_url",
        ),
      },
    })
    .prepare()
  const rawRows = await feedQuery.execute({ limit: itemsPerPage + 1, offset })
  const rows = rawRows.map((row) => {
    const { likes, ...recipe } = row
    return {
      ...recipe,
      likes: likes.length,
      userHasLiked: likes.some((like) => like.userId === user?.id),
    }
  })

  if (rows.length > itemsPerPage) {
    return { rows: rows.slice(0, itemsPerPage), nextPage: page + 1 }
  }
  return { rows: rows, nextPage: null }
}

export async function createRecipe({
  title,
  ingredients,
  content,
  mediaKey,
}: Pick<RecipeInsert, "title" | "mediaKey"> & {
  ingredients: RecipeInsert["body"]["ingredients"]
  content: RecipeInsert["body"]["content"]
}) {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/new")
  }

  const [newRecipe] = await db
    .insert(recipeTable)
    .values({
      id: newId("recipe"),
      title,
      body: {
        ingredients,
        content,
      },
      userId: user.id,
      mediaKey,
    })
    .returning({
      insertedId: recipeTable.id,
    })
  if (newRecipe) {
    await db.insert(usersToRecipes).values({
      userId: user.id,
      recipeId: newRecipe.insertedId,
    })
  }
  revalidatePath("/")
  redirect("/")
}

export async function getRecipeById(recipeId: string) {
  return await db.query.recipeTable.findFirst({
    where: eq(recipeTable.id, recipeId),
    with: {
      media: {
        columns: {
          url: true,
        },
      },
      user: {
        columns: {
          username: true,
        },
      },
    },
  })
}

export async function updateLike(recipeId: string, likeState: boolean) {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/")
  }

  if (likeState === false) {
    await db
      .delete(usersToRecipes)
      .where(
        and(
          eq(usersToRecipes.userId, user.id),
          eq(usersToRecipes.recipeId, recipeId),
        ),
      )
  } else {
    await db.insert(usersToRecipes).values({
      userId: user.id,
      recipeId,
    })
  }
}

export async function deleteRecipe(recipeId: string) {
  const { user } = await validateRequest()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const [deleted] = await db
    .delete(recipeTable)
    .where(and(eq(recipeTable.id, recipeId), eq(recipeTable.userId, user.id)))
    .returning({
      mediaKey: recipeTable.mediaKey,
    })
  if (!deleted) {
    throw new Error(
      "Could not delete the recipe, maybe it does not exist or you are not the owner",
    )
  }
  await deleteMedia(deleted.mediaKey)
  revalidatePath("/")
}
