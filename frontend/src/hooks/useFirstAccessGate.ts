import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

/**
 * useFirstAccessGate (Onda 17)
 * ---------------------------------------------------------------------------
 * Regra de negócio:
 *  - Todo afiliado que faz o primeiro acesso e ainda NÃO possui Pack ativado
 *    é redirecionado para /marketplaces para adquirir o Nexus Partners Pack.
 *  - O gate roda uma única vez por sessão (flag em sessionStorage) para não
 *    prender o usuário caso ele opte por explorar antes de comprar.
 *  - Rotas que SEMPRE ficam liberadas (não redirecionam):
 *      /marketplaces, /marketplaces/*, /pix/checkout, /pix/history,
 *      /login, /logout, /cadastro, /minisite, /afiliado/*
 *  - Admins nunca são redirecionados.
 */

const SESSION_KEY = "mmn-onda17-first-access-gate-shown";

const ALLOWED_PREFIXES = [
  "/marketplaces",
  "/pix/",
  "/login",
  "/logout",
  "/cadastro",
  "/minisite",
  "/afiliado/",
  "/admin/", // admin backoffice nunca é gated
  "/packs",
];

function isAllowed(path: string): boolean {
  if (path === "/") return false; // Home cai no gate
  return ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p));
}

export function useFirstAccessGate() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  const status = (trpc as any).dashboardStatus?.getStatus?.useQuery?.(undefined, {
    enabled: !!isAuthenticated && user?.role !== "admin",
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === "admin") return;
    if (status?.isLoading) return;

    const agentActive = !!status?.data?.agentActive;
    if (agentActive) return; // pack já ativado, sem gate

    if (isAllowed(location)) return; // rota já é livre

    // Só redireciona uma vez por sessão
    if (typeof window !== "undefined") {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }

    setLocation("/marketplaces?firstAccess=1");
  }, [isAuthenticated, user, status?.isLoading, status?.data, location, setLocation]);
}

export default useFirstAccessGate;
