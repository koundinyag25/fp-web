import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useShiftToday } from "./useShiftToday";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useShiftToday", () => {
  it("fetches today's shift for the driver", async () => {
    m.get.mockResolvedValue({ data: { shift: null, deliveries: [] } });
    const { result } = renderHook(() => useShiftToday("d1"), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.data).toEqual({ shift: null, deliveries: [] }));
    expect(m.get).toHaveBeenCalledWith(
      "/shifts/today",
      expect.objectContaining({ params: expect.objectContaining({ driverId: "d1" }) })
    );
  });
});
