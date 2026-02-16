import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./NavBar.css";

function Navbar() {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
          src="/logo-nav.svg"
          alt="BookNook"
          className="nav-logo"
          style={{ width: 32, height: 32 }}
        />
        <span className="brand">BookNook</span>
      </div>

      <button
        className={`hamburger ${isMenuOpen ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        <NavLink to="/dashboard" onClick={closeMenu}>
          Dashboard
        </NavLink>
        <NavLink to="/add" onClick={closeMenu}>
          Add Book
        </NavLink>
        <NavLink to="/profile" onClick={closeMenu}>
          Profile
        </NavLink>

        <button
          className="logout-btn"
          onClick={() => {
            closeMenu();
            logout();
          }}
        >
          Logout
        </button>
      </div>

      {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}
    </nav>
  );
}

export default Navbar;
