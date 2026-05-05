import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Gift, Star, Award, TrendingUp, Zap, Target } from "lucide-react";
import { useState } from "react";

interface Bonus {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
  icon: React.ReactNode;
  category: "achievement" | "milestone" | "leadership";
  expiresAt?: string;
  requirements: string[];
}

interface BonusRewardsProps {
  affiliateId?: number;
  userName?: string;
}

export default function BonusRewards({ affiliateId, userName = "Afiliado" }: BonusRewardsProps) {
  const [selectedBonus, setSelectedBonus] = useState<number | null>(null);

  const bonuses: Bonus[] = [
    {
      id: 1,
      title: "Bônus de Início Rápido",
      description: "Atinja 5 novos afiliados diretos em 30 dias.",
      progress: 60,
      reward: "R$ 500,00",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      category: "achievement",
      expiresAt: "2024-06-05",
      requirements: ["5 afiliados diretos", "Dentro de 30 dias", "Status ativo"],
    },
    {
      id: 2,
      title: "Prêmio Esmeralda",
      description: "Alcance o volume de vendas de R$ 50.000,00 com sua rede.",
      progress: 35,
      reward: "Viagem para Resort (R$ 3.000)",
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      category: "milestone",
      requirements: ["R$ 50.000 em vendas", "Rede ativa", "Sem multas"],
    },
    {
      id: 3,
      title: "Bônus de Liderança",
      description: "Ajude 3 diretos a alcançarem o nível Rubi.",
      progress: 0,
      reward: "Participação nos Lucros (2%)",
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      category: "leadership",
      requirements: ["3 afiliados em nível Rubi", "Manter nível por 3 meses"],
    },
    {
      id: 4,
      title: "Bônus de Consistência",
      description: "Mantenha vendas ativas por 6 meses consecutivos.",
      progress: 50,
      reward: "R$ 1.000,00 + Brinde Exclusivo",
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      category: "achievement",
      requirements: ["6 meses de vendas", "Mínimo R$ 1.000/mês", "Sem suspensões"],
    },
    {
      id: 5,
      title: "Bônus de Expansão",
      description: "Construa uma rede com 50+ afiliados totais.",
      progress: 25,
      reward: "Comissão Especial (5% extra)",
      icon: <Target className="w-6 h-6 text-purple-500" />,
      category: "leadership",
      requirements: ["50+ afiliados na rede", "Manter atividade", "Sem penalidades"],
    },
    {
      id: 6,
      title: "Bônus Top Performer",
      description: "Seja um dos 10 melhores afiliados do mês.",
      progress: 75,
      reward: "R$ 2.000,00 + Reconhecimento Público",
      icon: <Star className="w-6 h-6 text-pink-500" />,
      category: "achievement",
      expiresAt: "2024-05-31",
      requirements: ["Top 10 do mês", "Ranking por vendas", "Sem reclamações"],
    },
  ];

  const achievementBonuses = bonuses.filter((b) => b.category === "achievement");
  const milestoneBonuses = bonuses.filter((b) => b.category === "milestone");
  const leadershipBonuses = bonuses.filter((b) => b.category === "leadership");

  const totalRewards = bonuses.reduce((acc, bonus) => {
    const match = bonus.reward.match(/R\$ ([\d.]+)/);
    return acc + (match ? parseFloat(match[1].replace(".", "")) : 0);
  }, 0);

  const completedBonuses = bonuses.filter((b) => b.progress === 100).length;

  const BonusCard = ({ bonus }: { bonus: Bonus }) => (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg border-l-4"
      style={{
        borderLeftColor:
          bonus.category === "achievement"
            ? "#3b82f6"
            : bonus.category === "milestone"
            ? "#10b981"
            : "#a855f7",
      }}
      onClick={() => setSelectedBonus(bonus.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">{bonus.icon}</div>
            <div className="flex-1">
              <CardTitle className="text-lg">{bonus.title}</CardTitle>
              <CardDescription className="mt-1">{bonus.description}</CardDescription>
            </div>
          </div>
          {bonus.expiresAt && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded whitespace-nowrap">
              Expira em {new Date(bonus.expiresAt).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progresso</span>
            <span className="text-gray-600">{bonus.progress}%</span>
          </div>
          <Progress value={bonus.progress} className="h-2" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">Recompensa:</span>
          <span className="font-bold text-green-600">{bonus.reward}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bônus e Prêmios</h1>
        <p className="text-gray-600">
          Bem-vindo, {userName}! Acompanhe suas metas e conquiste recompensas exclusivas.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Bônus Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{bonuses.length}</div>
            <p className="text-xs text-blue-700 mt-1">{completedBonuses} completados</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Recompensas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">R$ {totalRewards.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-green-700 mt-1">Valor potencial</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(bonuses.reduce((a, b) => a + b.progress, 0) / bonuses.length)}%
            </div>
            <p className="text-xs text-purple-700 mt-1">Média de progresso</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different bonus categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({bonuses.length})</TabsTrigger>
          <TabsTrigger value="achievement">Realizações ({achievementBonuses.length})</TabsTrigger>
          <TabsTrigger value="milestone">Marcos ({milestoneBonuses.length})</TabsTrigger>
          <TabsTrigger value="leadership">Liderança ({leadershipBonuses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonuses.map((bonus) => (
              <BonusCard key={bonus.id} bonus={bonus} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievement" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementBonuses.map((bonus) => (
              <BonusCard key={bonus.id} bonus={bonus} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestone" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestoneBonuses.map((bonus) => (
              <BonusCard key={bonus.id} bonus={bonus} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leadership" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadershipBonuses.map((bonus) => (
              <BonusCard key={bonus.id} bonus={bonus} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bonus Details Modal */}
      {selectedBonus !== null && (
        <Card className="border-2 border-blue-200 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalhes do Bônus</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBonus(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bonuses.find((b) => b.id === selectedBonus) && (
              <>
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {bonuses.find((b) => b.id === selectedBonus)?.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {bonuses.find((b) => b.id === selectedBonus)?.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requisitos:</h4>
                  <ul className="space-y-1">
                    {bonuses
                      .find((b) => b.id === selectedBonus)
                      ?.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="text-green-600">✓</span> {req}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Recompensa:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bonuses.find((b) => b.id === selectedBonus)?.reward}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Acompanhar Progresso
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Compartilhar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
