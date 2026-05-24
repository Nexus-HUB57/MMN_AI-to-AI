import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Star, Users, TrendingUp, ArrowRight, Zap } from "lucide-react";

export default function AffiliateMiniSite() {
  const [match, params] = useRoute("/afiliado/:code");
  const code = params?.code as string;

  const { data: affiliate, isLoading } = trpc.mmn.getAffiliateByCode.useQuery(
    { code: code || "" },
    { enabled: !!code }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-slate-300">Carregando...</p>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-slate-800 text-white">
          <CardContent className="pt-6">
            <p className="text-slate-300">Afiliado não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Bem-vindo ao Programa de Afiliados</h1>
          <p className="text-xl text-indigo-100 mb-8">
            Ganhe comissões promovendo produtos de alta demanda com suporte de IA
          </p>
          <Button size="lg" variant="secondary" className="gap-2 bg-white text-indigo-600 hover:bg-slate-100">
            Começar Agora <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Affiliate Info */}
        <Card className="border-0 shadow-lg mb-8 bg-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Seu Patrocinador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-white">Afiliado #{affiliate.id}</p>
                <p className="text-sm text-slate-400">Código: {affiliate.affiliateCode}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">R$ {affiliate.totalCommissions}</p>
                <p className="text-sm text-slate-400">Ganhos totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Comissões Altas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Ganhe até {affiliate.commissionPercentage}% de comissão em cada venda realizada através do seu link.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-green-400" />
                Rede Multinível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Indique outras pessoas e ganhe comissões de toda a sua rede de indicados em múltiplos níveis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                Agente IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Receba suporte de um agente de IA que gera conteúdo, analisa tendências e otimiza suas vendas automaticamente.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-slate-800 text-white">
            <CardHeader>
              <CardTitle>Status do Afiliado</CardTitle>
              <CardDescription className="text-slate-400">Informações gerais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-green-400">{affiliate.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Comissão Base:</span>
                  <span className="font-bold text-blue-400">{affiliate.commissionPercentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white">
            <CardHeader>
              <CardTitle>Ganhos</CardTitle>
              <CardDescription className="text-slate-400">Resumo financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Acumulado:</span>
                  <span className="font-bold text-green-400">R$ {affiliate.totalCommissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pendentes:</span>
                  <span className="font-bold text-amber-400">R$ {affiliate.pendingCommissions}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="border-0 shadow-lg bg-slate-800 text-white mb-8">
          <CardHeader>
            <CardTitle>Por que se juntar a nós?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-600">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Comissões Competitivas</h3>
                  <p className="text-sm text-slate-400 mt-1">Ganhe até 15% em comissões diretas e indiretas</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-600">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Agente IA Dedicado</h3>
                  <p className="text-sm text-slate-400 mt-1">Seu próprio agente de IA para gerar conteúdo e vendas</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-600">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Rede Ilimitada</h3>
                  <p className="text-sm text-slate-400 mt-1">Indique quantas pessoas quiser e ganhe em múltiplos níveis</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-600">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Suporte Completo</h3>
                  <p className="text-sm text-slate-400 mt-1">Acesso a materiais de marketing e análise de performance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle>Pronto para começar?</CardTitle>
            <CardDescription className="text-indigo-100">
              Junte-se à rede de afiliados e comece a ganhar comissões hoje mesmo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="gap-2 bg-white text-indigo-600 hover:bg-slate-100">
              Registrar como Afiliado <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
