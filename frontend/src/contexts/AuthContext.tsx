import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { trpc } from '../lib/trpc';

interface User {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  legacyLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'mmn_access_token';
const REFRESH_TOKEN_KEY = 'mmn_refresh_token_id';
const REFRESH_RAW_KEY = 'mmn_refresh_token_raw';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const saveTokens = (token: string, refreshId?: string, refreshRaw?: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshId) localStorage.setItem(REFRESH_TOKEN_KEY, refreshId);
    if (refreshRaw) localStorage.setItem(REFRESH_RAW_KEY, refreshRaw);
    setAccessToken(token);
  };

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_RAW_KEY);
    setAccessToken(null);
    setUser(null);
  };

  const tryRefreshToken = useCallback(async (): Promise<boolean> => {
    const tokenId = localStorage.getItem(REFRESH_TOKEN_KEY);
    const rawToken = localStorage.getItem(REFRESH_RAW_KEY);
    if (!tokenId || !rawToken) return false;

    try {
      const result = await trpc.auth.refreshToken.mutate({ tokenId, token: rawToken });
      if (result.accessToken) {
        saveTokens(result.accessToken, result.tokenId, result.refreshToken);
        return true;
      }
    } catch {
      clearTokens();
    }
    return false;
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        setAccessToken(stored);
        try {
          const me = await trpc.auth.me.query();
          if (me) {
            setUser(me as User);
          } else {
            const refreshed = await tryRefreshToken();
            if (!refreshed) clearTokens();
          }
        } catch {
          const refreshed = await tryRefreshToken();
          if (!refreshed) clearTokens();
        }
      }
      setLoading(false);
    };

    initSession();
  }, [tryRefreshToken]);

  const login = async (email: string, password: string) => {
    const result = await trpc.auth.login.mutate({ email, password });
    saveTokens(result.accessToken, result.refreshTokenId, result.refreshToken);
    setUser(result.user as User);
  };

  const legacyLogin = async (email: string, password: string) => {
    const result = await trpc.auth.legacyLogin.mutate({ email, password });
    saveTokens(result.accessToken);
    setUser(result.user as User);
  };

  const logout = async () => {
    try {
      await trpc.auth.logout.mutate({});
    } catch {
    }
    clearTokens();
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, login, legacyLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
