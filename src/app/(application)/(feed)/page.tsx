import { unstable_noStore as noStore } from "next/cache"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { validateRequest } from "~/server/auth/validate-request"
import { getFeedPage } from "~/server/models/recipe"
import { FeedList } from "./feed-list"

export default async function Page() {
  const { user } = await validateRequest()
  const queryClient = new QueryClient()

  noStore()
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeedPage(pageParam),
    initialPageParam: 1,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeedList user={user} />
    </HydrationBoundary>
  )
}
