import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: "user" | "organizer" | "admin";
}

/**
 * ProtectedRoute: Protège les routes authentifiées
 * - Redirige vers /login si non authentifié
 * - Vérifie le rôle si spécifié, redirige vers /unauthorized sinon
 */
export function ProtectedRoute({
  element,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}

/**
 * PublicRoute: Redirige vers /events si déjà authentifié
 */
export function PublicRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return element;
}
