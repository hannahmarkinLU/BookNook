import { describe, test, expect } from "vitest";
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/security";

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
});
