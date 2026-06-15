import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// useMap is the only react-leaflet API these headless helpers touch. A mutable
// holder lets each test feed a different fake Leaflet map (with or without the
// methods the helpers guard on).
let mapValue: unknown = null;
vi.mock("react-leaflet", () => ({
  useMap: () => mapValue,
}));

import { FleetMapController, MapInvalidate } from "./MapControls";

beforeEach(() => {
  mapValue = null;
});

describe("FleetMapController", () => {
  it("flies to the focus point, clamping zoom to at least 13", () => {
    const flyTo = vi.fn();
    mapValue = { flyTo, getZoom: () => 11 };
    render(<FleetMapController focus={[12.9, 77.5]} />);
    expect(flyTo).toHaveBeenCalledWith([12.9, 77.5], 13, { duration: 0.6 });
  });

  it("keeps the current zoom when it already exceeds the floor", () => {
    const flyTo = vi.fn();
    mapValue = { flyTo, getZoom: () => 16 };
    render(<FleetMapController focus={[1, 2]} />);
    expect(flyTo).toHaveBeenCalledWith([1, 2], 16, { duration: 0.6 });
  });

  it("falls back to zoom 13 when the map has no getZoom", () => {
    const flyTo = vi.fn();
    mapValue = { flyTo }; // getZoom?.() → undefined → ?? 12 → max(12,13)=13
    render(<FleetMapController focus={[1, 2]} />);
    expect(flyTo).toHaveBeenCalledWith([1, 2], 13, { duration: 0.6 });
  });

  it("does nothing when there is no focus", () => {
    const flyTo = vi.fn();
    mapValue = { flyTo, getZoom: () => 11 };
    render(<FleetMapController focus={null} />);
    expect(flyTo).not.toHaveBeenCalled();
  });

  it("does nothing when the map lacks flyTo", () => {
    mapValue = {}; // typeof map.flyTo !== "function"
    expect(() => render(<FleetMapController focus={[1, 2]} />)).not.toThrow();
  });
});

describe("MapInvalidate", () => {
  it("re-syncs Leaflet's cached size when dimensions change", () => {
    const invalidateSize = vi.fn();
    mapValue = { invalidateSize };
    const { rerender } = render(<MapInvalidate width={800} height={600} />);
    expect(invalidateSize).toHaveBeenCalledTimes(1);
    rerender(<MapInvalidate width={400} height={600} />);
    expect(invalidateSize).toHaveBeenCalledTimes(2);
  });

  it("does nothing when the map lacks invalidateSize", () => {
    mapValue = {}; // typeof map.invalidateSize !== "function"
    expect(() => render(<MapInvalidate width={1} height={1} />)).not.toThrow();
  });
});
