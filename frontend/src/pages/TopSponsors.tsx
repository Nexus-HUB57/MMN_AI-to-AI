import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, TrendingUp, Users, DollarSign, Zap, Target } from "lucide-react";
import { useState, useEffect } from "react";

interface Sponsor {
  id: number;
  name: string;
  avatar?: string;
  affiliateCode: string;
  level: number;
  totalCommissions: number;
  directReferrals: number;
  networkSize: number;
  status: "active" | "inactive";
  joinedDate: string;
  monthlyGrowth?: number;
}

interface TopSponsorsProps {
  limit?: number;
  onSponsorSelect?: (sponsor: Sponsor) => void;
}

export default function TopSponsors({ limit = 10, onSponsorSelect }: TopSponsorsProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    // Mock data - in production, this would come from an API
    const mockSponsors: Sponsor[] = [
      {
        id: 1,
        name: "Carlos Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
        affiliateCode: "CARLOS001",
        level: 5,
        totalCommissions: 15500,
        directReferrals: 12,
        networkSize: 145,
        status: "active",
        joinedDate: "2023-01-15",
        monthlyGrowth: 12.5,
      },
      {
        id: 2,
        name: "Marina Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina",
        affiliateCode: "MARINA002",
        level: 4,
        totalCommissions: 12300,
        directReferrals: 9,
        networkSize: 98,
        status: "active",
        joinedDate: "2023-03-22",
        monthlyGrowth: 8.3,
      },
      {
        id: 3,
        name: "João Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
        affiliateCode: "JOAO003",
        level: 4,
        totalCommissions: 10800,
        directReferrals: 8,
        networkSize: 87,
        status: "active",
        joinedDate: "2023-02-10",
        monthlyGrowth: 6.7,
      },
      {
        id: 4,
        name: "Fernanda Lima",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda",
        affiliateCode: "FERNANDA004",
        level: 3,
        totalCommissions: 8200,
        directReferrals: 6,
        networkSize: 62,
        status: "active",
        joinedDate: "2023-04-05",
        monthlyGrowth: 5.2,
      },
      {
        id: 5,
        name: "Ricardo Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
        affiliateCode: "RICARDO005",
        level: 3,
        totalCommissions: 7500,
        directReferrals: 5,
        networkSize: 55,
        status: "active",
        joinedDate: "2023-05-18",
        monthlyGrowth: 4.1,
      },
      {
        id: 6,
        name: "Beatriz Alves",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz",
        affiliateCode: "BEATRIZ006",
        level: 2,
        totalCommissions: 5900,
        directReferrals: 4,
        networkSize: 42,
        status: "active",
        joinedDate: "2023-06-12",
        monthlyGrowth: 3.8,
      },
      {
        id: 7,
        name: "Lucas Martins",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
        affiliateCode: "LUCAS007",
        level: 2,
        totalCommissions: 4300,
        directReferrals: 3,
        networkSize: 28,
        status: "active",
        joinedDate: "2023-07-08",
        monthlyGrowth: 2.9,
      },
      {
        id: 8,
        name: "Gabriela Rocha",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriela",
        affiliateCode: "GABRIELA008",
        level: 2,
        totalCommissions: 3800,
        directReferrals: 3,
        networkSize: 24,
        status: "active",
        joinedDate: "2023-08-20",
        monthlyGrowth: 2.1,
      },
      {
        id: 9,
        name: "Felipe Gomes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe",
        affiliateCode: "FELIPE009",
        level: 1,
        totalCommissions: 2100,
        directReferrals: 2,
        networkSize: 15,
        status: "active",
        joinedDate: "2023-09-14",
        monthlyGrowth: 1.5,
      },
      {
        id: 10,
        name: "Camila Ferreira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Camila",
        affiliateCode: "CAMILA010",
        level: 1,
        totalCommissions: 1500,
        directReferrals: 1,
        networkSize: 8,
        status: "active",
        joinedDate: "2023-10-03",
        monthlyGrowth: 0.8,
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setSponsors(mockSponsors.slice(0, limit));
      setIsLoading(false);
    }, 500);
  }, [limit]);

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 5:
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case 4:
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case 3:
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case 2:
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getLevelName = (level: number) => {
    const levels = {
      5: "Platina",
      4: "Ouro",
      3: "Prata",
      2: "Bronze",
      1: "Iniciante",
    };
    return levels[level as keyof typeof levels] || "Iniciante";
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="hud-frame bg-black/40 border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan font-orbitron">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top Patrocinadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-black/60 rounded border border-neon-cyan/20 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="hud-frame bg-black/40 border-neon-cyan/30">
        <div className="corner-bracket top-left"></div>
        <div className="corner-bracket top-right"></div>
        <div className="corner-bracket bottom-left"></div>
        <div className="corner-bracket bottom-right"></div>

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan font-orbitron">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top {limit} Patrocinadores
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-neon-cyan/20 hover:border-neon-cyan/60 bg-black/30 hover:bg-black/50 cursor-pointer transition-all"
                onClick={() => {
                  setSelectedSponsor(sponsor);
                  onSponsorSelect?.(sponsor);
                }}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {index === 0 ? (
                    <span className="text-2xl">🥇</span>
                  ) : index === 1 ? (
                    <span className="text-2xl">🥈</span>
                  ) : index === 2 ? (
                    <span className="text-2xl">🥉</span>
                  ) : (
                    <span className="text-neon-cyan font-orbitron">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar and Name */}
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10 border border-neon-cyan/30">
                    <AvatarImage src={sponsor.avatar} alt={sponsor.name} />
                    <AvatarFallback className="bg-black/60 text-neon-cyan">
                      {sponsor.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate text-white font-orbitron">
                      {sponsor.name}
                    </p>
                    <Badge className={`text-xs ${getLevelBadgeColor(sponsor.level)}`}>
                      {getLevelName(sponsor.level)}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary font-space-mono">
                    {sponsor.affiliateCode}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-neon-pink font-orbitron">
                    {formatCurrency(sponsor.totalCommissions)}
                  </div>
                  <div className="text-xs text-text-secondary flex items-center justify-end gap-1 font-space-mono">
                    <Users className="w-3 h-3" />
                    {sponsor.networkSize}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sponsor Details */}
      {selectedSponsor && (
        <Card className="hud-frame bg-black/40 border-neon-pink/30">
          <div className="corner-bracket top-left"></div>
          <div className="corner-bracket top-right"></div>
          <div className="corner-bracket bottom-left"></div>
          <div className="corner-bracket bottom-right"></div>

          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border border-neon-pink/30">
                  <AvatarImage src={selectedSponsor.avatar} alt={selectedSponsor.name} />
                  <AvatarFallback className="bg-black/60 text-neon-pink">
                    {selectedSponsor.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-white font-orbitron">
                    {selectedSponsor.name}
                  </CardTitle>
                  <p className="text-sm text-text-secondary font-space-mono">
                    {selectedSponsor.affiliateCode}
                  </p>
                </div>
              </div>
              <Badge className={`text-sm ${getLevelBadgeColor(selectedSponsor.level)}`}>
                {getLevelName(selectedSponsor.level)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-black/60 rounded border border-neon-cyan/20">
                <DollarSign className="w-4 h-4 text-neon-pink" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-space-mono">
                    Comissões Totais
                  </p>
                  <p className="font-bold text-neon-pink font-orbitron">
                    {formatCurrency(selectedSponsor.totalCommissions)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-black/60 rounded border border-neon-cyan/20">
                <Users className="w-4 h-4 text-neon-cyan" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-space-mono">
                    Rede Total
                  </p>
                  <p className="font-bold text-neon-cyan font-orbitron">
                    {selectedSponsor.networkSize} pessoas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-black/60 rounded border border-neon-cyan/20">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-space-mono">
                    Diretos
                  </p>
                  <p className="font-bold text-purple-500 font-orbitron">
                    {selectedSponsor.directReferrals}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-black/60 rounded border border-neon-cyan/20">
                <Zap className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-text-secondary uppercase font-space-mono">
                    Crescimento
                  </p>
                  <p className="font-bold text-yellow-500 font-orbitron">
                    {selectedSponsor.monthlyGrowth?.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-2 p-3 bg-black/60 rounded border border-neon-cyan/20">
                <Target className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-xs text-text-secondary uppercase font-space-mono">
                    Membro desde
                  </p>
                  <p className="font-bold text-green-500 font-orbitron">
                    {new Date(selectedSponsor.joinedDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
