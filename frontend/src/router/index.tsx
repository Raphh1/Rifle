import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import { EventList } from "../pages/events/EventList";
import { EventDetail } from "../pages/events/EventDetail";
import { CreateEvent } from "../pages/events/CreateEvent";
import { TicketsList } from "../pages/tickets/TicketsList";
import { TicketValidate } from "../pages/tickets/TicketValidate";
import { Scanner } from "../pages/tickets/Scanner";
import { OrganizerDashboard } from "../pages/dashboard/OrganizerDashboard";
import { AdminDashboard } from "../pages/dashboard/AdminDashboard";
import { Unauthorized } from "../pages/Unauthorized";
import { ProtectedRoute, PublicRoute } from "../components/ProtectedRoute";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { TransferTicket } from "../pages/tickets/TransferTicket";

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
      {
        path: "/unauthorized",
        element: <Unauthorized />,
      },
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
        path: "/tickets/:id/transfer",
        element: <ProtectedRoute element={<TransferTicket />} />
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
       {
        path: "/tickets",
        element: <ProtectedRoute element={<TicketsList />} />,
      },
      {
        path: "/scan",
        // Protection réactivée. On permet aux Organsateurs ET Admins d'accéder
        // Attention : ProtectedRoute doit gérer un simple rôle ou un tableau rôles
        // Si elle ne gère qu'un rôle, on peut créer une route custom ScannerPage qui check manuel
        element: <ProtectedRoute element={<Scanner />} requiredRole="organizer" />,
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
