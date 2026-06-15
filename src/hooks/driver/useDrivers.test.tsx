import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { queryWrapper } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn() } }));
import { http } from "@/utils/http";
import { useDrivers } from "./useDrivers";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("useDrivers", () => {
  it("returns the first high-limit page of drivers", async () => {
    m.get.mockResolvedValue({ data: { items: [{ _id: "d1" }, { _id: "d2" }], nextCursor: null } });
    const { result } = renderHook(() => useDrivers(), { wrapper: queryWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([{ _id: "d1" }, { _id: "d2" }]));
    expect(m.get).toHaveBeenCalledWith("/drivers", { params: { limit: "100" } });
  });
});
