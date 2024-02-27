"use client"

import { Fragment } from "react"
import Image from "next/image"
import { useInfiniteQuery } from "@tanstack/react-query"
import { intlFormatDistance } from "date-fns"
import { useIntersectionObserver } from "usehooks-ts"

import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Button } from "~/components/ui/button"
import { getFeedPage } from "~/server/models/recipe"

export function FeedList() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: ({ pageParam }) => getFeedPage(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    })

  if (data) {
    return (
      <div className="sm:m-auto sm:max-w-md">
        {data.pages.map((page, pageIdx) => (
          <Fragment key={pageIdx}>
            {page.rows.map((recipe) => (
              <FeedItem key={recipe.id} recipe={recipe} />
            ))}
          </Fragment>
        ))}
        <IntersectionElement
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadNextPage={fetchNextPage}
        />
      </div>
    )
  }
}

function FeedItem({
  recipe: { title, user, createdAt, media },
}: {
  recipe: Awaited<ReturnType<typeof getFeedPage>>["rows"][0]
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center px-4 py-3.5 sm:px-0">
        <div>
          <h3 className="font-serif text-xl font-semibold leading-none">
            {title}
          </h3>
        </div>
      </div>
      <AspectRatio
        ratio={1}
        className="overflow-hidden bg-primary/10 sm:rounded-md"
      >
        <Image
          src={media.url}
          alt={title}
          sizes="(min-width: 640px) 448px, 100vw"
          placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
          fill
        />
      </AspectRatio>
      <div className="px-4 sm:px-0">
        <div className="flex flex-col">
          <div className="mt-2">
            <p className="text-sm">
              Publicado por{" "}
              <span className="font-semibold">
                {user?.username ?? "[ELIMINADO]"}
              </span>
            </p>
            <p className="text-sm" suppressHydrationWarning>
              {intlFormatDistance(createdAt, new Date(), {
                locale: "es",
                style: "short",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntersectionElement({
  hasNextPage,
  isFetchingNextPage,
  loadNextPage,
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  loadNextPage: () => void
}) {
  const { ref } = useIntersectionObserver({
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        loadNextPage()
      }
    },
  })

  if (!hasNextPage) {
    return (
      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground">Nada mas que ver</p>
      </div>
    )
  }

  return (
    <div className="mt-10 flex justify-center" ref={ref}>
      {isFetchingNextPage ? (
        <span className="i-[lucide--loader] h-6 w-6 animate-spin" />
      ) : (
        <Button variant="link" onClick={loadNextPage}>
          Cargar mas
        </Button>
      )}
    </div>
  )
}
