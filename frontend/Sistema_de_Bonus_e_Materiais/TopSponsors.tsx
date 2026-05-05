import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, TrendingUp, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

interface Sponsor {
  id: number;
  name: string;
  avatar?: string;
  affiliateCode: string;
  level: number;
  totalCommissions: string;
  directReferrals: number;
  networkSize: number;
  status: "active" | "inactive";
  joinedDate: string;
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
        totalCommissions: "15.500,00",
        directReferrals: 12,
        networkSize: 145,
        status: "active",
        joinedDate: "2023-01-15",
      },
      {
        id: 2,
        name: "Marina Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina",
        affiliateCode: "MARINA002",
        level: 4,
        totalCommissions: "12.300,00",
        directReferrals: 9,
        networkSize: 98,
        status: "active",
        joinedDate: "2023-03-22",
      },
      {
        id: 3,
        name: "João Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
        affiliateCode: "JOAO003",
        level: 4,
        totalCommissions: "10.800,00",
        directReferrals: 8,
        networkSize: 87,
        status: "active",
        joinedDate: "2023-02-10",
      },
      {
        id: 4,
        name: "Fernanda Lima",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda",
        affiliateCode: "FERNANDA004",
        level: 3,
        totalCommissions: "8.200,00",
        directReferrals: 6,
        networkSize: 62,
        status: "active",
        joinedDate: "2023-04-05",
      },
      {
        id: 5,
        name: "Ricardo Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
        affiliateCode: "RICARDO005",
        level: 3,
        totalCommissions: "7.500,00",
        directReferrals: 5,
        networkSize: 55,
        status: "active",
        joinedDate: "2023-05-18",
      },
      {
        id: 6,
        name: "Beatriz Alves",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz",
        affiliateCode: "BEATRIZ006",
        level: 2,
        totalCommissions: "5.900,00",
        directReferrals: 4,
        networkSize: 42,
        status: "active",
        joinedDate: "2023-06-12",
      },
      {
        id: 7,
        name: "Lucas Martins",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
        affiliateCode: "LUCAS007",
        level: 2,
        totalCommissions: "4.300,00",
        directReferrals: 3,
        networkSize: 28,
        status: "active",
        joinedDate: "2023-07-08",
      },
      {
        id: 8,
        name: "Gabriela Rocha",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriela",
        affiliateCode: "GABRIELA008",
        level: 2,
        totalCommissions: "3.800,00",
        directReferrals: 3,
        networkSize: 24,
        status: "active",
        joinedDate: "2023-08-20",
      },
      {
        id: 9,
        name: "Felipe Gomes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe",
        affiliateCode: "FELIPE009",
        level: 1,
        totalCommissions: "2.100,00",
        directReferrals: 2,
        networkSize: 15,
        status: "active",
        joinedDate: "2023-09-14",
      },
      {
        id: 10,
        name: "Camila Ferreira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Camila",
        affiliateCode: "CAMILA010",
        level: 1,
        totalCommissions: "1.500,00",
        directReferrals: 1,
        networkSize: 8,
        status: "active",
        joinedDate: "2023-10-03",
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
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-purple-100 text-purple-800";
      case 3:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top Patrocinadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top {limit} Patrocinadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
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
                    <span className="text-gray-600">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar and Name */}
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={sponsor.avatar} alt={sponsor.name} />
                    <AvatarFallback>{sponsor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{sponsor.name}</p>
                    <Badge className={`text-xs ${getLevelBadgeColor(sponsor.level)}`}>
                      {getLevelName(sponsor.level)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{sponsor.affiliateCode}</p>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-green-600">
                    R$ {sponsor.totalCommissions}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
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
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedSponsor.avatar} alt={selectedSponsor.name} />
                  <AvatarFallback>{selectedSponsor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedSponsor.name}</CardTitle>
                  <p className="text-sm text-gray-600">{selectedSponsor.affiliateCode}</p>
                </div>
              </div>
              <Badge className={`text-sm ${getLevelBadgeColor(selectedSponsor.level)}`}>
                {getLevelName(selectedSponsor.level)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Comissões Totais</p>
                  <p className="font-bold">R$ {selectedSponsor.totalCommissions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Rede Total</p>
                  <p className="font-bold">{selectedSponsor.networkSize} pessoas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Diretos</p>
                  <p className="font-bold">{selectedSponsor.directReferrals}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600">Membro desde</p>
                <p className="font-bold">{new Date(selectedSponsor.joinedDate).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
