import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { getFeedPage } from "~/server/models/recipe"
import { FeedList } from "./feed-list"

export default async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeedPage(pageParam),
    initialPageParam: 1,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeedList />
    </HydrationBoundary>
  )
}
