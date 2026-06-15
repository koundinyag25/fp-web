import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useDriverSearch } from "./useDriverSearch";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useDriverSearch", () => {
  it("omits the q param when the search is empty", async () => {
    m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
    renderHook(() => useDriverSearch(""), { wrapper: queryWrapper() });
    await waitFor(() => expect(m.get).toHaveBeenCalledWith("/drivers", { params: { limit: "20" } }));
  });

  it("passes q when searching, and adds the cursor on the next page", async () => {
    m.get
      .mockResolvedValueOnce({ data: { items: [{ _id: "d1" }], nextCursor: "c1" } })
      .mockResolvedValueOnce({ data: { items: [{ _id: "d2" }], nextCursor: null } });
    const { result } = renderHook(() => useDriverSearch("asha"), { wrapper: queryWrapper() });
    await waitFor(() => expect(m.get).toHaveBeenCalledWith("/drivers", { params: { limit: "20", q: "asha" } }));
    result.current.fetchNextPage();
    await waitFor(() =>
      expect(m.get).toHaveBeenLastCalledWith("/drivers", { params: { limit: "20", q: "asha", cursor: "c1" } })
    );
  });
});
