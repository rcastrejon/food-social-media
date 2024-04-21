import Image from "next/image"
import { notFound } from "next/navigation"
import parse from "html-react-parser"

import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Separator } from "~/components/ui/separator"
import { getRecipeById } from "~/server/models/recipe"

export default async function Page({ params }: { params: { id: string } }) {
  const recipe = await getRecipeById(params.id)
  if (!recipe) {
    notFound()
  }

  return (
    <div className="mx-auto grid max-w-screen-lg gap-4 md:grid-cols-2">
      <div className="relative">
        <div className="sticky top-header">
          <AspectRatio
            ratio={1}
            className="overflow-hidden bg-primary/10 md:rounded-md"
          >
            <Image
              src={recipe.media.url}
              alt={recipe.title}
              sizes="(min-width: 640px) 448px, 100vw"
              placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
              priority
              fill
            />
          </AspectRatio>
        </div>
      </div>
      <div className="mx-4 flex flex-col md:mx-0">
        <h1 className="font-serif text-2xl font-semibold leading-none">
          {recipe.title}
        </h1>
        <Separator className="my-4" />
        <div>
          <h2 className="font-serif text-xl font-semibold leading-none">
            Ingredientes
          </h2>
          <ul className="list-inside list-disc">
            {recipe.body.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient.content}</li>
            ))}
          </ul>
        </div>
        <Separator className="my-4" />
        <div>
          <h2 className="font-serif text-xl font-semibold leading-none">
            Preparación
          </h2>
          <div className="prose prose-sm prose-zinc whitespace-pre-wrap">
            {parse(recipe.body.content)}
          </div>
        </div>
      </div>
    </div>
  )
}
