import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FailReasonModal } from "./FailReasonModal";

describe("FailReasonModal", () => {
  it("renders nothing while closed", () => {
    render(<FailReasonModal open={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByText("Mark delivery failed")).not.toBeInTheDocument();
  });

  it("blocks submit and shows the required-reason error when empty", async () => {
    const onSubmit = vi.fn();
    render(<FailReasonModal open onClose={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("A reason is required.")).toBeInTheDocument();
  });

  it("submits the trimmed reason when one is entered", async () => {
    const onSubmit = vi.fn();
    render(<FailReasonModal open onClose={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText(/Customer unavailable/), "  Access blocked  ");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledWith("Access blocked");
    expect(screen.queryByText("A reason is required.")).not.toBeInTheDocument();
  });

  it("disables Submit while a request is pending", () => {
    render(<FailReasonModal open onClose={vi.fn()} onSubmit={vi.fn()} pending />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("closes via the Cancel button", async () => {
    const onClose = vi.fn();
    render(<FailReasonModal open onClose={onClose} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });
});
