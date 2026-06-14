import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { WeekNavigator } from "./WeekNavigator";

describe("WeekNavigator", () => {
  it("renders the week label", () => {
    render(<WeekNavigator label="Jun 8 – Jun 14, 2026" onPrev={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText("Jun 8 – Jun 14, 2026")).toBeInTheDocument();
  });

  it("fires onPrev / onNext / onToday", async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onToday = vi.fn();
    render(<WeekNavigator label="Jun 8 – Jun 14, 2026" onPrev={onPrev} onNext={onNext} onToday={onToday} />);

    await userEvent.click(screen.getByLabelText("Previous week"));
    await userEvent.click(screen.getByLabelText("Next week"));
    await userEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onToday).toHaveBeenCalledTimes(1);
  });

  it("omits the Today button when no handler is given", () => {
    render(<WeekNavigator label="Jun 8 – Jun 14, 2026" onPrev={vi.fn()} onNext={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Today" })).not.toBeInTheDocument();
  });
});
