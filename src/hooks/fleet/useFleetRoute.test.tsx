import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useFleetRoute } from "./useFleetRoute";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useFleetRoute", () => {
  it("fetches the route when a deliveryId is given", async () => {
    m.get.mockResolvedValue({ data: { coords: [[1, 2]] } });
    const { result } = renderHook(() => useFleetRoute("del1"), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.data).toEqual({ coords: [[1, 2]] }));
    expect(m.get).toHaveBeenCalledWith("/fleet/route/del1");
  });

  it("stays disabled (no request) when deliveryId is undefined", () => {
    const { result } = renderHook(() => useFleetRoute(), { wrapper: queryWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
    expect(m.get).not.toHaveBeenCalled();
  });
});
