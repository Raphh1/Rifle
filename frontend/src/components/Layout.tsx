import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import "../styles/animated-dots.css";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="dark min-h-screen animated-dots-bg flex flex-col text-white dark:text-white">
      {/* Animated Grid Background */}
      <div className="dots-container">
        <div className="dots-grid">
          {Array.from({ length: 200 }).map((_, i) => (
            <div key={i} className="dot"></div>
          ))}
        </div>
      </div>
      
      <div className="dots-content flex flex-col flex-1">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-indigo-500/10 bg-slate-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60 shadow-sm shadow-indigo-500/5 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between">
            {/* Left: Logo */}
            <Link
              to="/"
              onClick={closeMobile}
              className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 drop-shadow-sm"
            >
              Rifle
            </Link>

            {/* Center: Desktop menu */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/events">Événements</NavLink>

              {user && (
                <>
                  <NavLink to="/tickets">Mes billets</NavLink>

                  {user.role === "organizer" && (
                    <>
                      <NavLink to="/create-event">Créer</NavLink>
                      <NavLink to="/scan">Scan</NavLink>
                      <NavLink to="/dashboard">Tableau de bord</NavLink>
                    </>
                  )}

                  {user.role === "admin" && (
                    <>
                      <NavLink to="/dashboard">Admin</NavLink>
                      <NavLink to="/admin/users">Utilisateurs</NavLink>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right: Auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-800 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-indigo-500/40">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-300 truncate max-w-[140px]">
                      {user.name}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100
                               shadow-sm hover:bg-slate-700 transition
                               focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition
                               focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm
                               hover:bg-indigo-500 transition
                               focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-2
                         text-slate-300 shadow-sm hover:bg-slate-700 transition
                         focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </nav>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 space-y-1">
              <MobileNavLink to="/events" onClick={closeMobile}>
                Événements
              </MobileNavLink>

              {user && (
                <>
                  <MobileNavLink to="/tickets" onClick={closeMobile}>
                    Mes billets
                  </MobileNavLink>

                  {user.role === "organizer" && (
                    <>
                      <MobileNavLink to="/create-event" onClick={closeMobile}>
                        Créer
                      </MobileNavLink>
                      <MobileNavLink to="/scan" onClick={closeMobile}>
                        Scan
                      </MobileNavLink>
                      <MobileNavLink to="/dashboard" onClick={closeMobile}>
                        Tableau de bord
                      </MobileNavLink>
                    </>
                  )}

                  {user.role === "admin" && (
                    <>
                      <MobileNavLink to="/dashboard" onClick={closeMobile}>
                        Admin
                      </MobileNavLink>
                      <MobileNavLink to="/admin/users" onClick={closeMobile}>
                        Utilisateurs
                      </MobileNavLink>
                    </>
                  )}

                  <div className="pt-3 border-t border-slate-700">
                    <Link
                      to="/profile"
                      onClick={closeMobile}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 mb-2 hover:bg-slate-800 transition"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-300">{user.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100
                                 shadow-sm hover:bg-slate-700 transition
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center text-sm font-semibold text-slate-300
                               shadow-sm hover:bg-slate-700 transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm
                               hover:bg-indigo-500 transition"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-400">
          © {new Date().getFullYear()} Rifle. Tous droits réservés.
        </div>
      </footer>
      </div>
    </div>
  );
}

/** Desktop link */
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
    >
      {children}
    </Link>
  );
}

/** Mobile link */
function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-900"
    >
      {children}
    </Link>
  );
}