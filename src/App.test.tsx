import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { renderWithProviders } from "@/test/utils";

vi.mock("@/utils/http", () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from "@/utils/http";
import App from "./App";

const m = http as unknown as { get: Mock };

beforeEach(() => vi.clearAllMocks());

describe("App routing", () => {
  it("renders Home at / and redirects unknown routes", async () => {
    m.get.mockResolvedValue({ data: { items: [] } });
    renderWithProviders(<App />, { route: "/nope" });
    expect(await screen.findByRole("heading", { name: "FleetPanda" })).toBeInTheDocument();
  });
});
