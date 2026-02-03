// xss protection
import DOMPurify from "dompurify";

export const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};

// csrf token management
let csrfToken = "";

export const setCSRFToken = (token) => {
  csrfToken = token;
};

export const getCSRFToken = () => {
  return csrfToken;
};

// input validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};
