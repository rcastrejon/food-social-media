import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { lucia } from "."

export async function createUserSession({
  userId,
  redirectTo,
}: {
  userId: string
  redirectTo: string | undefined
}) {
  const session = await lucia.createSession(userId, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )
  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function destroySession({
  sessionId,
  redirectTo,
}: {
  sessionId: string
  redirectTo: string | undefined
}) {
  await lucia.invalidateSession(sessionId)

  const sessionCookie = lucia.createBlankSessionCookie()
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )
  if (redirectTo) {
    redirect(redirectTo)
  }
}
