import { renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ToastProvider } from "@/organisms/Toaster";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import { useDriverMutations } from "./useDriverMutations";

const m = http as unknown as { get: Mock; post: Mock; put: Mock; delete: Mock };

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
  m.put.mockResolvedValue({ data: {} });
  m.delete.mockResolvedValue({ data: {} });
});

describe("useDriverMutations", () => {
  it("creates a driver and shows the success toast", async () => {
    const { result } = renderHook(() => useDriverMutations(), { wrapper });
    result.current.create.mutate({ name: "Asha" });
    await waitFor(() => expect(m.post).toHaveBeenCalledWith("/drivers", { name: "Asha" }));
    expect(await screen.findByText("Driver created.")).toBeInTheDocument();
  });

  it("updates a driver and shows the success toast", async () => {
    const { result } = renderHook(() => useDriverMutations(), { wrapper });
    result.current.update.mutate({ id: "d1", data: { name: "Asha R" } });
    await waitFor(() => expect(m.put).toHaveBeenCalledWith("/drivers/d1", { name: "Asha R" }));
    expect(await screen.findByText("Driver updated.")).toBeInTheDocument();
  });

  it("removes a driver and shows the success toast", async () => {
    const { result } = renderHook(() => useDriverMutations(), { wrapper });
    result.current.remove.mutate("d1");
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith("/drivers/d1"));
    expect(await screen.findByText("Driver deleted.")).toBeInTheDocument();
  });

  it("shows the server error message when create fails", async () => {
    m.post.mockRejectedValueOnce({ response: { data: { error: "Name taken." } } });
    const { result } = renderHook(() => useDriverMutations(), { wrapper });
    result.current.create.mutate({ name: "Asha" });
    expect(await screen.findByText("Name taken.")).toBeInTheDocument();
  });

  it("falls back to a generic error message on update failure", async () => {
    m.put.mockRejectedValueOnce({});
    const { result } = renderHook(() => useDriverMutations(), { wrapper });
    result.current.update.mutate({ id: "d1", data: {} });
    expect(await screen.findByText("Couldn't update the driver.")).toBeInTheDocument();
  });

  it("shows an error toast when delete fails", async () => {
    m.delete.mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useDriverMutations(), { wrapper });
    result.current.remove.mutate("d1");
    expect(await screen.findByText("network down")).toBeInTheDocument();
  });
});
