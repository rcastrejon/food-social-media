"use server"

import { parse } from "valibot"

import { SignInSchema, SignUpSchema } from "~/lib/validators/auth"
import { createUserSession } from "~/server/auth/sessions"
import { createUser, verifyUsernamePassword } from "~/server/models/user"

export async function signUp(values: unknown) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const { username, password, redirectTo } = parse(SignUpSchema, values)
  const userCreated = await createUser(username, password)
  if (userCreated.error === "username-taken") {
    return {
      error: "Este nombre de usuario ya está en uso. Por favor, elige otro.",
    }
  }
  await createUserSession({
    userId: userCreated.userId,
    redirectTo: redirectTo ?? "/",
  })
}

export async function signIn(values: unknown) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const { username, password, redirectTo } = parse(SignInSchema, values)
  const valid = await verifyUsernamePassword(username, password)
  if (valid.error === "invalid-username-pass") {
    return { error: "Nombre de usuario o contraseña incorrectos." }
  }
  await createUserSession({
    userId: valid.user.id,
    redirectTo: redirectTo ?? "/",
  })
}
