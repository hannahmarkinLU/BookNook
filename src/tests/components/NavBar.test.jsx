import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "../../components/navigation/NavBar";
import { AuthProvider } from "../../context/AuthContext";

describe("Navbar", () => {
  test("renders navigation links when authenticated", () => {
    localStorage.setItem("currentUser", JSON.stringify({ username: "test" }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Add Book")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("toggles mobile menu on hamburger click", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>,
    );

    const hamburger = screen.getByLabelText("Toggle navigation menu");
    fireEvent.click(hamburger);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });
});
