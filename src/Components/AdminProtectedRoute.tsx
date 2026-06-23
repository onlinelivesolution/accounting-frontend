import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }: any) {
  const token = localStorage.getItem("adminToken");

  return token ? children : <Navigate to="/admin/login" />;
}
