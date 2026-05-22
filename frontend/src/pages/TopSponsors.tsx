import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Crown,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Sponsor {
  id: number;
  name: string;
  email?: string | null;
  affiliateCode: string;
  downlineCount: number;
  totalCommissions: number;
  status: string;
  joinedDate: string | Date;
  points?: number;
}

interface TopSponsorsProps {
  limit?: number;
  onSponsorSelect?: (sponsor: Sponsor) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function getTier(downlineCount: number) {
  if (downlineCount >= 25) {
    return {
      label: "Diamante",
      className: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    };
  }
  if (downlineCount >= 15) {
    return {
      label: "Platina",
      className: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    };
  }
  if (downlineCount >= 8) {
    return {
      label: "Ouro",
      className: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    };
  }
  if (downlineCount >= 4) {
    return {
      label: "Prata",
      className: "bg-slate-400/20 text-slate-200 border border-slate-400/30",
    };
  }
  return {
    label: "Ascensão",
    className:
      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  };
}

export default function TopSponsors({
  limit = 10,
  onSponsorSelect,
}: TopSponsorsProps) {
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const sponsorsQuery = trpc.network.getTopSponsors.useQuery({ limit });

  const sponsors = useMemo(
    () => sponsorsQuery.data ?? [],
    [sponsorsQuery.data],
  );
  const leader = sponsors[0] ?? null;

  if (sponsorsQuery.isLoading) {
    return (
      <Card className="hud-frame bg-black/40 border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan font-orbitron">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top patrocinadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg border border-neon-cyan/20 bg-black/50"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sponsorsQuery.isError) {
    return (
      <Card className="hud-frame bg-black/40 border-red-500/30">
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="font-orbitron text-white">
            Não foi possível carregar o ranking.
          </p>
          <p className="mt-2 text-sm text-text-secondary font-space-mono">
            {sponsorsQuery.error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sponsors.length === 0) {
    return (
      <Card className="hud-frame bg-black/40 border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan font-orbitron">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top patrocinadores
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-text-secondary font-space-mono">
          Ainda não há patrocinadores suficientes para compor o ranking.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leader ? (
        <Card className="hud-frame bg-black/40 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border border-yellow-500/40">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(leader.name)}`}
                  alt={leader.name}
                />
                <AvatarFallback className="bg-black/60 text-yellow-400">
                  {leader.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-400 font-space-mono">
                  Líder da rede
                </p>
                <h3 className="truncate text-xl font-orbitron text-white">
                  {leader.name}
                </h3>
                <p className="text-sm text-text-secondary font-space-mono">
                  {leader.affiliateCode} · {leader.downlineCount} conexões na
                  rede
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary font-space-mono">
                  Comissões
                </p>
                <p className="text-lg font-orbitron text-yellow-400">
                  {formatCurrency(leader.totalCommissions)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="hud-frame bg-black/40 border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan font-orbitron">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top {limit} patrocinadores
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {sponsors.map((sponsor, index) => {
              const tier = getTier(sponsor.downlineCount);
              return (
                <button
                  key={sponsor.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border border-neon-cyan/20 bg-black/30 p-3 text-left transition-all hover:border-neon-cyan/60 hover:bg-black/50"
                  onClick={() => {
                    setSelectedSponsor(sponsor);
                    onSponsorSelect?.(sponsor);
                  }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center font-bold text-sm">
                    {index === 0 ? (
                      <span className="text-2xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-2xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="font-orbitron text-neon-cyan">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  <Avatar className="h-10 w-10 border border-neon-cyan/30">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sponsor.name)}`}
                      alt={sponsor.name}
                    />
                    <AvatarFallback className="bg-black/60 text-neon-cyan">
                      {sponsor.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white font-orbitron">
                        {sponsor.name}
                      </p>
                      <Badge className={`text-[10px] ${tier.className}`}>
                        {tier.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary font-space-mono">
                      {sponsor.affiliateCode}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-neon-pink font-orbitron">
                      {formatCurrency(sponsor.totalCommissions)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-text-secondary font-space-mono">
                      <Users className="h-3 w-3" />
                      {sponsor.downlineCount}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedSponsor ? (
        <Card className="hud-frame bg-black/40 border-neon-pink/30">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-orbitron text-white">
                  {selectedSponsor.name}
                </CardTitle>
                <p className="mt-1 text-sm text-text-secondary font-space-mono">
                  {selectedSponsor.affiliateCode}
                </p>
              </div>
              <Badge
                className={getTier(selectedSponsor.downlineCount).className}
              >
                {getTier(selectedSponsor.downlineCount).label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-neon-cyan/20 bg-black/60 p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-neon-pink" />
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary font-space-mono">
                  Comissões totais
                </p>
              </div>
              <p className="mt-2 text-lg font-orbitron text-neon-pink">
                {formatCurrency(selectedSponsor.totalCommissions)}
              </p>
            </div>

            <div className="rounded-lg border border-neon-cyan/20 bg-black/60 p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-neon-cyan" />
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary font-space-mono">
                  Volume de rede
                </p>
              </div>
              <p className="mt-2 text-lg font-orbitron text-neon-cyan">
                {selectedSponsor.downlineCount} conexões
              </p>
            </div>

            <div className="rounded-lg border border-neon-cyan/20 bg-black/60 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary font-space-mono">
                  Pontos acumulados
                </p>
              </div>
              <p className="mt-2 text-lg font-orbitron text-yellow-400">
                {selectedSponsor.points ?? 0} pts
              </p>
            </div>

            <div className="rounded-lg border border-neon-cyan/20 bg-black/60 p-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary font-space-mono">
                  Membro desde
                </p>
              </div>
              <p className="mt-2 text-lg font-orbitron text-green-400">
                {new Date(selectedSponsor.joinedDate).toLocaleDateString(
                  "pt-BR",
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
