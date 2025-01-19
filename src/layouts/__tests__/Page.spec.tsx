import { render, screen } from "@testing-library/react";
import Page from "../Page";

describe("Page Layout", () => {
  it("Should match the snapshot", () => {
    const { container } = render(
      <Page
        title="Test Title"
        nextLabel="Next Label"
        previousLabel="Previous Label"
      >
        <span>Test Content</span>
      </Page>
    );

    expect(container).toMatchSnapshot();
  });

  it("Should render all content", () => {
    render(
      <Page
        title="Test Title"
        nextLabel="Next Label"
        previousLabel="Previous Label"
      >
        <span>Test Content</span>
      </Page>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Next Label")).toBeInTheDocument();
    expect(screen.getByText("Previous Label")).toBeInTheDocument();
  });
});
