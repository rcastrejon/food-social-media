import { redirect } from "next/navigation"

import { validateRequest } from "~/server/auth/validate-request"

export default async function Page() {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/profile")
  }

  return (
    <div>
      <h1>Perfil</h1>
    </div>
  )
}
