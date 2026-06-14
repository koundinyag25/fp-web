import { describe, it, expect } from "vitest";
import { lerp, easeOut } from "./geo";

describe("lerp", () => {
  it("interpolates between two values", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

describe("easeOut", () => {
  it("is pinned at the endpoints and decelerates", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeCloseTo(0.875, 5); // past halfway by the midpoint
  });
});
