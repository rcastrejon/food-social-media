import { redirect } from "next/navigation"

import { validateRequest } from "~/server/auth/validate-request"

export default async function Page() {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/new")
  }

  return (
    <div>
      <h1>new</h1>
    </div>
  )
}
