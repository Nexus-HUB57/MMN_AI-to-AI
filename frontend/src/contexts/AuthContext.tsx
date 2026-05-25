import React, { createContext, useEffect, useMemo, useState, ReactNode } from "react";

type UserRole = "admin" | "affiliate" | "user";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface LoginCredentials {
  email?: string;
  name?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials?: LoginCredentials) => Promise<User>;
  loginAsDemo: (role: "admin" | "affiliate", overrides?: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = "mmn-ai-auth-session";
const ADMIN_REVIEW_USER: User = {
  id: "admin-lucas-thomaz",
  name: "Lucas Thomaz",
  email: "lucasmpthomaz@gmail.com",
  role: "admin",
};

const AFFILIATE_REVIEW_USER: User = {
  id: "affiliate-review-user",
  name: "Usuário MMN",
  email: "usuario@demo.mmn.ai",
  role: "affiliate",
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistUser(user: User | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function buildReviewUser(role: "admin" | "affiliate", overrides?: Partial<User>): User {
  const baseUser = role === "admin" ? ADMIN_REVIEW_USER : AFFILIATE_REVIEW_USER;
  return {
    ...baseUser,
    ...overrides,
    role,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const storedUser = window.localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Falha ao restaurar sessão local:", error);
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsDemo = async (role: "admin" | "affiliate", overrides?: Partial<User>) => {
    const nextUser = buildReviewUser(role, overrides);
    setUser(nextUser);
    persistUser(nextUser);
    return nextUser;
  };

  const login = async (credentials?: LoginCredentials) => {
    const normalizedEmail = credentials?.email?.trim().toLowerCase();
    const isAdminLogin = credentials?.role === "admin" || normalizedEmail === ADMIN_REVIEW_USER.email;

    const nextUser = buildReviewUser(isAdminLogin ? "admin" : "affiliate", {
      name:
        credentials?.name?.trim() ||
        (isAdminLogin ? ADMIN_REVIEW_USER.name : AFFILIATE_REVIEW_USER.name),
      email:
        normalizedEmail ||
        (isAdminLogin ? ADMIN_REVIEW_USER.email : AFFILIATE_REVIEW_USER.email),
    });

    setUser(nextUser);
    persistUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    setUser(null);
    persistUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      loginAsDemo,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
