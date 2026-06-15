import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ToastProvider } from "@/organisms/Toaster";

vi.mock("@/utils/http", () => ({
  http: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
import { http } from "@/utils/http";
import { useAllocationsPage } from "./useAllocationsPage";

const m = http as unknown as { get: Mock; post: Mock; delete: Mock };

// useAllocationsPage pulls in the toast + query providers via its mutation hooks.
const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, createElement(ToastProvider, null, children));
};

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
  m.post.mockResolvedValue({ data: {} });
});

describe("useAllocationsPage", () => {
  // save() guards against a missing prefill vehicle: before openAllocate runs,
  // prefill.vehicle is null, so save must no-op (no POST).
  it("does nothing when save is called with no prefilled vehicle", () => {
    const { result } = renderHook(() => useAllocationsPage(), { wrapper: wrapper() });
    expect(result.current.prefill.vehicle).toBeNull();
    result.current.save("d1");
    expect(m.post).not.toHaveBeenCalled();
  });
});
