import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("opens on trigger, closes on outside click and Escape", async () => {
    render(
      <div>
        <Popover trigger={() => <span>open</span>}>{() => <div>panel</div>}</Popover>
        <button>outside</button>
      </div>
    );
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("open"));
    expect(screen.getByText("panel")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("open"));
    expect(screen.getByText("panel")).toBeInTheDocument();
    await userEvent.click(screen.getByText("outside"));
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });

  it("anchors the panel to the right when align is 'right'", async () => {
    render(
      <Popover align="right" trigger={() => <span>open</span>}>
        {() => <div>panel</div>}
      </Popover>
    );
    await userEvent.click(screen.getByText("open"));
    expect(screen.getByText("panel").parentElement).toHaveClass("right-0");
  });

  it("defaults to left alignment", async () => {
    render(<Popover trigger={() => <span>open</span>}>{() => <div>panel</div>}</Popover>);
    await userEvent.click(screen.getByText("open"));
    expect(screen.getByText("panel").parentElement).toHaveClass("left-0");
  });
});
