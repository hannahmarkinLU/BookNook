import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { BooksProvider } from "./context/BooksContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { initializeCSRF } from "./utils/csrf";

function App() {
  useEffect(() => {
    initializeCSRF();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <BooksProvider>
            <AppRoutes />
          </BooksProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
