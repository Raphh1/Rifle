import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const PublicRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRoute element={<Login />} />,
  },
  {
    path: "/register",
    element: <PublicRoute element={<Register />} />,
  },
  {
    path: "/events",
    element: <div className="p-8">Events Page</div>,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute element={<div className="p-8">Dashboard</div>} />
    ),
  },
  {
    path: "/",
    element: <Navigate to="/events" replace />,
  },
  {
    path: "*",
    element: <div className="p-8 text-center">404 - Not Found</div>,
  },
]);
