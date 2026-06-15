import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useAvailableDrivers } from "./useAvailableDrivers";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useAvailableDrivers", () => {
  it("requests free drivers for the date without q when search is empty", async () => {
    m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
    renderHook(() => useAvailableDrivers("2026-06-15", ""), { wrapper: queryWrapper() });
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/allocations/available-drivers", {
        params: { date: "2026-06-15", limit: "20" },
      })
    );
  });

  it("adds q when searching and a cursor on the next page", async () => {
    m.get
      .mockResolvedValueOnce({ data: { items: [{ _id: "d1" }], nextCursor: "c1" } })
      .mockResolvedValueOnce({ data: { items: [{ _id: "d2" }], nextCursor: null } });
    const { result } = renderHook(() => useAvailableDrivers("2026-06-15", "vik"), {
      wrapper: queryWrapper(),
    });
    await waitFor(() =>
      expect(m.get).toHaveBeenCalledWith("/allocations/available-drivers", {
        params: { date: "2026-06-15", limit: "20", q: "vik" },
      })
    );
    result.current.fetchNextPage();
    await waitFor(() =>
      expect(m.get).toHaveBeenLastCalledWith("/allocations/available-drivers", {
        params: { date: "2026-06-15", limit: "20", q: "vik", cursor: "c1" },
      })
    );
  });
});
