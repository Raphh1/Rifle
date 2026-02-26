import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between">
            {/* Left: Logo */}
            <Link
              to="/"
              onClick={closeMobile}
              className="text-lg font-extrabold tracking-tight text-indigo-600 hover:text-indigo-700"
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

                  {user.role === "admin" && <NavLink to="/dashboard">Admin</NavLink>}
                </>
              )}
            </div>

            {/* Right: Auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">
                    {user.name}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700
                               shadow-sm hover:bg-slate-50 transition
                               focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition
                               focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm
                               hover:bg-indigo-700 transition
                               focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2
                         text-slate-700 shadow-sm hover:bg-slate-50 transition
                         focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
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
          <div className="md:hidden border-t border-slate-200 bg-white">
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
                    <MobileNavLink to="/dashboard" onClick={closeMobile}>
                      Admin
                    </MobileNavLink>
                  )}

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-sm font-semibold text-slate-700 mb-2">{user.name}</div>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700
                                 shadow-sm hover:bg-slate-50 transition
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="pt-3 border-t border-slate-200 flex gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700
                               shadow-sm hover:bg-slate-50 transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm
                               hover:bg-indigo-700 transition"
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
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Rifle. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

/** Desktop link */
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
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
      className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
    >
      {children}
    </Link>
  );
}