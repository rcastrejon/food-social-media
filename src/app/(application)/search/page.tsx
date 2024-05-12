import Image from "next/image"
import Link from "next/link"

import { AspectRatio } from "~/components/ui/aspect-ratio"
import { searchRecipe } from "~/server/models/recipe"
import { SearchBar } from "./search-bar"

export default function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string
  }
}) {
  const query = searchParams?.query
  return (
    <div className="sm:m-auto sm:max-w-md">
      <SearchBar />
      <div className="h-6" />
      <ResultsTable query={query} />
    </div>
  )
}

async function ResultsTable({ query }: { query: string | undefined }) {
  if (!query) {
    return null
  }

  const results = await searchRecipe(query)
  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => (
        <div
          key={result.id}
          className="grid grid-cols-[150px,_1fr] gap-3 rounded-lg border bg-card p-3 text-card-foreground"
        >
          <Link href={`/p/${result.id}`}>
            <AspectRatio
              ratio={1}
              className="overflow-hidden rounded-md bg-primary/10"
            >
              <Image
                src={result.media.url}
                alt={result.title}
                placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
                priority
                fill
              />
            </AspectRatio>
          </Link>
          <div className="flex flex-col gap-1.5">
            <Link
              className="font-serif text-base font-semibold leading-none underline-offset-2 hover:underline"
              href={`/p/${result.id}`}
            >
              {result.title}
            </Link>
            <span className="text-xs text-muted-foreground">
              Publicado por{" "}
              <Link
                className="font-semibold underline-offset-2 hover:underline"
                href={result.user ? `/profile/${result.user.username}` : "#"}
              >
                {result.user?.username ?? "[ELIMINADO]"}
              </Link>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
