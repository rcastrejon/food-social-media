import type { Input } from "valibot"
import { array, custom, minLength, object, string, toTrimmed } from "valibot"

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
  content: string([
    custom((htmlString) => {
      const cleanString = htmlString.replace(/<\/?[^>]+(>|$)/g, "")
      // Check if the cleaned string has more than 20 characters
      return cleanString.trim().length >= 50
    }, "La receta debe tener al menos 50 caracteres."),
  ]),
  mediaKey: string([minLength(1, "Es necesario subir una imagen.")]),
})

export type PostRecipeInput = Input<typeof PostRecipeSchema>

export const EditRecipeSchema = object({
  title: string([toTrimmed(), minLength(1, "Elige un título para tu receta.")]),
  ingredients: array(IngredientSchema, [
    minLength(1, "Agrega al menos un ingrediente."),
  ]),
  content: string([
    custom((htmlString) => {
      const cleanString = htmlString.replace(/<\/?[^>]+(>|$)/g, "")
      // Check if the cleaned string has more than 20 characters
      return cleanString.trim().length >= 50
    }, "La receta debe tener al menos 50 caracteres."),
  ]),
})

export type EditRecipeInput = Input<typeof EditRecipeSchema>
