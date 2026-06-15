import { renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ToastProvider } from "@/organisms/Toaster";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import { useAllocationMutations } from "./useAllocationMutations";

const m = http as unknown as { post: Mock; delete: Mock };

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  m.post.mockResolvedValue({ data: {} });
  m.delete.mockResolvedValue({ data: {} });
});

describe("useAllocationMutations", () => {
  it("creates an allocation and toasts success", async () => {
    const { result } = renderHook(() => useAllocationMutations(), { wrapper });
    result.current.create.mutate({ vehicleId: "v1", driverId: "d1", date: "2026-06-15" });
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith("/allocations", { vehicleId: "v1", driverId: "d1", date: "2026-06-15" })
    );
    expect(await screen.findByText("Vehicle allocated.")).toBeInTheDocument();
  });

  it("removes an allocation and toasts success", async () => {
    const { result } = renderHook(() => useAllocationMutations(), { wrapper });
    result.current.remove.mutate("a1");
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith("/allocations/a1"));
    expect(await screen.findByText("Allocation removed.")).toBeInTheDocument();
  });

  it("shows the server error when removal fails", async () => {
    m.delete.mockRejectedValueOnce({ response: { data: { error: "Not found." } } });
    const { result } = renderHook(() => useAllocationMutations(), { wrapper });
    result.current.remove.mutate("a1");
    expect(await screen.findByText("Not found.")).toBeInTheDocument();
  });

  it("falls back to a generic message when removal errors without a body", async () => {
    m.delete.mockRejectedValueOnce({});
    const { result } = renderHook(() => useAllocationMutations(), { wrapper });
    result.current.remove.mutate("a1");
    expect(await screen.findByText("Couldn't remove the allocation.")).toBeInTheDocument();
  });
});
