import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  activatePack,
  ensureAffiliateMarketplaceProfile,
  loadMarketplaceProfile,
  type MarketplaceProfile,
} from "@/lib/nexus-marketplace";
import { trpc } from "@/lib/trpc";

/**
 * useMarketplaceProfile
 *
 * P0-FIX-2026-08-03: alem de carregar o perfil salvo localmente (localStorage /
 * ensureAffiliateMarketplaceProfile), agora consulta o backend via
 * affiliateStore.myInventory e mescla os `activePacks` retornados no perfil
 * exibido. Antes deste fix o Marketplace Nexus nao reconhecia o Pack A2 pago
 * porque comparava so contra o perfil do browser (o webhook do MP grava
 * marketplace_user_library / pack_activations no DB, nao no localStorage).
 */
export function useMarketplaceProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MarketplaceProfile>(() => loadMarketplaceProfile());

  useEffect(() => {
    if (user?.role === "affiliate") {
      setProfile(
        ensureAffiliateMarketplaceProfile({
          id: user.id,
          name: user.name,
          email: user.email,
        }),
      );
      return;
    }

    setProfile(loadMarketplaceProfile());
  }, [user?.email, user?.id, user?.name, user?.role]);

  // Consulta o inventario real do afiliado logado no backend.
  const inventoryQuery = (trpc as any).affiliateStore?.myInventory?.useQuery
    ? (trpc as any).affiliateStore.myInventory.useQuery(undefined, {
        enabled: !!user?.id,
        refetchOnWindowFocus: true,
        refetchInterval: 60_000,
        retry: false,
      })
    : null;

  const serverActivePacks: string[] = useMemo(() => {
    const raw = inventoryQuery?.data?.activePacks;
    if (!Array.isArray(raw)) return [];
    return raw.filter((slug: any): slug is string => typeof slug === "string" && slug.length > 0);
  }, [inventoryQuery?.data?.activePacks]);

  const mergedProfile: MarketplaceProfile = useMemo(() => {
    if (serverActivePacks.length === 0) return profile;
    const previous = Array.isArray((profile as any).activePackSlugs) ? (profile as any).activePackSlugs : [];
    const nextActive = Array.from(new Set([...previous, ...serverActivePacks]));
    return { ...profile, activePackSlugs: nextActive } as MarketplaceProfile;
  }, [profile, serverActivePacks]);

  const refresh = () => {
    const next = loadMarketplaceProfile();
    setProfile(next);
    if (inventoryQuery?.refetch) {
      inventoryQuery.refetch().catch(() => undefined);
    }
    return next;
  };

  const activate = (packSlug: string) => {
    const next = activatePack(loadMarketplaceProfile(), packSlug);
    setProfile(next);
    if (inventoryQuery?.refetch) {
      inventoryQuery.refetch().catch(() => undefined);
    }
    return next;
  };

  return {
    profile: mergedProfile,
    refresh,
    activate,
    inventoryQuery,
    serverActivePacks,
  };
}
