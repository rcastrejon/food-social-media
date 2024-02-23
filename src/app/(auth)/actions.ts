"use server"

import { redirect } from "next/navigation"
import { parse } from "valibot"

import { SignUpSchema } from "~/lib/validators/auth"

export async function signUp(values: unknown) {
  const fields = parse(SignUpSchema, values)
  if (fields.username === "test") {
    return {
      status: 400,
      message: "Nombre de usuario inválido.",
    } as const
  }
  console.log(fields)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  redirect("/")
}

export async function signIn(values: unknown) {
  const fields = parse(SignUpSchema, values)
  if (fields.username === "test") {
    throw new Error("Username already taken")
  }
  console.log(fields)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  redirect("/")
}
