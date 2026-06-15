import { renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ToastProvider } from "@/organisms/Toaster";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn() } }));
import { http } from "@/utils/http";
import { useDeliveryActions } from "./useDeliveryActions";

const m = http as unknown as { post: Mock };

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
});

describe("useDeliveryActions", () => {
  it("completes a delivery and toasts success", async () => {
    const { result } = renderHook(() => useDeliveryActions("d1"), { wrapper });
    result.current.complete.mutate("del1");
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/deliveries/del1/complete"));
    expect(await screen.findByText("Delivery completed — inventory updated.")).toBeInTheDocument();
  });

  it("fails a delivery with a reason and toasts info", async () => {
    const { result } = renderHook(() => useDeliveryActions("d1"), { wrapper });
    result.current.fail.mutate({ id: "del1", reason: "no one home" });
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/deliveries/del1/fail", { reason: "no one home" }));
    expect(await screen.findByText("Delivery marked as failed.")).toBeInTheDocument();
  });

  it("shows the server error when completing fails", async () => {
    m.post.mockRejectedValueOnce({ response: { data: { error: "Out of stock." } } });
    const { result } = renderHook(() => useDeliveryActions("d1"), { wrapper });
    result.current.complete.mutate("del1");
    expect(await screen.findByText("Out of stock.")).toBeInTheDocument();
  });

  it("falls back to a generic message when failing errors", async () => {
    m.post.mockRejectedValueOnce({});
    const { result } = renderHook(() => useDeliveryActions("d1"), { wrapper });
    result.current.fail.mutate({ id: "del1", reason: "x" });
    expect(await screen.findByText("Couldn't update the delivery.")).toBeInTheDocument();
  });
});
