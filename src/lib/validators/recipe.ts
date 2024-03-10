import type { Input } from "valibot"
import { array, minLength, object, string, toTrimmed } from "valibot"

export const IngredientSchema = object({
  content: string([
    toTrimmed(),
    minLength(1, "El ingrediente no puede estar vacío."),
  ]),
})

export const PostRecipeSchema = object({
  title: string([toTrimmed(), minLength(1, "Elige un título para tu receta.")]),
  ingredients: array(IngredientSchema, [
    minLength(1, "Agrega al menos un ingrediente."),
  ]),
  mediaKey: string([minLength(1, "Es necesario subir una imagen.")]),
})

export type PostRecipeInput = Input<typeof PostRecipeSchema>
