import { mockUseStore } from "@/__mocks__/zustand";
import { parsedFile1 } from "@/testData";
import { render } from "@testing-library/react";
import { HeaderMappingStep } from "./HeaderMappingStep";

describe("Header Mapping Screen", () => {
  const parsedFile = parsedFile1;
  const changeCurrentScreen = jest.fn();
  const mockState = { parsedFile, changeCurrentScreen };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStore(mockState);
  });

  it("Should match snapshots", () => {
    const { container } = render(<HeaderMappingStep />);

    expect(container).toMatchSnapshot();
  });
});
