import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import { EventList } from "../pages/events/EventList";
import { EventDetail } from "../pages/events/EventDetail";
import { CreateEvent } from "../pages/events/CreateEvent";
import { EditEvent } from "../pages/events/EditEvent";
import { TicketsList } from "../pages/tickets/TicketsList";
import { TicketValidate } from "../pages/tickets/TicketValidate";
import { TransferTicket } from "../pages/tickets/TransferTicket";
import { Scanner } from "../pages/tickets/Scanner";
import { Unauthorized } from "../pages/Unauthorized";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { ProfilePage } from "../pages/profile/ProfilePage";

// Social pages
import { FavoritesPage } from "../pages/social/FavoritesPage";
import { FriendsPage } from "../pages/social/FriendsPage";
import { RoomsPage } from "../pages/social/RoomsPage";
import { ChatRoom } from "../pages/social/ChatRoom";
import { NotificationsPage } from "../pages/social/NotificationsPage";

import { ProtectedRoute, PublicRoute } from "../components/ProtectedRoute";
import { LayoutWrapper, NotFoundPage, RoleBasedDashboard } from "./RouteElements";

export const router = createBrowserRouter([
  // ============ PUBLIC ROUTES (NO LAYOUT) ============
  { path: "/login", element: <PublicRoute element={<Login />} /> },
  { path: "/register", element: <PublicRoute element={<Register />} /> },

  // ============ LAYOUT WRAPPER ============
  {
    element: <LayoutWrapper />,
    children: [
      { path: "/unauthorized", element: <Unauthorized /> },

      // ============ EVENTS ============
      { path: "/events", element: <EventList /> },
      { path: "/events/:id", element: <EventDetail /> },
      {
        path: "/create-event",
        element: <ProtectedRoute element={<CreateEvent />} requiredRole={["organizer", "admin"]} />,
      },
      {
        path: "/events/:id/edit",
        element: <ProtectedRoute element={<EditEvent />} requiredRole={["organizer", "admin"]} />,
      },

      // ============ TICKETS ============
      { path: "/tickets", element: <ProtectedRoute element={<TicketsList />} /> },
      { path: "/tickets/:id/transfer", element: <ProtectedRoute element={<TransferTicket />} /> },
      {
        path: "/tickets/:id/validate",
        element: <ProtectedRoute element={<TicketValidate />} requiredRole={["organizer", "admin"]} />,
      },

      // ============ SCANNER ============
      {
        path: "/scan",
        element: <ProtectedRoute element={<Scanner />} requiredRole={["organizer", "admin"]} />,
      },

      // ============ DASHBOARD ============
      {
        path: "/dashboard",
        element: <ProtectedRoute element={<RoleBasedDashboard />} />,
      },

      // ============ PROFILE ============
      { path: "/profile", element: <ProtectedRoute element={<ProfilePage />} /> },

      // ============ SOCIAL ============
      { path: "/favorites", element: <ProtectedRoute element={<FavoritesPage />} /> },
      { path: "/friends", element: <ProtectedRoute element={<FriendsPage />} /> },
      { path: "/rooms", element: <ProtectedRoute element={<RoomsPage />} /> },
      { path: "/rooms/:roomId", element: <ProtectedRoute element={<ChatRoom />} /> },
      { path: "/notifications", element: <ProtectedRoute element={<NotificationsPage />} /> },

      // ============ ADMIN ============
      {
        path: "/admin/users",
        element: <ProtectedRoute element={<AdminUsers />} requiredRole="admin" />,
      },

      // ============ FALLBACK ============
      { path: "/", element: <Navigate to="/events" replace /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
