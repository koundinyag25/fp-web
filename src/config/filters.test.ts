import { describe, it, expect } from "vitest";
import {
  OPERATORS,
  defaultFilterOp,
  TIMESTAMP_FILTER_FIELDS,
} from "./filters";

// FR-MD-2 / FR-OM-3 / FR-LM-3: list search & filter — the FilterBuilder offers
// type-appropriate operators and default operators per field type.

describe("defaultFilterOp", () => {
  it("defaults select fields to 'in'", () => {
    expect(defaultFilterOp("select")).toBe("in");
  });

  it("defaults date fields to 'after'", () => {
    expect(defaultFilterOp("date")).toBe("after");
  });

  it("returns an operator that is offered for that field type", () => {
    for (const type of ["select", "date"] as const) {
      const op = defaultFilterOp(type);
      expect(OPERATORS[type].map((o) => o.value)).toContain(op);
    }
  });
});

describe("OPERATORS", () => {
  it("offers membership operators for select fields", () => {
    expect(OPERATORS.select.map((o) => o.value)).toEqual(["in", "nin"]);
  });

  it("offers range operators for date fields", () => {
    expect(OPERATORS.date.map((o) => o.value)).toEqual(["after", "before", "between"]);
  });

  it("gives every operator a human-readable label", () => {
    for (const list of Object.values(OPERATORS)) {
      for (const op of list) expect(op.label.length).toBeGreaterThan(0);
    }
  });
});

describe("TIMESTAMP_FILTER_FIELDS", () => {
  it("always offers createdAt and updatedAt as date fields", () => {
    expect(TIMESTAMP_FILTER_FIELDS).toEqual([
      { key: "createdAt", label: "Created at", type: "date" },
      { key: "updatedAt", label: "Updated at", type: "date" },
    ]);
  });
});
