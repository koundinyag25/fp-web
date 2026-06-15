import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useOrders } from "./useOrders";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useOrders", () => {
  it("requests the first page without a cursor", async () => {
    m.get.mockResolvedValue({ data: { items: [{ _id: "o1" }], nextCursor: null } });
    const { result } = renderHook(() => useOrders({ status: "pending" }), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(m.get).toHaveBeenCalledWith("/orders", { params: { status: "pending", limit: "20" } });
  });

  it("adds the cursor on the next page", async () => {
    m.get
      .mockResolvedValueOnce({ data: { items: [{ _id: "o1" }], nextCursor: "c1" } })
      .mockResolvedValueOnce({ data: { items: [{ _id: "o2" }], nextCursor: null } });
    const { result } = renderHook(() => useOrders({}), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    result.current.fetchNextPage();
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(m.get).toHaveBeenLastCalledWith("/orders", { params: { limit: "20", cursor: "c1" } });
  });
});
