import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { useToast } from "@/hooks/useToast";
import { ToastProvider } from "./Toaster";

const Fire = ({ withTone = true }: { withTone?: boolean }) => {
  const { show } = useToast();
  return (
    <button
      type="button"
      onClick={() => show(withTone ? { tone: "success", message: "Saved!" } : { message: "Saved!" })}
    >
      fire
    </button>
  );
};

const renderProvider = (withTone = true) =>
  render(<ToastProvider><Fire withTone={withTone} /></ToastProvider>);

afterEach(() => vi.useRealTimers());

describe("ToastProvider", () => {
  it("shows a toast on demand and dismisses it on click", () => {
    renderProvider();
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Saved!")).not.toBeInTheDocument();
  });

  it("defaults the tone to info when none is given", () => {
    renderProvider(false);
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    // info tone applies the info border on the toast container
    expect(screen.getByRole("status").className).toContain("border-info/40");
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
