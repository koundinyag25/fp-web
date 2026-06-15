import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useAllocations } from "./useAllocations";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useAllocations", () => {
  it("lists allocations for the given range", async () => {
    m.get.mockResolvedValue({ data: [{ _id: "a1" }] });
    const { result } = renderHook(() => useAllocations({ from: "2026-06-15", to: "2026-06-21" }), {
      wrapper: queryWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual([{ _id: "a1" }]));
    expect(m.get).toHaveBeenCalledWith("/allocations", { params: { from: "2026-06-15", to: "2026-06-21" } });
  });
});
