// Extends Vitest's expect with jest-dom matchers (toBeInTheDocument, etc.) and
// stubs the browser APIs our code touches (EventSource, IntersectionObserver).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { MockEventSource, MockIntersectionObserver } from "./mocks";

vi.stubGlobal("EventSource", MockEventSource);
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

beforeEach(() => {
  MockEventSource.reset();
  MockIntersectionObserver.reset();
});

afterEach(() => {
  cleanup();
});
