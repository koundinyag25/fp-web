import { useEffect, useRef, type RefObject } from "react";

/**
 * Returns a ref to attach to a sentinel element near the end of a list. When it
 * scrolls into view (and `enabled` is true), `onLoadMore` fires.
 *
 * Pass `rootRef` when the list scrolls inside its own container (e.g. a table
 * body with a sticky header) so intersection is measured against that container
 * rather than the viewport. Refs are populated before effects run, so reading
 * `rootRef.current` here is safe.
 */
export const useInfiniteScroll = (
  onLoadMore: () => void,
  enabled: boolean,
  rootRef?: RefObject<Element | null>
) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root: rootRef?.current ?? null, rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, enabled, rootRef]);
  return ref;
};
