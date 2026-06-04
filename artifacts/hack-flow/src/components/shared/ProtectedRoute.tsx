import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@workspace/api-client-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, hasRole } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const authorized = allowedRoles.some(role => hasRole(role));
      if (!authorized) {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, hasRole, allowedRoles, setLocation, location]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const authorized = allowedRoles.some(role => hasRole(role));
    if (!authorized) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
}
