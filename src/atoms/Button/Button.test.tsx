import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("fires onClick and respects disabled", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
    rerender(
      <Button onClick={onClick} disabled>
        Save
      </Button>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("applies variant classes", () => {
    render(<Button variant="danger">Del</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-critical");
  });
});
