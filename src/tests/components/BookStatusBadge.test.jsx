import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BookStatusBadge from "../../components/books/BookStatusBadge";

describe("BookStatusBadge", () => {
  test("renders 'Wishlist' when status is wishlist", () => {
    render(<BookStatusBadge status="wishlist" />);

    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toHaveClass("status-badge wishlist");
  });

  test("renders 'Reading' when status is reading", () => {
    render(<BookStatusBadge status="reading" />);

    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toHaveClass("status-badge reading");
  });

  test("renders 'Completed' when status is completed", () => {
    render(<BookStatusBadge status="completed" />);

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toHaveClass("status-badge completed");
  });

  test("defaults to 'Wishlist' text but keeps original status class for unknown status", () => {
    render(<BookStatusBadge status="unknown" />);

    // should show "Wishlist" text (fallback)
    expect(screen.getByText("Wishlist")).toBeInTheDocument();

    // but className still uses the original status value
    expect(screen.getByText("Wishlist")).toHaveClass("status-badge");
    expect(screen.getByText("Wishlist")).toHaveClass("unknown");
    expect(screen.getByText("Wishlist")).not.toHaveClass("wishlist");
  });

  test("applies status-badge class to all badges", () => {
    render(<BookStatusBadge status="reading" />);

    const badge = screen.getByText("Reading");
    expect(badge).toHaveClass("status-badge");
  });
});
