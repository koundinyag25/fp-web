import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

// The free-driver picker fetches via http; an empty page keeps the form quiet.
vi.mock("@/utils/http", () => ({
  http: { get: vi.fn() },
}));
import { http } from "@/utils/http";
import { AllocationFormModal } from "./AllocationFormModal";

const m = http as unknown as { get: Mock };

const vehicle = { _id: "v1", reg: "KA01AB1234", type: "tanker", capacity: 1000 };

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
});

describe("AllocationFormModal", () => {
  it("guards submit when no driver is picked (does not call onSave)", () => {
    const onSave = vi.fn();
    renderWithProviders(
      <AllocationFormModal
        open
        vehicle={vehicle}
        date="2026-06-20"
        error={null}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    // The Allocate button is disabled without a driver, so dispatch submit on the
    // form directly to exercise the `if (!driver) return` guard.
    const form = screen.getByRole("button", { name: "Allocate" }).closest("form")!;
    form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Allocate" })).toBeDisabled();
  });

  it("renders the error banner and the vehicle/date context", () => {
    renderWithProviders(
      <AllocationFormModal
        open
        vehicle={vehicle}
        date="2026-06-20"
        error="✘ KA01AB1234 is already allocated on 2026-06-20."
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.getByText(/already allocated/)).toBeInTheDocument();
    expect(screen.getByText("KA01AB1234")).toBeInTheDocument(); // vehicle?.reg present
    expect(screen.getByText("2026-06-20")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = renderWithProviders(
      <AllocationFormModal
        open={false}
        vehicle={null}
        date=""
        error={null}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
