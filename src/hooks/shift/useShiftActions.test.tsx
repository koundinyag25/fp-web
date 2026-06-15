import { renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ToastProvider } from "@/organisms/Toaster";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn() } }));
import { http } from "@/utils/http";
import { useShiftActions } from "./useShiftActions";

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

describe("useShiftActions", () => {
  it("starts a shift and toasts success", async () => {
    const { result } = renderHook(() => useShiftActions("d1"), { wrapper });
    result.current.start.mutate();
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/shifts", expect.objectContaining({ driverId: "d1" })));
    expect(await screen.findByText("Shift started.")).toBeInTheDocument();
  });

  it("ends a shift and toasts success", async () => {
    const { result } = renderHook(() => useShiftActions("d1"), { wrapper });
    result.current.end.mutate("s1");
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/shifts/s1/end"));
    expect(await screen.findByText("Shift ended.")).toBeInTheDocument();
  });

  it("shows the server error when starting fails", async () => {
    m.post.mockRejectedValueOnce({ response: { data: { error: "Already on shift." } } });
    const { result } = renderHook(() => useShiftActions("d1"), { wrapper });
    result.current.start.mutate();
    expect(await screen.findByText("Already on shift.")).toBeInTheDocument();
  });

  it("falls back to a generic message when ending fails", async () => {
    m.post.mockRejectedValueOnce({});
    const { result } = renderHook(() => useShiftActions("d1"), { wrapper });
    result.current.end.mutate("s1");
    expect(await screen.findByText("Couldn't end the shift.")).toBeInTheDocument();
  });
});
