import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Zap, CheckCircle, Lock, Sparkles } from "lucide-react";

export default function Upgrades() {
  const { data: available } = trpc.upgrades.listAvailable.useQuery();
  const { data: active } = trpc.upgrades.listActive.useQuery();
  const activateMutation = trpc.upgrades.activateUpgrade.useMutation();

  const upgradeIcons = {
    content_generation: <Sparkles className="w-5 h-5" />,
    analytics: <Zap className="w-5 h-5" />,
    automation: <Zap className="w-5 h-5" />,
    integration: <Zap className="w-5 h-5" />,
  };

  const isActive = (upgradeId: number) => {
    return active?.some((u) => u.upgradeId === upgradeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Upgrades e Plugins</h1>
        <p className="text-slate-600 mb-8">
          Potencialize seu agente IA com novos módulos e funcionalidades
        </p>

        {/* Upgrades Ativos */}
        {active && active.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Seus Upgrades Ativos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {active?.map((upgrade) => (
                <Card key={upgrade.id} className="border-0 shadow-sm border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        <CardTitle className="text-lg">Upgrade {upgrade.upgradeId}</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                    <CardDescription>Upgrade ativado em sua conta</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Status: {upgrade.status}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Ativo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upgrades Disponíveis */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Upgrades Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {available?.map((upgrade) => {
              const active_status = isActive(upgrade.id);
              return (
                <Card
                  key={upgrade.id}
                  className={`border-0 shadow-sm transition-all ${
                    active_status ? "opacity-50" : "hover:shadow-md"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                      </div>
                      {active_status && <Badge className="bg-green-100 text-green-800">Ativo</Badge>}
                    </div>
                    <CardDescription>{upgrade.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Tipo: {upgrade.type}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-2xl font-bold text-slate-900">
                          R$ {upgrade.price}
                          <span className="text-sm text-slate-600 font-normal">/mês</span>
                        </p>
                      </div>

                      <Button
                        onClick={() => activateMutation.mutate({ upgradeId: upgrade.id })}
                        disabled={active_status || activateMutation.isPending}
                        className="w-full gap-2"
                      >
                        {active_status ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Já Ativo
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Ativar Agora
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <Card className="border-0 shadow-sm mt-12 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Recursos Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              Todos os upgrades são pagos mensalmente e podem ser cancelados a qualquer momento. Seus dados e configurações serão preservados.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
