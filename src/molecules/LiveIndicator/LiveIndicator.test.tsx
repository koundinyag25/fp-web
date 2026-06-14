import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LiveIndicator } from "./LiveIndicator";

describe("LiveIndicator", () => {
  it("shows LIVE and a last-ping age when connected", () => {
    render(<LiveIndicator status="open" lastPingAt={{ current: Date.now() }} />);
    expect(screen.getByText(/live · sse connected/i)).toBeInTheDocument();
    expect(screen.getByText(/last ping \d+s ago/i)).toBeInTheDocument();
  });

  it("shows RECONNECTING on error", () => {
    render(<LiveIndicator status="error" lastPingAt={{ current: null }} />);
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByText(/no pings yet/i)).toBeInTheDocument();
  });
});
