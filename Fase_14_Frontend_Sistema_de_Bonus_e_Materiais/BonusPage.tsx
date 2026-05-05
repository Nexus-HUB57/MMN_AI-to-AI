"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gift, Star, Award, TrendingUp } from "lucide-react";
import TopSponsors from "./TopSponsors";

export default function BonusPage() {
  const bonuses = [
    {
      id: 1,
      title: "Bônus de Início Rápido",
      description: "Atinja 5 novos afiliados diretos em 30 dias.",
      progress: 60,
      reward: "R$ 500,00",
      icon: <TrendingUp className="text-neon-cyan" />,
    },
    {
      id: 2,
      title: "Prêmio Esmeralda",
      description: "Alcance o volume de vendas de R$ 50.000,00 com sua rede.",
      progress: 35,
      reward: "Viagem para Resort",
      icon: <Award className="text-neon-pink" />,
    },
    {
      id: 3,
      title: "Bônus de Liderança",
      description: "Ajude 3 diretos a alcançarem o nível Rubi.",
      progress: 0,
      reward: "Participação nos Lucros (2%)",
      icon: <Trophy className="text-yellow-500" />,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-orbitron font-bold text-glow-pink">
          Bônus e Prêmios
        </h1>
        <p className="text-neon-cyan font-space-mono">
          Acompanhe suas metas e conquistas no ecossistema Nexus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-orbitron text-white flex items-center gap-2">
            <Gift className="text-neon-pink" /> Metas Ativas
          </h2>
          
          <div className="grid gap-6">
            {bonuses.map((bonus) => (
              <Card key={bonus.id} className="hud-frame bg-black/40 border-neon-cyan/30">
                <div className="corner-bracket top-left"></div>
                <div className="corner-bracket top-right"></div>
                <div className="corner-bracket bottom-left"></div>
                <div className="corner-bracket bottom-right"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/60 rounded-lg border border-neon-cyan/20">
                      {bonus.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-orbitron text-white">
                        {bonus.title}
                      </CardTitle>
                      <p className="text-sm text-text-secondary font-space-mono">
                        {bonus.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary uppercase font-space-mono">Prêmio</p>
                    <p className="text-lg font-bold text-neon-pink font-orbitron">{bonus.reward}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-space-mono">
                      <span className="text-neon-cyan">Progresso</span>
                      <span className="text-white">{bonus.progress}%</span>
                    </div>
                    <Progress value={bonus.progress} className="h-2 bg-black/60" />
                  </div>
                  <Button className="mt-4 w-full btn-neon-cyan font-orbitron text-xs">
                    VER DETALHES DA META
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-orbitron text-white flex items-center gap-2">
            <Star className="text-yellow-500" /> Top Patrocinadores
          </h2>
          <TopSponsors />
        </div>
      </div>
    </div>
  );
}
