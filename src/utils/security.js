import DOMPurify from "dompurify";

// xss protection
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // strip all HTML tags
    ALLOWED_ATTR: [], // strip all attributes
  }).trim();
};

// csrf token management
let csrfToken = "";

export const setCSRFToken = (token) => {
  // for this project, i'm using samesite cookies and input validation as csrf protection.
  // in production, i would implement actual csrf tokens.
  csrfToken = token;
};

export const getCSRFToken = () => {
  return csrfToken;
};

// input validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 254;
};

export const validatePassword = (password) => {
  // at least 8 chars, includes number, includes letter
  return (
    password.length >= 8 &&
    /\d/.test(password) &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password)
  );
};

export const validateUsername = (username) => {
  // alphanumeric, underscores, hyphens, 3-20 chars
  const re = /^[a-zA-Z0-9_-]{3,20}$/;
  return re.test(username);
};

export const sanitizeAndValidate = {
  email: (email) => {
    const sanitized = sanitizeInput(email);
    return validateEmail(sanitized) ? sanitized : null;
  },

  username: (username) => {
    const sanitized = sanitizeInput(username);
    return validateUsername(sanitized) ? sanitized : null;
  },

  password: (password) => {
    // don't sanitize passwords
    return validatePassword(password) ? password : null;
  },

  text: (text, maxLength = 1000) => {
    const sanitized = sanitizeInput(text);
    return sanitized.length <= maxLength ? sanitized : null;
  },

  bookReview: (review) => {
    const sanitized = sanitizeInput(review);
    // allow some basic formatting for reviews
    return DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
      ALLOWED_ATTR: [],
    }).trim();
  },
};
