import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  activatePack,
  ensureAffiliateMarketplaceProfile,
  loadMarketplaceProfile,
  type MarketplaceProfile,
} from "@/lib/nexus-marketplace";

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

  const refresh = () => {
    const next = loadMarketplaceProfile();
    setProfile(next);
    return next;
  };

  const activate = (packSlug: string) => {
    const next = activatePack(loadMarketplaceProfile(), packSlug);
    setProfile(next);
    return next;
  };

  return {
    profile,
    refresh,
    activate,
  };
}
