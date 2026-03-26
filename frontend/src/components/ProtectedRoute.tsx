import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { User } from "../types/api";
import { LoadingScreen } from "./LoadingScreen";

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: User["role"] | User["role"][];
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
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : null;

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
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
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return element;
}
