import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NavBar.css";

function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">📖</span>
        <span className="brand">BookNook</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/add">Add Book</NavLink>
        <NavLink to="/profile">Profile</NavLink>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
