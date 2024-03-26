"use client"

import { createContext, useContext, useState, useTransition } from "react"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useFieldArray, useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"

import type { PostRecipeInput } from "~/lib/validators/recipe"
import { SubmitButton } from "~/components/submit-button"
import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { UploadButton } from "~/lib/uploadthing"
import { cn } from "~/lib/utils"
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
  const [mediaKey, setMediaKey] = useState<string | undefined>()
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
      content: "<p>Escribe aquí tu receta.</p>",
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
      <form
        className="mb-10 flex flex-col gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
              <FormMessage />
            </FormItem>
          )}
        />
        <IngredientListFieldArray />
        <FormField
          control={form.control}
          name="content"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>Instrucciones</FormLabel>
              <FormControl>
                <TextEditor value={value} onChange={onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton type="submit" className="w-full" isSubmitting={isPending}>
          Publicar
        </SubmitButton>
      </form>
    </Form>
  )
}

function IngredientListFieldArray() {
  const { control, formState, trigger, getFieldState } =
    useFormContext<PostRecipeInput>()
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "ingredients",
  })
  const { error } = getFieldState("ingredients", formState)

  async function addIngredient() {
    const isValid = await trigger("ingredients", { shouldFocus: true })
    if (isValid) {
      append({ content: "" })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-2">
        <Label
          className={cn(error && "text-destructive")}
          htmlFor={`ingredients.${fields.length - 1}.form-item`}
        >
          Ingredientes
        </Label>
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`ingredients.${index}.content`}
            render={({ field }) => (
              <FormItem>
                <div className="flex space-x-2">
                  <FormControl id={`ingredients.${index}.form-item`}>
                    <Input {...field} />
                  </FormControl>
                  <Button
                    aria-label="Eliminar ingrediente"
                    variant="outline"
                    type="button"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <span className="i-[lucide--trash] h-4 w-4" />
                  </Button>
                </div>
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

function TextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (...event: unknown[]) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        strike: false,
        codeBlock: false,
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    injectCSS: false,
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[256px] rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm prose-zinc whitespace-pre-wrap",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })
  if (!editor) return null

  const styleValues = [
    editor.isActive("bold") ? "bold" : "",
    editor.isActive("italic") ? "italic" : "",
  ]
  const listValues = editor.isActive("bulletList")
    ? "bulletList"
    : editor.isActive("orderedList")
      ? "orderedList"
      : ""
  const headingStyle = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : "paragraph"

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={headingStyle}
          onValueChange={(value) => {
            switch (value) {
              case "h2":
                editor.chain().focus().setHeading({ level: 2 }).run()
                break
              case "h3":
                editor.chain().focus().setHeading({ level: 3 }).run()
                break
              default:
                editor.chain().focus().setParagraph().run()
                break
            }
          }}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Selecciona un estilo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Texto normal</SelectItem>
            <SelectItem value="h2">Encabezado 1</SelectItem>
            <SelectItem value="h3">Encabezado 2</SelectItem>
          </SelectContent>
        </Select>
        <Separator className="h-5" orientation="vertical" />
        <ToggleGroup
          type="multiple"
          size="sm"
          value={styleValues}
          onValueChange={(value) => {
            if (value.includes("bold")) {
              editor.chain().focus().setBold().run()
            } else {
              editor.chain().focus().unsetBold().run()
            }

            if (value.includes("italic")) {
              editor.chain().focus().setItalic().run()
            } else {
              editor.chain().focus().unsetItalic().run()
            }
          }}
        >
          <ToggleGroupItem value="bold" aria-label="Cambiar negrita">
            <span className="i-[lucide--bold] h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Cambiar cursiva">
            <span className="i-[lucide--italic] h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Separator className="h-5" orientation="vertical" />
        <ToggleGroup
          type="single"
          size="sm"
          value={listValues}
          onValueChange={(value) => {
            switch (value) {
              case "bulletList":
                editor.chain().focus().toggleBulletList().run()
                break
              case "orderedList":
                editor.chain().focus().toggleOrderedList().run()
                break
              default:
                editor.chain().focus().clearNodes().run()
                break
            }
          }}
        >
          <ToggleGroupItem value="bulletList" aria-label="Lista con viñetas">
            <span className="i-[lucide--list] h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="orderedList" aria-label="Lista enumerada">
            <span className="i-[lucide--list-ordered] h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
