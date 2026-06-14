import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bell } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("has an accessible label, fires onClick, shows a dot", async () => {
    const onClick = vi.fn();
    render(<IconButton icon={Bell} label="Alerts" dot onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Alerts" });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
    expect(btn.querySelector("span")).toBeInTheDocument();
  });
});
