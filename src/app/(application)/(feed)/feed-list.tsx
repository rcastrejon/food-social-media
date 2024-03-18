"use client"

import { Fragment } from "react"
import Image from "next/image"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import clsx from "clsx"
import { intlFormatDistance } from "date-fns"
import { useIntersectionObserver } from "usehooks-ts"

import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Button } from "~/components/ui/button"
import { getFeedPage, updateLike } from "~/server/models/recipe"

function useInfiniteFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeedPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  })
}

export function FeedList() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteFeed()

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
  recipe,
}: {
  recipe: Awaited<ReturnType<typeof getFeedPage>>["rows"][0]
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center px-4 py-3.5 sm:px-0">
        <div>
          <h3 className="font-serif text-xl font-semibold leading-none">
            {recipe.title}
          </h3>
        </div>
      </div>
      <AspectRatio
        ratio={1}
        className="overflow-hidden bg-primary/10 sm:rounded-md"
      >
        <Image
          src={recipe.media.url}
          alt={recipe.title}
          sizes="(min-width: 640px) 448px, 100vw"
          placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
          fill
        />
      </AspectRatio>
      <div className="px-4 sm:px-0">
        <div className="flex flex-col">
          <div className="mt-2">
            <LikeButton
              recipeId={recipe.id}
              likes={recipe.likes}
              userHasLiked={recipe.userHasLiked}
            />
            <p className="text-sm">
              Publicado por{" "}
              <span className="font-semibold">
                {recipe.user?.username ?? "[ELIMINADO]"}
              </span>
            </p>
            <p className="text-sm" suppressHydrationWarning>
              {intlFormatDistance(recipe.createdAt, new Date(), {
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

function LikeButton({
  recipeId,
  likes,
  userHasLiked,
}: {
  recipeId: string
  likes: number
  userHasLiked: boolean
}) {
  const queryClient = useQueryClient()
  const { isPending, mutate, variables } = useMutation({
    mutationFn: (newLikeState: boolean) => updateLike(recipeId, newLikeState),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  })
  const optimisticData = isPending
    ? {
        likes: likes + (variables ? 1 : -1),
        userHasLiked: variables,
      }
    : {
        likes,
        userHasLiked,
      }

  const iconClass = clsx(
    "h-5 w-5 transition-colors group-hover:bg-red-500",
    optimisticData.userHasLiked === false && "i-[mingcute--heart-line]",
    optimisticData.userHasLiked === true &&
      "i-[mingcute--heart-fill] bg-red-500",
  )
  const textClass = clsx(
    "px-1 text-xs transition-colors group-hover:text-red-500",
    optimisticData.userHasLiked === true && "text-red-500",
  )

  return (
    <button
      className="group flex flex-row items-center"
      onClick={() => mutate(!optimisticData.userHasLiked)}
      disabled={isPending}
    >
      <div className="flex flex-row items-center">
        <span className={iconClass} />
      </div>
      <div className="flex flex-row items-center">
        <span className={textClass}>{optimisticData.likes}</span>
      </div>
    </button>
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
      <div className="my-10 text-center">
        <p className="text-sm text-muted-foreground">Nada más que ver</p>
      </div>
    )
  }

  return (
    <div className="mt-10 flex justify-center" ref={ref}>
      {isFetchingNextPage ? (
        <span className="i-[lucide--loader] h-6 w-6 animate-spin" />
      ) : (
        <Button variant="link" onClick={loadNextPage}>
          Cargar más
        </Button>
      )}
    </div>
  )
}
