import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { useToast } from "@/hooks/useToast";
import { ToastProvider } from "./Toaster";

const Fire = () => {
  const { show } = useToast();
  return (
    <button type="button" onClick={() => show({ tone: "success", message: "Saved!" })}>
      fire
    </button>
  );
};

const renderProvider = () => render(<ToastProvider><Fire /></ToastProvider>);

afterEach(() => vi.useRealTimers());

describe("ToastProvider", () => {
  it("shows a toast on demand and dismisses it on click", () => {
    renderProvider();
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Saved!")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the timeout", () => {
    vi.useFakeTimers();
    renderProvider();
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText("Saved!")).not.toBeInTheDocument();
  });
});
