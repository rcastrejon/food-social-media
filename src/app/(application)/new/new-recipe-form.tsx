"use client"

import { createContext, useContext, useState, useTransition } from "react"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { useFieldArray, useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"

import type { PostRecipeInput } from "~/lib/validators/recipe"
import { SubmitButton } from "~/components/submit-button"
import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { UploadButton } from "~/lib/uploadthing"
import { PostRecipeSchema } from "~/lib/validators/recipe"
import { createRecipe } from "~/server/models/recipe"

type FormStepState =
  | {
      state: "INITIAL"
    }
  | {
      state: "IMAGE_UPLOADED"
      mediaKey: string
    }

const FormStepContext = createContext<{
  state: FormStepState
  setMediaKey: (key: string) => void
} | null>(null)

export function NewRecipeFormStepProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mediaKey, setMediaKey] = useState<string | undefined>(undefined)
  return (
    <FormStepContext.Provider
      value={{
        state: {
          state: mediaKey ? "IMAGE_UPLOADED" : "INITIAL",
          mediaKey: mediaKey ?? "",
        },
        setMediaKey: (key) => setMediaKey(key),
      }}
    >
      {children}
    </FormStepContext.Provider>
  )
}
const useFormStep = () => {
  const context = useContext(FormStepContext)
  if (context === null) {
    throw new Error("useFormStep must be used within a FormStepProvider")
  }
  return context
}

export function UploadImage() {
  const { state, setMediaKey } = useFormStep()
  const disabled = state.state !== "INITIAL"

  if (disabled) {
    return null
  }
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        const [file] = res
        if (file) {
          setMediaKey(file.key)
        }
        return
      }}
      onUploadError={(error: Error) => {
        console.error(error)
        toast.error("Ocurrió un error.")
      }}
      content={{
        button({ ready, isUploading, uploadProgress }) {
          if (isUploading) return `${uploadProgress}%`
          else if (ready) return "Añadir imagen"
          return "Cargando..."
        },
        allowedContent({ ready }) {
          if (ready) return "Imagen (4MB)"
          return null
        },
      }}
    />
  )
}

export function NewRecipeForm() {
  const { state } = useFormStep()
  const disabled = state.state !== "IMAGE_UPLOADED"

  const form = useForm<PostRecipeInput>({
    resolver: valibotResolver(PostRecipeSchema),
    defaultValues: {
      title: "",
      ingredients: [{ content: "" }],
    },
  })
  const [isPending, startTransition] = useTransition()

  function onSubmit(values: PostRecipeInput) {
    startTransition(() => {
      void createRecipe(values)
    })
  }

  if (disabled) {
    return null
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <input
          {...form.register("mediaKey", { value: state.mediaKey })}
          hidden
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>¡Sé creativo!</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <IngredientListFieldArray />
        <SubmitButton type="submit" className="w-full" isSubmitting={isPending}>
          Publicar
        </SubmitButton>
      </form>
    </Form>
  )
}

function IngredientListFieldArray() {
  const { control, trigger } = useFormContext<PostRecipeInput>()
  const { fields, append } = useFieldArray({
    control: control,
    name: "ingredients",
  })

  async function addIngredient() {
    const isValid = await trigger("ingredients", { shouldFocus: true })
    if (isValid) {
      append({ content: "" })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-2">
        <Label>Ingredientes</Label>
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`ingredients.${index}.content`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
      <Button
        className="w-full"
        variant="secondary"
        type="button"
        onClick={addIngredient}
      >
        Nuevo ingrediente
      </Button>
    </div>
  )
}
