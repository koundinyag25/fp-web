import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/utils";

// The page is a thin layout wrapper — the live-map logic is the organism's, and
// is covered by organisms/FleetMap/FleetMap.test.tsx. Stub it so this test just
// proves the page mounts the view inside its full-height container.
vi.mock("@/organisms/FleetMap", () => ({
  FleetMap: ({ children }: { children?: ReactNode }) => (
    <div data-testid="fleet-view">{children}</div>
  ),
}));

import FleetMap from "./FleetMap";

describe("FleetMap page", () => {
  it("renders the live fleet view", () => {
    renderWithProviders(<FleetMap />);
    expect(screen.getByTestId("fleet-view")).toBeInTheDocument();
  });
});
