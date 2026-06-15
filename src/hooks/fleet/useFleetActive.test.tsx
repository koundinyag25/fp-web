import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useFleetActive } from "./useFleetActive";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useFleetActive", () => {
  it("fetches active vehicles with the default (empty) params", async () => {
    m.get.mockResolvedValue({ data: [{ vehicleId: "v1" }] });
    const { result } = renderHook(() => useFleetActive(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([{ vehicleId: "v1" }]));
    expect(m.get).toHaveBeenCalledWith("/fleet/active", { params: {} });
  });

  it("forwards explicit params", async () => {
    m.get.mockResolvedValue({ data: [] });
    renderHook(() => useFleetActive({ status: "in_transit" }), { wrapper: queryWrapper() });
    await waitFor(() => expect(m.get).toHaveBeenCalledWith("/fleet/active", { params: { status: "in_transit" } }));
  });
});
