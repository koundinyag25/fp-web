import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders a search box", () => {
    render(<SearchInput placeholder="Search…" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
  });
});
