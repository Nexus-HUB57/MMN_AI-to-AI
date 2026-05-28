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

interface SocialSessionPayload {
  uid: string;
  email: string | null;
  user: { id: number; name: string | null; email: string | null; role: string; picture?: string | null };
  sessionId: string;
  tokenId: string;
  provider: "google" | "facebook" | "apple";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials?: LoginCredentials) => Promise<User>;
  loginAsDemo: (role: "admin" | "affiliate", overrides?: Partial<User>) => Promise<User>;
  loginWithSocial: (payload: SocialSessionPayload) => User;
  logout: () => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<User>;
}

const STORAGE_KEY = "mmn-ai-auth-session";
const ADMIN_TOKEN_KEY = "mmn-ai-admin-token";
const ADMIN_LOCKOUT_KEY = "mmn-ai-admin-lockout";
const SOCIAL_TOKEN_KEY = "mmn-ai-social-token";
const ADMIN_LOCAL_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 10 * 60 * 1000; // 10 min

interface AdminLockoutState {
  attempts: number;
  lockedUntil: number | null;
}

function readLockout(): AdminLockoutState {
  if (typeof window === "undefined") return { attempts: 0, lockedUntil: null };
  try {
    const raw = window.localStorage.getItem(ADMIN_LOCKOUT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as AdminLockoutState;
    if (parsed.lockedUntil && parsed.lockedUntil < Date.now()) {
      return { attempts: 0, lockedUntil: null };
    }
    return parsed;
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function writeLockout(state: AdminLockoutState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify(state));
}

function clearLockout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_LOCKOUT_KEY);
}

function registerAdminFailure() {
  const current = readLockout();
  const attempts = current.attempts + 1;
  const lockedUntil =
    attempts >= ADMIN_MAX_ATTEMPTS ? Date.now() + ADMIN_LOCKOUT_MS : current.lockedUntil;
  writeLockout({ attempts, lockedUntil });
}

function ensureAdminUnlocked() {
  const lockout = readLockout();
  if (lockout.lockedUntil && lockout.lockedUntil > Date.now()) {
    const minutes = Math.max(1, Math.ceil((lockout.lockedUntil - Date.now()) / 60000));
    throw new Error(
      `Acesso administrativo temporariamente bloqueado por ${minutes} min após tentativas inválidas.`,
    );
  }
}

function persistAdminSessionWindow() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    ADMIN_TOKEN_KEY,
    JSON.stringify({
      token: "local-fallback",
      expiresAt: new Date(Date.now() + ADMIN_LOCAL_TTL_MS).toISOString(),
    }),
  );
}

function isAdminLocalSessionValid(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { expiresAt?: string };
    if (!parsed.expiresAt) return false;
    return new Date(parsed.expiresAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

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
        if (parsed.role === "admin") {
          if (!isAuthorizedAdminSession(parsed) || !isAdminLocalSessionValid()) {
            window.localStorage.removeItem(STORAGE_KEY);
            window.localStorage.removeItem(ADMIN_TOKEN_KEY);
          } else {
            setUser(parsed);
          }
        } else {
          // Verificar se existe sessão social válida para restaurar
          const socialRaw = window.localStorage.getItem(SOCIAL_TOKEN_KEY);
          if (socialRaw) {
            try {
              const socialSession = JSON.parse(socialRaw) as { expiresAt?: string };
              if (socialSession.expiresAt && new Date(socialSession.expiresAt).getTime() > Date.now()) {
                // Sessão social ainda válida — restaurar
                setUser(parsed);
              } else {
                // Sessão social expirada — limpar e não restaurar
                window.localStorage.removeItem(STORAGE_KEY);
                window.localStorage.removeItem(SOCIAL_TOKEN_KEY);
              }
            } catch {
              setUser(parsed);
            }
          } else {
            setUser(parsed);
          }
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
    ensureAdminUnlocked();
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
        registerAdminFailure();
        throw new Error(error || "E-mail ou senha inválidos para o backoffice administrativo.");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          ADMIN_TOKEN_KEY,
          JSON.stringify({ token: data.token, expiresAt: data.expiresAt }),
        );
      }

      clearLockout();
      setUser(ADMIN_USER);
      persistUser(ADMIN_USER);
      return ADMIN_USER;
    }

    // 2) Fallback local (backend ainda não publicado): valida hash no cliente.
    const isValid = await validateAdminCredentials(normalizedEmail, password);
    if (!isValid) {
      registerAdminFailure();
      throw new Error("E-mail ou senha inválidos para o backoffice administrativo.");
    }

    clearLockout();
    persistAdminSessionWindow();
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

  const loginWithSocial = (payload: SocialSessionPayload): User => {
    const socialUser: User = {
      id: String(payload.user.id),
      name: payload.user.name ?? payload.email ?? "Usuário",
      email: payload.user.email ?? payload.email ?? "",
      role: (payload.user.role as UserRole) ?? "user",
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SOCIAL_TOKEN_KEY,
        JSON.stringify({
          sessionId: payload.sessionId,
          tokenId: payload.tokenId,
          provider: payload.provider,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      );
    }

    setUser(socialUser);
    persistUser(socialUser);
    return socialUser;
  };

  // Escuta evento disparado por SocialLoginButtons após login Firebase bem-sucedido
  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<SocialSessionPayload>).detail;
      if (detail?.sessionId && detail?.user) {
        loginWithSocial(detail);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("mmn:social-login", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mmn:social-login", handler);
      }
    };
  }, []);

  const logout = async () => {
    setUser(null);
    persistUser(null);

    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_LOCKOUT_KEY);
      window.localStorage.removeItem(SOCIAL_TOKEN_KEY);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      loginAsDemo,
      loginWithSocial,
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
