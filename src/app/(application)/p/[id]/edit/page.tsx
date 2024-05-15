import { redirect } from "next/navigation"

import { validateRequest } from "~/server/auth/validate-request"
import { getRecipeById } from "~/server/models/recipe"
import { EditRecipeForm } from "./edit-page-form"

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest()
  if (!user) {
    redirect("/sign-in?redirect-to=/")
  }
  const recipe = await getRecipeById(params.id)
  if (user.id !== recipe?.userId) {
    redirect("/")
  }

  return (
    <div className="px-4 sm:m-auto sm:max-w-lg">
      <h1 className="font-serif text-2xl font-semibold leading-none tracking-tight">
        Editar receta
      </h1>
      <p className="text-sm text-muted-foreground">
        Edita los detalles de tu receta y guarda los cambios.
      </p>
      <div className="mt-3.5">
        <EditRecipeForm
          id={recipe.id}
          defaultValues={{
            title: recipe.title,
            content: recipe.body.content,
            ingredients: recipe.body.ingredients,
          }}
        />
      </div>
    </div>
  )
}
