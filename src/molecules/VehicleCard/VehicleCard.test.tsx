import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleCard } from "./VehicleCard";

describe("VehicleCard", () => {
  it("renders reg, type chip and a capacity chip when capacity is given", () => {
    render(<VehicleCard reg="KA01AB1234" type="tanker" capacity={12000} />);
    expect(screen.getByText("KA01AB1234")).toBeInTheDocument();
    expect(screen.getByText("tanker")).toBeInTheDocument();
    expect(screen.getByText("12000 unit cap")).toBeInTheDocument();
  });

  it("omits the capacity chip when capacity is not provided", () => {
    render(<VehicleCard reg="KA02CD5678" type="rigid" />);
    expect(screen.getByText("rigid")).toBeInTheDocument();
    expect(screen.queryByText(/unit cap/)).not.toBeInTheDocument();
  });
});
