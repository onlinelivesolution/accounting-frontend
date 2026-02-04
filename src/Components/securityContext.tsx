// src/Components/securityContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface Permission {
  permissionName: string;
  actionName: string;
  isAllowed?: boolean;
}

interface User {
  userID: number;
  userName: string;
  roleID: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  permissions: Permission[];
  login: (token: string, user: User, permissions: Permission[]) => void;
  logout: () => void;
  hasPermission: (permissionName: string, actionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
  );
  const [permissions, setPermissions] = useState<Permission[]>(
    localStorage.getItem("permissions") ? JSON.parse(localStorage.getItem("permissions")!) : []
  );

  // Restore token/user/permissions on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedPermissions = localStorage.getItem("permissions");

    if (storedToken && storedUser && storedPermissions) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setPermissions(JSON.parse(storedPermissions));
    }
  }, []);

  const login = (token: string, user: User, permissions: Permission[]) => {
    setToken(token);
    setUser(user);
    setPermissions(permissions);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("permissions", JSON.stringify(permissions));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPermissions([]);
    localStorage.clear();
  };

  const hasPermission = (permissionName: string, actionName: string): boolean => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.some(
      (p) =>
        p.permissionName?.toLowerCase() === permissionName.toLowerCase() &&
        p.actionName?.toLowerCase() === actionName.toLowerCase()
    );
  };

  return (
    <AuthContext.Provider value={{ token, user, permissions, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
