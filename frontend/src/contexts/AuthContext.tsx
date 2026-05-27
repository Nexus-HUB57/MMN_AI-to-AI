import React, { createContext, useEffect, useMemo, useState, ReactNode } from "react";
import { ensureAffiliateMarketplaceProfile } from "@/lib/nexus-marketplace";

type UserRole = "admin" | "affiliate" | "user";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf?: string;
}

interface LoginCredentials {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials?: LoginCredentials) => Promise<User>;
  loginAsDemo: (role: "admin" | "affiliate", overrides?: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  /**
   * Tenta autenticar credenciais administrativas. Lança erro descritivo se inválidas.
   */
  loginAdmin: (email: string, password: string) => Promise<User>;
}

const STORAGE_KEY = "mmn-ai-auth-session";

// =============================================================================
// CREDENCIAIS ADMIN — único administrador permitido.
// O backoffice admin é EXCLUSIVO para Lucas Thomaz (lucasmpthomaz@gmail.com).
// =============================================================================
export const ADMIN_EMAIL = "lucasmpthomaz@gmail.com";
const ADMIN_PASSWORD = "Benjamin2020*1981$";

const ADMIN_USER: User = {
  id: "admin-lucas-thomaz",
  name: "Lucas Thomaz",
  email: ADMIN_EMAIL,
  role: "admin",
};

const AFFILIATE_DEMO_USER: User = {
  id: "affiliate-review-user",
  name: "Afiliado IOAID · SaaS",
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

function buildAffiliateUser(overrides?: Partial<User>): User {
  return { ...AFFILIATE_DEMO_USER, ...overrides, role: "affiliate" };
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
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        // Segurança: se houver um "admin" persistido que NÃO seja o e-mail oficial,
        // descarta para não permitir injeção via localStorage.
        if (parsed.role === "admin" && parsed.email.trim().toLowerCase() !== ADMIN_EMAIL) {
          window.localStorage.removeItem(STORAGE_KEY);
        } else {
          setUser(parsed);
        }
      }
    } catch (error) {
      console.error("Falha ao restaurar sessão local:", error);
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsDemo = async (role: "admin" | "affiliate", overrides?: Partial<User>) => {
    // Acesso admin via "demo" NÃO é mais permitido sem senha.
    if (role === "admin") {
      throw new Error(
        "Backoffice admin restrito ao administrador Lucas Thomaz. Faça login com e-mail e senha.",
      );
    }
    const nextUser = buildAffiliateUser(overrides);
    setUser(nextUser);
    persistUser(nextUser);
    ensureAffiliateMarketplaceProfile({
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email,
      cpf: nextUser.cpf,
    });
    return nextUser;
  };

  const loginAdmin = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error("E-mail ou senha inválidos para o backoffice administrativo.");
    }
    setUser(ADMIN_USER);
    persistUser(ADMIN_USER);
    return ADMIN_USER;
  };

  const login = async (credentials?: LoginCredentials) => {
    const normalizedEmail = credentials?.email?.trim().toLowerCase();
    const requestedAdmin =
      credentials?.role === "admin" || normalizedEmail === ADMIN_EMAIL;

    if (requestedAdmin) {
      if (!credentials?.password) {
        throw new Error("Acesso administrativo exige senha.");
      }
      return loginAdmin(credentials.email ?? ADMIN_EMAIL, credentials.password);
    }

    const nextUser = buildAffiliateUser({
      name: credentials?.name?.trim() || AFFILIATE_DEMO_USER.name,
      email: normalizedEmail || AFFILIATE_DEMO_USER.email,
    });
    setUser(nextUser);
    persistUser(nextUser);
    ensureAffiliateMarketplaceProfile({
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email,
      cpf: nextUser.cpf,
    });
    return nextUser;
  };

  const logout = async () => {
    setUser(null);
    persistUser(null);

    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
      window.localStorage.removeItem("mmn-ai-auth-session");
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      loginAsDemo,
      loginAdmin,
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
