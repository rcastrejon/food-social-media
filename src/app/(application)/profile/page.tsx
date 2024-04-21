import { redirect } from "next/navigation"

import { validateRequest } from "~/server/auth/validate-request"
import { ProfilePage } from "./profile-page"

export default async function Page() {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/profile")
  }

  return <ProfilePage username={user.username} />
}
