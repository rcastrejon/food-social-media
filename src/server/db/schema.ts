import { relations } from "drizzle-orm"
import {
  blob,
  int,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core"

export const userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
})

export type UserSelect = typeof userTable.$inferSelect
export type UserInsert = typeof userTable.$inferInsert

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: integer("expires_at").notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
})

export const recipeTable = sqliteTable("recipe", {
  id: text("id").notNull().primaryKey(),
  title: text("title").notNull(),
  body: blob("body", { mode: "json" })
    .$type<{
      ingredients: Array<{ content: string }>
      content: string
    }>()
    .notNull(),

  userId: text("user_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  mediaKey: text("media_key")
    .references(() => mediaTable.key)
    .notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
})

// TODO: Maybe use sqlite views to avoid db:push issues
//
// export const recipeFts = sqliteView("recipe_fts", {
//   title: text("title").notNull(),
//   ingredients: text("ingredients").notNull(),
//   content: text("content").notNull(),
//   contentRowId: int("content_rowid").notNull(),
// }).existing()

export type RecipeSelect = typeof recipeTable.$inferSelect
export type RecipeInsert = Omit<typeof recipeTable.$inferInsert, "userId"> & {
  userId: UserInsert["id"]
}

export const mediaTable = sqliteTable("media", {
  key: text("key").notNull().primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  size: int("size").notNull(),
  userId: text("user_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  customId: text("custom_id").unique(),

  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
})

export type MediaSelect = typeof mediaTable.$inferSelect
export type MediaInsert = Omit<typeof mediaTable.$inferInsert, "userId"> & {
  userId: UserInsert["id"]
}

export const recipeRelations = relations(recipeTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [recipeTable.userId],
    references: [userTable.id],
  }),
  media: one(mediaTable, {
    fields: [recipeTable.mediaKey],
    references: [mediaTable.key],
  }),
  likes: many(usersToRecipes),
}))

export const userRelations = relations(userTable, ({ many }) => ({
  recipes: many(recipeTable),
  likes: many(usersToRecipes),
}))

export const usersToRecipes = sqliteTable(
  "users_to_recipes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
      }),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipeTable.id, {
        onDelete: "cascade",
      }),

    createdAt: int("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    unq: unique("user_recipe").on(table.userId, table.recipeId),
  }),
)

export const usersToRecipesRelations = relations(usersToRecipes, ({ one }) => ({
  recipe: one(recipeTable, {
    fields: [usersToRecipes.recipeId],
    references: [recipeTable.id],
  }),
  user: one(userTable, {
    fields: [usersToRecipes.userId],
    references: [userTable.id],
  }),
}))
