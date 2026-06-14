import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./MultiSelect";

const OPTIONS = Array.from({ length: 10 }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }));

describe("MultiSelect", () => {
  it("toggles selection and filters via the search box", async () => {
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} selected={["v1"]} onChange={onChange} />);
    const search = screen.getByPlaceholderText("Search…");
    await userEvent.click(screen.getByText("Option 2"));
    expect(onChange).toHaveBeenCalledWith(["v1", "v2"]);
    await userEvent.type(search, "Option 9");
    expect(screen.getByText("Option 9")).toBeInTheDocument();
    expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, "zzz");
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("deselects an already-selected option", async () => {
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS.slice(0, 3)} selected={["v1"]} onChange={onChange} />);
    await userEvent.click(screen.getByText("Option 1"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
