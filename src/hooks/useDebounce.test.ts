import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  afterEach(() => vi.useRealTimers());

  it("only updates after the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: "a" } });
    expect(result.current).toBe("a");
    rerender({ v: "b" });
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("b");
  });
});
