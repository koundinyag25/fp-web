import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useAllocationSummary } from "./useAllocationSummary";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useAllocationSummary", () => {
  it("fetches the summary for the given params", async () => {
    m.get.mockResolvedValue({ data: { fleetSize: 10, allocated: 4 } });
    const { result } = renderHook(() => useAllocationSummary({ date: "2026-06-15" }), {
      wrapper: queryWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual({ fleetSize: 10, allocated: 4 }));
    expect(m.get).toHaveBeenCalledWith("/allocations/summary", { params: { date: "2026-06-15" } });
  });
});
