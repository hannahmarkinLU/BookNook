import { describe, test, expect } from "vitest";
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/security";
import { generateCSRFToken, validateCSRFToken } from "../utils/csrf";

describe("Security Utilities", () => {
  describe("sanitizeInput", () => {
    test("removes script tags", () => {
      const input = '<script>alert("xss")</script>Hello';
      expect(sanitizeInput(input)).toBe("Hello");
    });

    test("removes HTML tags", () => {
      const input = '<b>Hello</b><img src="x" onerror="alert(1)">';
      expect(sanitizeInput(input)).toBe("Hello");
    });

    test("trims whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });
  });

  describe("validateEmail", () => {
    test("validates correct emails", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
    });

    test("rejects invalid emails", () => {
      expect(validateEmail("not-an-email")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    test("validates strong passwords", () => {
      expect(validatePassword("Password123")).toBe(true);
      expect(validatePassword("SecurePass1")).toBe(true);
    });

    test("rejects weak passwords", () => {
      expect(validatePassword("short")).toBe(false);
      expect(validatePassword("nouppercase123")).toBe(false);
      expect(validatePassword("NOLOWERCASE123")).toBe(false);
      expect(validatePassword("NoNumbersHere")).toBe(false);
    });
  });

  describe("CSRF Protection", () => {
    test("generates a valid CSRF token", () => {
      const token = generateCSRFToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);
    });

    test("validates correct CSRF token", () => {
      const token = generateCSRFToken();
      sessionStorage.setItem("csrf-token", token);
      expect(validateCSRFToken(token)).toBe(true);
    });

    test("rejects invalid CSRF token", () => {
      const token = generateCSRFToken();
      sessionStorage.setItem("csrf-token", token);
      expect(validateCSRFToken("wrong-token")).toBe(false);
    });
  });
});
