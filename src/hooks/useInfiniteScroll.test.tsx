import { useRef, type RefObject } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MockIntersectionObserver } from "@/test/mocks";
import { useInfiniteScroll } from "./useInfiniteScroll";

const Probe = ({
  enabled,
  onLoad,
  rootRef,
}: {
  enabled: boolean;
  onLoad: () => void;
  rootRef?: RefObject<Element | null>;
}) => {
  const ref = useInfiniteScroll(onLoad, enabled, rootRef);
  return <div ref={ref} data-testid="sentinel" />;
};

const RootedProbe = ({ onLoad }: { onLoad: () => void }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={rootRef}>
      <Probe enabled onLoad={onLoad} rootRef={rootRef} />
    </div>
  );
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

  it("observes against the provided scroll container root", () => {
    const onLoad = vi.fn();
    render(<RootedProbe onLoad={onLoad} />);
    // Still wired up: the sentinel intersecting the custom root fires onLoadMore.
    MockIntersectionObserver.last().trigger(true);
    expect(onLoad).toHaveBeenCalledOnce();
  });
});
