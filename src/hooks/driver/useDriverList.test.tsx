import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useDriverList } from "./useDriverList";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useDriverList", () => {
  it("requests the first page with no cursor", async () => {
    m.get.mockResolvedValue({ data: { items: [{ _id: "d1" }], nextCursor: "c1" } });
    const { result } = renderHook(() => useDriverList({ status: "active" }), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(m.get).toHaveBeenCalledWith("/drivers", { params: { status: "active", limit: "20" } });
  });

  it("includes the cursor when fetching the next page", async () => {
    m.get
      .mockResolvedValueOnce({ data: { items: [{ _id: "d1" }], nextCursor: "c1" } })
      .mockResolvedValueOnce({ data: { items: [{ _id: "d2" }], nextCursor: null } });
    const { result } = renderHook(() => useDriverList({}), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    result.current.fetchNextPage();
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(m.get).toHaveBeenLastCalledWith("/drivers", { params: { limit: "20", cursor: "c1" } });
  });
});
