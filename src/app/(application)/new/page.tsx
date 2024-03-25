import { redirect } from "next/navigation"

import { validateRequest } from "~/server/auth/validate-request"
import {
  NewRecipeForm,
  NewRecipeFormStepProvider,
  UploadImage,
} from "./new-recipe-form"

export default async function Page() {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/new")
  }

  return (
    <div className="px-4 sm:m-auto sm:max-w-lg">
      <h1 className="font-serif text-2xl font-semibold leading-none tracking-tight">
        Nueva receta
      </h1>
      <p className="text-sm text-muted-foreground">
        Publica una receta para que otros usuarios puedan disfrutarla.
      </p>
      <div className="mt-3.5">
        <NewRecipeFormStepProvider>
          <UploadImage />
          <NewRecipeForm />
        </NewRecipeFormStepProvider>
      </div>
    </div>
  )
}
