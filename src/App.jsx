import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { BooksProvider } from "./context/BooksContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BooksProvider>
          <AppRoutes />
        </BooksProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
