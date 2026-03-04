import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../../components/ErrorBoundary";

// create a component that throws an error
const BuggyComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div data-testid="normal-component">Normal Component</div>;
};

// mock console.error
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe("ErrorBoundary", () => {
  test("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div data-testid="test-child">Child Content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  test("renders error UI when child component throws", () => {
    // wrap in try-catch to handle the expected error
    try {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>,
      );
    } catch (e) {
      // expected error, ignore
    }

    // check if error boundary UI is shown
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reload Page" }),
    ).toBeInTheDocument();
  });

  test("reload button calls window.location.reload", () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });

    // wrap in try-catch to handle the expected error
    try {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>,
      );
    } catch (e) {
      // expected error, ignore
    }

    // click the reload button
    const reloadButton = screen.getByRole("button", { name: "Reload Page" });
    reloadButton.click();

    expect(mockReload).toHaveBeenCalled();
  });
});
