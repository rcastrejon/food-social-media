import { relations } from "drizzle-orm"
import { blob, int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const userTable = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
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
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),

  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
})

export const recipeTable = sqliteTable("recipe", {
  id: text("id").notNull().primaryKey(),
  title: text("title").notNull(),
  content: blob("content", { mode: "json" })
    .$type<{ ingredients: Array<{ content: string }> }>()
    .notNull(),

  userId: text("user_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  mediaKey: text("media_key")
    .notNull()
    .references(() => mediaTable.key),

  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
})

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

  createdAt: int("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
})

export type MediaSelect = typeof mediaTable.$inferSelect
export type MediaInsert = Omit<typeof mediaTable.$inferInsert, "userId"> & {
  userId: UserInsert["id"]
}

export const recipeRelations = relations(recipeTable, ({ one }) => ({
  user: one(userTable, {
    fields: [recipeTable.userId],
    references: [userTable.id],
  }),
  media: one(mediaTable, {
    fields: [recipeTable.mediaKey],
    references: [mediaTable.key],
  }),
}))
