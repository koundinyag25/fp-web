import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useDriverStats } from "./useDriverStats";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useDriverStats", () => {
  it("fetches stats when a driverId is given", async () => {
    m.get.mockResolvedValue({ data: { completed: 3, failed: 1 } });
    const { result } = renderHook(() => useDriverStats("d1"), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.data).toEqual({ completed: 3, failed: 1 }));
    expect(m.get).toHaveBeenCalledWith("/drivers/d1/stats");
  });

  it("stays disabled (no request) when driverId is empty", () => {
    const { result } = renderHook(() => useDriverStats(""), { wrapper: queryWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
    expect(m.get).not.toHaveBeenCalled();
  });
});
