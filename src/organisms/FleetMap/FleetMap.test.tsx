import { screen, act, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { MockEventSource } from "@/test/mocks";
import { renderWithProviders } from "@/test/utils";

vi.mock("react-leaflet", async () => {
  const { forwardRef } = await import("react");
  // Marker forwards its ref to a host node so FleetMap's callback ref runs on
  // mount (set) and unmount (delete). The layer is a DOM div, so the
  // component's `markersRef.current.get(id)?.openPopup?.()` safely no-ops.
  const Marker = forwardRef<HTMLDivElement, { children?: ReactNode }>(({ children }, ref) => (
    <div data-testid="marker" ref={ref}>
      {children}
    </div>
  ));
  return {
    MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
    TileLayer: () => <div data-testid="tile" />,
    Marker,
    Polyline: () => <div data-testid="polyline" />,
    Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    useMap: () => ({ flyTo: () => {}, getZoom: () => 11 }),
  };
});

// AutoSizer measures 0 in jsdom; feed the map a fixed size so it renders.
vi.mock("react-virtualized-auto-sizer", () => ({
  AutoSizer: ({ renderProp }: { renderProp: (s: { width: number; height: number }) => ReactNode }) =>
    renderProp({ width: 800, height: 600 }),
}));

// react-window self-measures via ResizeObserver (absent in jsdom); render rows directly.
vi.mock("react-window", () => ({
  List: ({ rowComponent: Row, rowCount, rowProps }: { rowComponent: (p: Record<string, unknown>) => ReactNode; rowCount: number; rowProps: Record<string, unknown> }) => (
    <div>{Array.from({ length: rowCount }, (_, i) => <Row key={i} index={i} style={{}} {...rowProps} />)}</div>
  ),
}));

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn() } }));
import { http } from "@/utils/http";
import { FleetMap } from "./FleetMap";

const m = http as unknown as { get: Mock; post: Mock };

const activeRows = [
  {
    shiftId: "s1",
    driver: { _id: "d1", name: "Asha Rao" },
    vehicle: { _id: "v1", reg: "KA01AB1234", type: "tanker" },
    position: { lat: 12.97, lng: 77.59, ts: "t" },
    deliveryStatus: "in_transit",
    currentDelivery: { _id: "del1", orderId: { destinationId: { _id: "l1", name: "North Terminal" } } },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockImplementation((url: string) => {
    if (url.startsWith("/fleet/route")) {
      return Promise.resolve({
        data: {
          deliveryId: "del1",
          from: { _id: "h1", name: "Central Hub", lat: 12.9, lng: 77.5 },
          to: { _id: "l1", name: "North Terminal", lat: 13.0, lng: 77.6 },
          path: [
            { lat: 12.9, lng: 77.5, ts: "t1" },
            { lat: 12.95, lng: 77.55, ts: "t2" },
          ],
        },
      });
    }
    return Promise.resolve({ data: activeRows });
  });
  m.post.mockResolvedValue({ data: {} });
});

describe("FleetMap", () => {
  it("renders a marker + its popup, lists the vehicle in the rail, and opens the SSE stream", async () => {
    renderWithProviders(<FleetMap />);
    const marker = await screen.findByTestId("marker");
    expect(within(marker).getByText("KA01AB1234")).toBeInTheDocument();
    expect(marker).toHaveTextContent("North Terminal"); // popup destination
    expect(screen.getByText("Active fleet")).toBeInTheDocument(); // rail
    expect(MockEventSource.last().url).toContain("/fleet/stream");
  });

  it("applies a live ping without re-rendering into a crash", async () => {
    renderWithProviders(<FleetMap />);
    await screen.findByTestId("marker");
    act(() => {
      MockEventSource.last().emit("ping", { vehicleId: "v1", driverId: "d1", lat: 13, lng: 77, ts: "t2" });
    });
    expect(screen.getByTestId("marker")).toBeInTheDocument();
  });

  it("selecting a rail card highlights it (focus + route only, no driving)", async () => {
    renderWithProviders(<FleetMap />);
    await screen.findByTestId("marker");
    const card = screen.getByRole("button", { name: /KA01AB1234/ });
    await userEvent.click(card);
    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(m.post).not.toHaveBeenCalled(); // the fleet moves on its own; clicking doesn't start it
  });

  it("draws the selected vehicle's route polyline (FR-MV-2)", async () => {
    renderWithProviders(<FleetMap />);
    await screen.findByTestId("marker");
    await userEvent.click(screen.getByRole("button", { name: /KA01AB1234/ }));
    expect(await screen.findByTestId("polyline")).toBeInTheDocument();
  });

  it("filters the visible fleet by search (FR-LM-3)", async () => {
    renderWithProviders(<FleetMap />);
    await screen.findByTestId("marker");
    await userEvent.type(screen.getByPlaceholderText("Driver / vehicle"), "zzz");
    await waitFor(() => expect(screen.queryByTestId("marker")).not.toBeInTheDocument());
  });

  it("falls back to the idle marker color and omits the destination line for a bare row", async () => {
    // No deliveryStatus → `?? "idle"`; an unknown status would also hit the
    // `?? FLEET_STATUS_COLOR.idle` color fallback; no destinationId.name →
    // the popup's `: null` arm (no "→ …" line).
    m.get.mockImplementation((url: string) => {
      if (url.startsWith("/fleet/route")) return Promise.resolve({ data: null });
      return Promise.resolve({
        data: [
          {
            shiftId: "s2",
            driver: { _id: "d2", name: "Ravi K" },
            vehicle: { _id: "v2", reg: "KA02CD5678", type: "tanker" },
            position: { lat: 12.9, lng: 77.5, ts: "t" },
            // deliveryStatus omitted, currentDelivery omitted
          },
          {
            shiftId: "s3",
            driver: { _id: "d3", name: "Maya S" },
            vehicle: { _id: "v3", reg: "KA03EF9012", type: "tanker" },
            position: { lat: 12.91, lng: 77.51, ts: "t" },
            // unknown status → not in FLEET_STATUS_COLOR → idle color fallback
            deliveryStatus: "mystery",
          },
        ],
      });
    });
    renderWithProviders(<FleetMap />);
    await waitFor(() => expect(screen.getAllByTestId("marker").length).toBe(2));
    const bare = screen
      .getAllByTestId("marker")
      .find((el) => el.textContent?.includes("KA02CD5678"))!;
    expect(within(bare).getByText("KA02CD5678")).toBeInTheDocument();
    expect(bare).toHaveTextContent("status: idle");
    expect(bare).not.toHaveTextContent("→"); // destination line omitted
  });

  it("manually refreshes the active fleet", async () => {
    renderWithProviders(<FleetMap />);
    await screen.findByTestId("marker");
    const activeCalls = () => m.get.mock.calls.filter((c) => c[0] === "/fleet/active").length;
    const before = activeCalls();
    await userEvent.click(screen.getByRole("button", { name: /refresh/i }));
    await waitFor(() => expect(activeCalls()).toBeGreaterThan(before));
  });
});
