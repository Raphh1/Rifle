import { Navigate, Outlet } from "react-router-dom";
import { Layout } from "../components/Layout";
import { OrganizerDashboard } from "../pages/dashboard/OrganizerDashboard";
import { AdminDashboard } from "../pages/dashboard/AdminDashboard";
import { useAuth } from "../context/useAuth"; // ✅ si tu as le barrel (src/context/index.ts)
// sinon: import { useAuth } from "../context/useAuth";

export function RoleBasedDashboard() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "organizer") return <OrganizerDashboard />;

  return <Navigate to="/events" replace />;
}

export function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="text-6xl font-extrabold text-slate-900">404</div>
      <div className="mt-2 text-lg font-bold text-slate-900">Page introuvable</div>
      <div className="mt-2 text-sm text-slate-600">
        La page que vous recherchez n&apos;existe pas.
      </div>

      <div className="mt-6">
        <a
          href="/events"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
                     hover:bg-indigo-700 transition"
        >
          Retour aux événements
        </a>
      </div>
    </div>
  );
}