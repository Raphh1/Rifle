import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
        <Link to="/" className="text-lg font-semibold text-gray-800">Rifle</Link>
        <div className="flex-1" />
        <nav className="flex items-center gap-4">
          <Link to="/events" className="text-gray-700 hover:text-gray-900">Events</Link>
          <Link to="/tickets" className="text-gray-700 hover:text-gray-900">My Tickets</Link>

          {user ? (
            <>
              {user.role === "organizer" && (
                <Link to="/create-event" className="text-gray-700 hover:text-gray-900">Create</Link>
              )}
              <button onClick={handleLogout} className="ml-2 px-3 py-1 border rounded text-sm">Logout</button>
              <span className="ml-2 text-sm text-gray-600">{user.name}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
              <Link to="/register" className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-white mt-8 py-4">
    <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600">© {new Date().getFullYear()} Rifle. Tous droits réservés.</div>
  </footer>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
