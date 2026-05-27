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
  loginAdmin: (email: string, password: string) => Promise<User>;
}

const STORAGE_KEY = "mmn-ai-auth-session";
const ADMIN_TOKEN_KEY = "mmn-ai-admin-token";

function getTrpcBaseUrl(): string {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_TRPC_URL) {
    return (import.meta as any).env.VITE_TRPC_URL as string;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}/api/trpc`;
  }
  return "/api/trpc";
}

async function callTrpcQuery<T>(procedure: string, input?: unknown): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const base = getTrpcBaseUrl();
    const params = new URLSearchParams();
    if (input !== undefined) {
      params.set("input", JSON.stringify(input));
    }
    const qs = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${base}/${procedure}${qs}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) return null;
    const json = await response.json();
    return (json?.result?.data as T) ?? null;
  } catch {
    return null;
  }
}

async function callTrpcMutation<T>(procedure: string, input: unknown): Promise<{ data: T | null; error: string | null }> {
  if (typeof fetch === "undefined") return { data: null, error: null };
  try {
    const base = getTrpcBaseUrl();
    const response = await fetch(`${base}/${procedure}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input ?? {}),
    });
    const json = await response.json();
    if (!response.ok) {
      const message = json?.error?.message || "Falha na chamada administrativa.";
      return { data: null, error: message };
    }
    return { data: (json?.result?.data as T) ?? null, error: null };
  } catch {
    return { data: null, error: null };
  }
}
const ADMIN_SESSION_ID = "admin-nexus-affiliate-core";
const ADMIN_INTERNAL_EMAIL = "equipe-restrita@nexus.internal";
const AUTHORIZED_ADMIN_EMAIL_SHA256 =
  "7d67005172b41a8cf0abe1b5de9a5f1605821ff22d0207e9bd0f2cfcb91384b2";
const AUTHORIZED_ADMIN_PASSWORD_SHA256 =
  "81493748f444279b87fbdb2770ad8a24e12d4c676ede14087d6920c98f6d9a2e";

export const ADMIN_ACCESS_LABEL = "Equipe Nexus Affil'IA'te";
export const ADMIN_RESTRICTED_NOTICE = "Acesso Restrito - Equipe Nexus Affil'IA'te";

const ADMIN_USER: User = {
  id: ADMIN_SESSION_ID,
  name: ADMIN_ACCESS_LABEL,
  email: ADMIN_INTERNAL_EMAIL,
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

function isAuthorizedAdminSession(user: User) {
  return user.role === "admin" && user.id === ADMIN_SESSION_ID && user.name === ADMIN_ACCESS_LABEL;
}

async function sha256(value: string) {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Criptografia do navegador indisponível para validar acesso administrativo.");
  }

  const encoded = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function matchesAuthorizedAdminEmail(email: string) {
  if (!email) return false;
  return (await sha256(email.trim().toLowerCase())) === AUTHORIZED_ADMIN_EMAIL_SHA256;
}

async function validateAdminCredentials(email: string, password: string) {
  if (!email.trim() || !password) return false;

  const [emailHash, passwordHash] = await Promise.all([
    sha256(email.trim().toLowerCase()),
    sha256(password),
  ]);

  return (
    emailHash === AUTHORIZED_ADMIN_EMAIL_SHA256 &&
    passwordHash === AUTHORIZED_ADMIN_PASSWORD_SHA256
  );
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
        if (parsed.role === "admin" && !isAuthorizedAdminSession(parsed)) {
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
    if (role === "admin") {
      throw new Error(
        `${ADMIN_RESTRICTED_NOTICE}. Faça login com e-mail e senha autorizados.`,
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

    // 1) Verifica disponibilidade do backend de auth admin.
    const status = await callTrpcQuery<{ ready: boolean }>("adminAuth.status");

    if (status?.ready) {
      // Caminho server-side: backend faz comparação por hash + emite token assinado.
      const { data, error } = await callTrpcMutation<{
        success: boolean;
        token: string;
        expiresAt: string;
      }>("adminAuth.login", { email: normalizedEmail, password });

      if (error || !data?.success || !data.token) {
        throw new Error(error || "E-mail ou senha inválidos para o backoffice administrativo.");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          ADMIN_TOKEN_KEY,
          JSON.stringify({ token: data.token, expiresAt: data.expiresAt }),
        );
      }

      setUser(ADMIN_USER);
      persistUser(ADMIN_USER);
      return ADMIN_USER;
    }

    // 2) Fallback local (backend ainda não publicado): valida hash no cliente.
    const isValid = await validateAdminCredentials(normalizedEmail, password);
    if (!isValid) {
      throw new Error("E-mail ou senha inválidos para o backoffice administrativo.");
    }

    setUser(ADMIN_USER);
    persistUser(ADMIN_USER);
    return ADMIN_USER;
  };

  const login = async (credentials?: LoginCredentials) => {
    const normalizedEmail = credentials?.email?.trim().toLowerCase() ?? "";
    const requestedAdmin =
      credentials?.role === "admin" || (normalizedEmail ? await matchesAuthorizedAdminEmail(normalizedEmail) : false);

    if (requestedAdmin) {
      if (!credentials?.password) {
        throw new Error("Acesso administrativo exige senha.");
      }
      return loginAdmin(normalizedEmail, credentials.password);
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
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
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
