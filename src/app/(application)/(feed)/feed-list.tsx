"use client"

import { Fragment } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { intlFormatDistance } from "date-fns"
import { type User } from "lucia"
import { toast } from "sonner"
import { useCopyToClipboard, useIntersectionObserver } from "usehooks-ts"
import { create } from "zustand"

import type { FeedRow } from "~/server/models/recipe"
import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"
import { deleteRecipe, getFeedPage, updateLike } from "~/server/models/recipe"

interface DeleteRecipeDialogState {
  isOpen: boolean
  recipeId: string | undefined
  actions: {
    open: (recipeId: string) => void
    close: () => void
  }
}

const useDeleteRecipeDialogStore = create<DeleteRecipeDialogState>((set) => ({
  isOpen: false,
  recipeId: undefined,
  actions: {
    open: (recipeId: string) => set({ isOpen: true, recipeId }),
    close: () => set({ isOpen: false, recipeId: undefined }),
  },
}))

const useDeleteRecipeDialogActions = () =>
  useDeleteRecipeDialogStore((state) => state.actions)

function useInfiniteFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeedPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  })
}

export function FeedList({ user }: { user: User | null }) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteFeed()

  if (data) {
    return (
      <div className="sm:m-auto sm:max-w-md">
        {data.pages.map((page, pageIdx) => (
          <Fragment key={pageIdx}>
            {page.rows.map((recipe) => (
              <FeedItem
                key={recipe.id}
                recipe={recipe}
                isUserOwner={recipe.userId === user?.id}
              />
            ))}
          </Fragment>
        ))}
        <IntersectionElement
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadNextPage={fetchNextPage}
        />
        <DeleteRecipeDialog />
      </div>
    )
  }
}

function FeedItem({
  recipe,
  isUserOwner,
}: {
  recipe: FeedRow
  isUserOwner: boolean
}) {
  function getRedirectUrl() {
    return `${window.location.origin}${recipe.redirectUrl}`
  }

  const [, copy] = useCopyToClipboard()
  function handleCopyLink() {
    copy(getRedirectUrl())
      .then(() => {
        toast.info("Enlace copiado al portapapeles.")
      })
      .catch(() => {
        toast.error("No se pudo copiar el enlace.")
      })
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-0">
        <div>
          <Link href={recipe.redirectUrl}>
            <h3 className="font-serif text-xl font-semibold leading-none underline-offset-2 hover:underline">
              {recipe.title}
            </h3>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="group ml-5 flex h-full items-center justify-center outline-none"
              aria-label="Más opciones"
            >
              <span className="i-[lucide--ellipsis] h-5 w-5 bg-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <button className="w-full" type="submit" onClick={handleCopyLink}>
                Copiar enlace
              </button>
            </DropdownMenuItem>
            <OwnerDropdownItems
              isUserOwner={isUserOwner}
              recipeId={recipe.id}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link href={recipe.redirectUrl}>
        <AspectRatio
          ratio={1}
          className="overflow-hidden bg-primary/10 sm:rounded-md"
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
      </Link>
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

function OwnerDropdownItems({
  isUserOwner,
  recipeId,
}: {
  isUserOwner: boolean
  recipeId: string
}) {
  const { open } = useDeleteRecipeDialogActions()

  if (!isUserOwner) {
    return null
  }
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <button className="w-full" onClick={() => open(recipeId)}>
          Borrar receta
        </button>
      </DropdownMenuItem>
    </>
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
  const { isPending, variables, mutate } = useMutation({
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

  const iconClass = cn(
    "h-5 w-5 transition-colors group-hover:bg-red-500",
    optimisticData.userHasLiked === false && "i-[mingcute--heart-line]",
    optimisticData.userHasLiked === true &&
      "i-[mingcute--heart-fill] bg-red-500",
  )
  const textClass = cn(
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

function DeleteRecipeDialog() {
  const isOpen = useDeleteRecipeDialogStore((state) => state.isOpen)
  const recipeId = useDeleteRecipeDialogStore((state) => state.recipeId)
  const { close } = useDeleteRecipeDialogActions()

  const { mutate, isPending } = useMutation({
    mutationFn: (recipeId: string) => deleteRecipe(recipeId),
    onSuccess: () => {
      close()
    },
  })

  function handleConfirm() {
    if (!recipeId) {
      return
    }
    mutate(recipeId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent role="alertdialog">
        <DialogHeader>
          <DialogTitle>Borrar receta</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres borrar esta receta? Esta acción no se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || recipeId === undefined}
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
