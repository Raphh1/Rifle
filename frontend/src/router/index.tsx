import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import { EventList } from "../pages/events/EventList";
import { EventDetail } from "../pages/events/EventDetail";
import { CreateEvent } from "../pages/events/CreateEvent";
import { TicketsList } from "../pages/tickets/TicketsList";
import { TicketValidate } from "../pages/tickets/TicketValidate";
import { OrganizerDashboard } from "../pages/dashboard/OrganizerDashboard";
import { AdminDashboard } from "../pages/dashboard/AdminDashboard";
import { ProtectedRoute, PublicRoute } from "../components/ProtectedRoute";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  if (user?.role === "organizer") {
    return <OrganizerDashboard />;
  }

  return <Navigate to="/events" replace />;
};

const NotFoundPage = () => (
  <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
    <h1>404 - Page Not Found</h1>
    <p>La page que vous recherchez n'existe pas.</p>
    <a href="/events" style={{ color: "#667eea" }}>
      Retour aux événements
    </a>
  </div>
);

const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

export const router = createBrowserRouter([
  // ============ PUBLIC ROUTES (NO LAYOUT) ============
  {
    path: "/login",
    element: <PublicRoute element={<Login />} />,
  },
  {
    path: "/register",
    element: <PublicRoute element={<Register />} />,
  },

  // ============ LAYOUT WRAPPER ============
  {
    element: <LayoutWrapper />,
    children: [
      // ============ EVENTS ============
      {
        path: "/events",
        element: <EventList />,
      },
      {
        path: "/events/:id",
        element: <EventDetail />,
      },
      {
        path: "/create-event",
        element: (
          <ProtectedRoute element={<CreateEvent />} requiredRole="organizer" />
        ),
      },

      // ============ TICKETS ============
      {
        path: "/tickets",
        element: <ProtectedRoute element={<TicketsList />} />,
      },
      {
        path: "/tickets/:id/validate",
        element: (
          <ProtectedRoute
            element={<TicketValidate />}
            requiredRole="organizer"
          />
        ),
      },

      // ============ DASHBOARD ============
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute
            element={<RoleBasedDashboard />}
            requiredRole="organizer"
          />
        ),
      },

      // ============ FALLBACK ============
      {
        path: "/",
        element: <Navigate to="/events" replace />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
