// src/Components/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./securityContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissionName: string;
  actionName: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissionName,
  actionName,
}) => {
  const { user, token, hasPermission } = useAuth();

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // System Admin gets full access
  if (user?.isSuperAdmin) {
    return <>{children}</>;
  }

  // Normal users use permission check
  const allowed = hasPermission(permissionName, actionName);

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
