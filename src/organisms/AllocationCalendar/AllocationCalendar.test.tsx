import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import type { Allocation, Vehicle } from "@/types";
import { mondayOf, weekDays } from "@/utils/date";
import { AllocationCalendar } from "./AllocationCalendar";

const days = weekDays(mondayOf("2026-06-10"));
const vehicles: Vehicle[] = [
  { _id: "v1", reg: "KA01AB1234", type: "tanker", capacity: 1000 },
  { _id: "v2", reg: "KA02CD5678", type: "rigid", capacity: 500 },
];
const allocations: Allocation[] = [
  { _id: "a1", vehicleId: { _id: "v1", reg: "KA01AB1234", type: "tanker" }, driverId: { _id: "d1", name: "Asha Rao" }, date: days[0].date },
];

const renderCalendar = (overrides = {}) => {
  const onAllocate = vi.fn();
  const onRemove = vi.fn();
  render(
    <AllocationCalendar
      vehicles={vehicles}
      days={days}
      allocations={allocations}
      onAllocate={onAllocate}
      onRemove={onRemove}
      {...overrides}
    />
  );
  return { onAllocate, onRemove };
};

describe("AllocationCalendar", () => {
  it("renders a row per vehicle and a column per day", () => {
    renderCalendar();
    expect(screen.getByText("KA01AB1234")).toBeInTheDocument();
    expect(screen.getByText("KA02CD5678")).toBeInTheDocument();
    expect(screen.getByText("MON")).toBeInTheDocument();
    expect(screen.getByText("SUN")).toBeInTheDocument();
  });

  it("shows the allocated driver as a chip in the matching cell", () => {
    renderCalendar();
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByLabelText(`Remove KA01AB1234 on ${days[0].date}`)).toBeInTheDocument();
  });

  it("calls onAllocate with the vehicle + date for an empty cell", async () => {
    const { onAllocate } = renderCalendar();
    await userEvent.click(screen.getByLabelText(`Allocate KA01AB1234 on ${days[1].date}`));
    expect(onAllocate).toHaveBeenCalledWith(vehicles[0], days[1].date);
  });

  it("calls onRemove with the allocation id when the chip's X is clicked", async () => {
    const { onRemove } = renderCalendar();
    await userEvent.click(screen.getByLabelText(`Remove KA01AB1234 on ${days[0].date}`));
    expect(onRemove).toHaveBeenCalledWith("a1");
  });

  it("shows an empty state when there are no vehicles", () => {
    render(<AllocationCalendar vehicles={[]} days={days} allocations={[]} onAllocate={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/no vehicles match/i)).toBeInTheDocument();
  });

  it("suppresses the empty state while loading", () => {
    render(<AllocationCalendar vehicles={[]} days={days} allocations={[]} onAllocate={vi.fn()} onRemove={vi.fn()} isLoading />);
    expect(screen.queryByText(/no vehicles match/i)).not.toBeInTheDocument();
  });

  it("loads more vehicle rows when the sentinel scrolls into view", () => {
    const onLoadMore = vi.fn();
    render(
      <AllocationCalendar
        vehicles={vehicles}
        days={days}
        allocations={[]}
        onAllocate={vi.fn()}
        onRemove={vi.fn()}
        hasMore
        onLoadMore={onLoadMore}
      />
    );
    MockIntersectionObserver.last().trigger(true);
    expect(onLoadMore).toHaveBeenCalled();
  });
});
