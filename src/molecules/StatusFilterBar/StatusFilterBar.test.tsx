import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusFilterBar } from "./StatusFilterBar";

const options = [
  { value: "all", label: "All", count: 20 },
  { value: "pending", label: "pending", count: 4, countClass: "text-warning" },
  { value: "completed", label: "completed", count: 12, countClass: "text-success" },
];

describe("StatusFilterBar", () => {
  it("renders counts, marks the active tab, and fires onChange", async () => {
    const onChange = vi.fn();
    render(<StatusFilterBar options={options} value="all" onChange={onChange} />);
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("4")).toHaveClass("text-warning");
    expect(screen.getByRole("button", { name: /All/ })).toHaveClass("text-primary");
    await userEvent.click(screen.getByRole("button", { name: /pending/ }));
    expect(onChange).toHaveBeenCalledWith("pending");
  });
});
