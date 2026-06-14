import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed, content when open; closes via button + overlay", async () => {
    const onClose = vi.fn();
    const { rerender, container } = render(
      <Modal open={false} title="T" onClose={onClose}>
        body
      </Modal>
    );
    expect(screen.queryByText("body")).not.toBeInTheDocument();
    rerender(
      <Modal open title="My modal" onClose={onClose} footer={<button>Foot</button>}>
        body
      </Modal>
    );
    expect(screen.getByText("My modal")).toBeInTheDocument();
    expect(screen.getByText("Foot")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
    await userEvent.click(container.querySelector('[aria-hidden="true"]')!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
