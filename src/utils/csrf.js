// generate a random token
export const generateCSRFToken = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// initialize CSRF token on app startup
export const initializeCSRF = () => {
  let token = sessionStorage.getItem("csrf-token");

  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem("csrf-token", token);
    // set as cookie for double-submit pattern demo
    document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict`;
  }

  return token;
};

// get the current CSRF token for forms
export const getCSRFToken = () => {
  return sessionStorage.getItem("csrf-token") || initializeCSRF();
};

// validate submitted token
export const validateCSRFToken = (submittedToken) => {
  const storedToken = sessionStorage.getItem("csrf-token");

  if (!submittedToken || !storedToken) {
    return false;
  }

  return submittedToken === storedToken;
};
