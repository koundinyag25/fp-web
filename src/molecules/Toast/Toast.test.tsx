import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders the message with a status role", () => {
    render(<Toast tone="success" message="Saved!" onClose={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Saved!");
  });

  it("calls onClose when dismissed", async () => {
    const onClose = vi.fn();
    render(<Toast tone="error" message="Boom" onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Dismiss"));
    expect(onClose).toHaveBeenCalled();
  });
});
