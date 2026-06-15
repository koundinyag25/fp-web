import { renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ToastProvider } from "@/organisms/Toaster";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import { useOrderMutations } from "./useOrderMutations";

const m = http as unknown as { post: Mock; patch: Mock };

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
  m.patch.mockResolvedValue({ data: {} });
});

describe("useOrderMutations", () => {
  it("creates an order and toasts success", async () => {
    const { result } = renderHook(() => useOrderMutations(), { wrapper });
    result.current.create.mutate({ ref: "O-1" });
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/orders", { ref: "O-1" }));
    expect(await screen.findByText("Order created.")).toBeInTheDocument();
  });

  it("updates an order and toasts success", async () => {
    const { result } = renderHook(() => useOrderMutations(), { wrapper });
    result.current.update.mutate({ id: "o1", data: { ref: "O-2" } });
    await waitFor(() => expect(m.patch).toHaveBeenCalledWith("/orders/o1", { ref: "O-2" }));
    expect(await screen.findByText("Order updated.")).toBeInTheDocument();
  });

  it("assigns a driver and toasts success", async () => {
    const { result } = renderHook(() => useOrderMutations(), { wrapper });
    result.current.assign.mutate({ id: "o1", driverId: "d1" });
    await waitFor(() => expect(m.patch).toHaveBeenCalledWith("/orders/o1/assign", { driverId: "d1" }));
    expect(await screen.findByText("Driver assigned.")).toBeInTheDocument();
  });

  it("shows the server error on create failure", async () => {
    m.post.mockRejectedValueOnce({ response: { data: { error: "Bad order." } } });
    const { result } = renderHook(() => useOrderMutations(), { wrapper });
    result.current.create.mutate({});
    expect(await screen.findByText("Bad order.")).toBeInTheDocument();
  });

  it("falls back to a generic message on update failure", async () => {
    m.patch.mockRejectedValueOnce({});
    const { result } = renderHook(() => useOrderMutations(), { wrapper });
    result.current.update.mutate({ id: "o1", data: {} });
    expect(await screen.findByText("Couldn't update the order.")).toBeInTheDocument();
  });

  it("shows an error toast on assign failure", async () => {
    m.patch.mockRejectedValueOnce({});
    const { result } = renderHook(() => useOrderMutations(), { wrapper });
    result.current.assign.mutate({ id: "o1", driverId: "d1" });
    expect(await screen.findByText("Couldn't assign the driver.")).toBeInTheDocument();
  });
});
