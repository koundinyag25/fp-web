import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { queryWrapper } from "@/test/utils";
import { useInfiniteList } from "./useInfiniteList";

describe("useInfiniteList", () => {
  it("flattens pages and loads the next page", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ items: [{ id: 1 }], nextCursor: "c1" })
      .mockResolvedValueOnce({ items: [{ id: 2 }], nextCursor: null });

    const { result } = renderHook(() => useInfiniteList<{ id: number }>(["k"], fetchPage), {
      wrapper: queryWrapper(),
    });

    await waitFor(() => expect(result.current.items).toEqual([{ id: 1 }]));
    expect(result.current.hasNextPage).toBe(true);
    expect(fetchPage).toHaveBeenCalledWith(null);

    act(() => {
      void result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }]));
    expect(result.current.hasNextPage).toBe(false);
    expect(fetchPage).toHaveBeenCalledWith("c1");
  });
});
