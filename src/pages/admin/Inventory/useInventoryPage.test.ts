import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useInventoryPage } from "./useInventoryPage";

const m = http as unknown as { get: Mock };

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client }, children);
};

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockImplementation((url: string) => {
    if (url === "/inventory") return Promise.resolve({ data: { thresholds: { low: 20, warn: 50 }, rows: [] } });
    return Promise.resolve({ data: { items: [], nextCursor: null } });
  });
});

describe("useInventoryPage params", () => {
  it("serializes active filters into the /inventory query (filters branch)", async () => {
    const { result } = renderHook(() => useInventoryPage(), { wrapper: wrapper() });
    await waitFor(() => expect(m.get).toHaveBeenCalledWith("/inventory", { params: {} }));

    act(() => result.current.setFilters([{ field: "locationId", op: "in", values: ["h1"] }]));
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/inventory", {
        params: { filters: JSON.stringify([{ field: "locationId", op: "in", values: ["h1"] }]) },
      })
    );
  });

  it("derives the pivot's product columns from the first row, empty when no rows", async () => {
    const { result } = renderHook(() => useInventoryPage(), { wrapper: wrapper() });
    await waitFor(() => expect(m.get).toHaveBeenCalledWith("/inventory", { params: {} }));
    expect(result.current.rows).toEqual([]);
    expect(result.current.productCols).toEqual([]); // rows[0]?.products ?? [] fallback
  });
});
