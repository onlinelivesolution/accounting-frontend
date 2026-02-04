// src/Components/ProtectedRoute.tsx
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./securityContext";

interface ProtectedRouteProps {
  children: ReactNode;
  permissionName?: string;
  actionName?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissionName,
  actionName,
}) => {
  const { user, hasPermission, token } = useAuth();

  // 🔒 1️⃣ Redirect if not logged in
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // ✅ 2️⃣ Allow if user has permission OR no specific permission required
  if (
    !permissionName ||
    !actionName ||
    hasPermission(permissionName, actionName)
  ) {
    return <>{children}</>;
  }

  // 🚫 3️⃣ Otherwise redirect to Unauthorized page
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
