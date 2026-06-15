import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import { useDriverGps } from "./useDriverGps";

const m = http as unknown as { post: Mock };

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  m.post.mockResolvedValue({ data: {} });
});

describe("useDriverGps", () => {
  it("sends a one-off GPS ping and invalidates today's shift", async () => {
    const spy = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDriverGps("d1"), { wrapper });
    result.current.sendGps.mutate();
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/drivers/d1/gps"));
    expect(spy).toHaveBeenCalledWith({ queryKey: ["today", "d1"] });
  });

  it("starts a drive without replay by default", async () => {
    const { result } = renderHook(() => useDriverGps("d1"), { wrapper });
    result.current.startDrive.mutate(undefined);
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/drivers/d1/drive/start", { replay: false })
    );
  });

  it("starts a drive with replay when requested", async () => {
    const { result } = renderHook(() => useDriverGps("d1"), { wrapper });
    result.current.startDrive.mutate(true);
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/drivers/d1/drive/start", { replay: true })
    );
  });

  it("stops a drive", async () => {
    const { result } = renderHook(() => useDriverGps("d1"), { wrapper });
    result.current.stopDrive.mutate();
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/drivers/d1/drive/stop"));
  });
});
