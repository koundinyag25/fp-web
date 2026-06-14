import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { useInfiniteScroll } from "./useInfiniteScroll";

const Probe = ({ enabled, onLoad }: { enabled: boolean; onLoad: () => void }) => {
  const ref = useInfiniteScroll(onLoad, enabled);
  return <div ref={ref} data-testid="sentinel" />;
};

describe("useInfiniteScroll", () => {
  it("fires onLoadMore when the sentinel intersects (enabled)", () => {
    const onLoad = vi.fn();
    render(<Probe enabled onLoad={onLoad} />);
    MockIntersectionObserver.last().trigger(true);
    expect(onLoad).toHaveBeenCalledOnce();
    MockIntersectionObserver.last().trigger(false);
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it("does not observe when disabled", () => {
    render(<Probe enabled={false} onLoad={vi.fn()} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });
});
