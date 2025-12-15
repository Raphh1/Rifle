import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Layout.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            Rifle
          </Link>

          <div className="navbar-menu">
            <Link to="/events" className="navbar-link">
              Événements
            </Link>

            {user && (
              <>
                <Link to="/tickets" className="navbar-link">
                  Mes billets
                </Link>

                {user.role === "organizer" && (
                  <>
                    <Link to="/create-event" className="navbar-link">
                      Créer
                    </Link>
                    <Link to="/dashboard" className="navbar-link">
                      Tableau de bord
                    </Link>
                  </>
                )}

                {user.role === "admin" && (
                  <Link to="/dashboard" className="navbar-link">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="navbar-auth">
            {user ? (
              <>
                <span className="navbar-user">{user.name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-link">
                  Connexion
                </Link>
                <Link to="/register" className="btn-link btn-link-primary">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>&copy; 2025 Rifle. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
