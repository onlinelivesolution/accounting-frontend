// src/Components/securityContext.tsx

import React, { createContext, useState, useContext, ReactNode } from "react";

interface Permission {
  permissionName: string;
  actionName: string;
  isAllowed?: boolean;
}

interface User {
  userID?: number;
  userName?: string;
  email?: string;
  roleID?: number;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  token: string | null;
  tenant: string | null;
  user: User | null;
  permissions: Permission[];

  login: (
    token: string,
    tenant?: string | null,
    user?: User | null,
    permissions?: Permission[],
  ) => void;

  logout: () => void;

  hasPermission: (permissionName: string, actionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe JSON parser
const safeParse = (value: string | null) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const [tenant, setTenant] = useState<string | null>(
    localStorage.getItem("tenant"),
  );

  const [user, setUser] = useState<User | null>(
    safeParse(localStorage.getItem("user")),
  );

  const [permissions, setPermissions] = useState<Permission[]>(
    safeParse(localStorage.getItem("permissions")) || [],
  );

  // LOGIN
  const login = (
    token: string,
    tenant: string | null = null,
    user: User | null = null,
    permissions: Permission[] = [],
  ) => {
    setToken(token);

    setTenant(tenant);

    setUser(user);

    setPermissions(permissions);

    localStorage.setItem("token", token);

    if (tenant) {
      localStorage.setItem("tenant", tenant);
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    localStorage.setItem("permissions", JSON.stringify(permissions));
  };

  // LOGOUT
  const logout = () => {
    const isSuperAdmin = user?.isSuperAdmin;

    setToken(null);
    setTenant(null);
    setUser(null);
    setPermissions([]);

    localStorage.removeItem("token");
    localStorage.removeItem("tenant");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");

    if (isSuperAdmin) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/";
    }
  };

  // PERMISSION CHECK
  const hasPermission = (
    permissionName: string,
    actionName: string,
  ): boolean => {
    // System Admin
    if (user?.isSuperAdmin === true) {
      return true;
    }

    // Tenant Admin
    // First created admin user in tenant DB
    if (user?.roleID === 1 || user?.userName === user?.email) {
      return true;
    }

    if (!permissions || permissions.length === 0) {
      return false;
    }

    return permissions.some(
      (p) =>
        p.permissionName?.toLowerCase() === permissionName.toLowerCase() &&
        p.actionName?.toLowerCase() === actionName.toLowerCase() &&
        p.isAllowed === true,
    );
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        tenant,
        user,
        permissions,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
