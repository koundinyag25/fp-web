import { describe, it, expect } from "vitest";
import { apiError } from "./apiError";

describe("apiError", () => {
  it("prefers the API error body", () => {
    expect(apiError({ response: { data: { error: "Vehicle already allocated" } } })).toBe(
      "Vehicle already allocated"
    );
  });

  it("falls back to an Error message", () => {
    expect(apiError(new Error("Network down"))).toBe("Network down");
  });

  it("uses the fallback for unknown shapes", () => {
    expect(apiError({}, "Try again")).toBe("Try again");
  });
});
