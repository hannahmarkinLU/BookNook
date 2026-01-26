import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navigation/NavBar";
import "../styles/pages.css";

function Profile() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <h1 className="profile-title">Your Profile</h1>

        <section className="profile-card">
          <div className="profile-row">
            <span className="profile-value">{user.username}</span>
          </div>

          {user.email && (
            <div className="profile-row">
              <span className="profile-value">{user.email}</span>
            </div>
          )}

          <div className="profile-actions">
            <button className="secondary-button" disabled>
              Edit Profile (coming soon)
            </button>

            <button className="logout-btn" onClick={logout}>
              Log out
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default Profile;
