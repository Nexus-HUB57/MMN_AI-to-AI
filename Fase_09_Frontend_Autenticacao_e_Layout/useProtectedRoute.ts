import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Hook para proteger rotas que requerem autenticacao
 * Redireciona para login se o usuario nao estiver autenticado
 * Preserva a rota de origem para redirecionamento apos login
 */
export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Preservar a rota atual como parametro from para redirecionamento apos login
      const loginUrl = `/login?from=${encodeURIComponent(location)}`;
      setLocation(loginUrl);
    }
  }, [isAuthenticated, loading, location, setLocation]);

  return { isAuthenticated, loading };
}
