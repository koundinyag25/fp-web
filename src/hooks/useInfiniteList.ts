import { useInfiniteQuery } from "@tanstack/react-query";
import type { Page } from "@/types";

/**
 * Wraps useInfiniteQuery for the cursor-paginated `{ items, nextCursor }` envelope.
 * Flattens pages into a single `items` array for the view.
 */
export const useInfiniteList = <T,>(
  key: unknown[],
  fetchPage: (cursor: string | null) => Promise<Page<T>>
) => {
  const q = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });
  return {
    items: q.data?.pages.flatMap((p) => p.items) ?? [],
    isLoading: q.isLoading,
    fetchNextPage: q.fetchNextPage,
    hasNextPage: q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
  };
};
