import { describe, expect, it } from "vitest";
import { http } from "./http";

describe("http client", () => {
  it("is an axios instance defaulting to the /api base", () => {
    expect(http.defaults.baseURL).toBe("/api");
    expect(typeof http.get).toBe("function");
  });
});
