import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { Combobox, type ComboOption } from "./Combobox";

const options: ComboOption[] = [
  { id: "d1", label: "Asha Rao" },
  { id: "d2", label: "Vikram N" },
];

const base = {
  value: null,
  onSelect: vi.fn(),
  search: "",
  onSearchChange: vi.fn(),
  options,
  onLoadMore: vi.fn(),
  placeholder: "Select driver…",
};

const openIt = () => userEvent.click(screen.getByRole("button", { name: "Select driver…" }));

describe("Combobox", () => {
  it("opens from the trigger and selects an option by click", async () => {
    const onSelect = vi.fn();
    render(<Combobox {...base} onSelect={onSelect} />);
    await openIt();
    await userEvent.click(await screen.findByRole("button", { name: "Vikram N" }));
    expect(onSelect).toHaveBeenCalledWith(options[1]);
  });

  it("navigates with arrow keys and selects with Enter", async () => {
    const onSelect = vi.fn();
    render(<Combobox {...base} onSelect={onSelect} />);
    await openIt();
    await userEvent.keyboard("{ArrowDown}{Enter}"); // highlight 0 → 1, Enter picks it
    expect(onSelect).toHaveBeenCalledWith(options[1]);
  });

  it("relays typed search to the parent", async () => {
    const onSearchChange = vi.fn();
    render(<Combobox {...base} onSearchChange={onSearchChange} />);
    await openIt();
    await userEvent.type(screen.getByRole("combobox"), "As");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("shows a spinner while loading", async () => {
    render(<Combobox {...base} options={[]} isLoading />);
    await openIt();
    expect(await screen.findByText("Loading…")).toBeInTheDocument();
  });

  it("shows the empty label when nothing matches", async () => {
    render(<Combobox {...base} options={[]} emptyLabel="No drivers" />);
    await openIt();
    expect(await screen.findByText(/no drivers/i)).toBeInTheDocument();
  });

  it("shows the selected value in the trigger", () => {
    render(<Combobox {...base} value={options[0]} />);
    expect(screen.getByRole("button", { name: "Asha Rao" })).toBeInTheDocument();
  });

  it("loads more when the sentinel scrolls into view", async () => {
    const onLoadMore = vi.fn();
    render(<Combobox {...base} hasMore onLoadMore={onLoadMore} />);
    await openIt();
    await screen.findByRole("button", { name: "Asha Rao" });
    MockIntersectionObserver.last().trigger(true);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("shows a 'loading more' spinner while paging the next page", async () => {
    render(<Combobox {...base} hasMore isLoadingMore />);
    await openIt();
    expect(await screen.findByText("Loading more…")).toBeInTheDocument();
  });

  it("renders a custom trigger and reflects open state through it", async () => {
    const trigger = (open: boolean) => <span>{open ? "Close picker" : "Assign driver"}</span>;
    render(<Combobox {...base} trigger={trigger} />);
    const btn = screen.getByRole("button", { name: "Assign driver" });
    expect(btn).toHaveClass("w-full"); // trigger branch styling, not the select-box default
    await userEvent.click(btn);
    expect(screen.getByText("Close picker")).toBeInTheDocument();
  });

  it("applies invalid styling to the default trigger", () => {
    render(<Combobox {...base} invalid />);
    expect(screen.getByRole("button", { name: "Select driver…" })).toHaveClass("border-critical");
  });

  it("moves the highlight up with ArrowUp and closes on Escape", async () => {
    const onSelect = vi.fn();
    render(<Combobox {...base} onSelect={onSelect} />);
    await openIt();
    // down to index 1, back up to 0, then Enter picks the first option
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(options[0]);

    await openIt();
    await screen.findByRole("button", { name: "Asha Rao" });
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Asha Rao" })).not.toBeInTheDocument();
  });
});
