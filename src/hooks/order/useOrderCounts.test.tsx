import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useOrderCounts } from "./useOrderCounts";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useOrderCounts", () => {
  it("fetches counts with the default (empty) params", async () => {
    m.get.mockResolvedValue({ data: { pending: 2 } });
    const { result } = renderHook(() => useOrderCounts(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.data).toEqual({ pending: 2 }));
    expect(m.get).toHaveBeenCalledWith("/orders/counts", { params: {} });
  });

  it("forwards explicit params", async () => {
    m.get.mockResolvedValue({ data: { pending: 0 } });
    renderHook(() => useOrderCounts({ status: "pending" }), { wrapper: queryWrapper() });
    await waitFor(() => expect(m.get).toHaveBeenCalledWith("/orders/counts", { params: { status: "pending" } }));
  });
});
