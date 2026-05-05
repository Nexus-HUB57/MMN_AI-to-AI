import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Star, Users, TrendingUp, ArrowRight } from "lucide-react";

export default function MiniSite() {
  const { code } = useParams<{ code: string }>();
  const { data: affiliate, isLoading } = trpc.mmn.getAffiliateByCode.useQuery({ code: code || "" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-slate-600">Afiliado não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Bem-vindo ao Programa de Afiliados</h1>
          <p className="text-xl text-blue-100 mb-8">
            Ganhe comissões promovendo produtos de alta demanda
          </p>
          <Button size="lg" variant="secondary" className="gap-2">
            Começar Agora <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Affiliate Info */}
        <Card className="border-0 shadow-sm mb-8 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Seu Patrocinador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-slate-900">Afiliado #{affiliate.id}</p>
                <p className="text-sm text-slate-600">Código: {affiliate.affiliateCode}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">R$ {affiliate.totalEarnings}</p>
                <p className="text-sm text-slate-600">Ganhos totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Comissões Altas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Ganhe até {affiliate.commissionPercentage}% de comissão em cada venda realizada através do seu link.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-green-600" />
                Rede Multinível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Indique outras pessoas e ganhe comissões de toda a sua rede de indicados.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-yellow-600" />
                Suporte Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Receba suporte, materiais de marketing e agente IA para potencializar suas vendas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Rede do Patrocinador</CardTitle>
              <CardDescription>Pessoas indicadas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{affiliate.directReferrals}</p>
              <p className="text-sm text-slate-600 mt-2">Indicados diretos</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tamanho da Rede</CardTitle>
              <CardDescription>Total na rede</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-indigo-600">{affiliate.totalNetworkSize}</p>
              <p className="text-sm text-slate-600 mt-2">Pessoas na rede completa</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle>Pronto para começar?</CardTitle>
            <CardDescription>
              Junte-se à rede de afiliados e comece a ganhar comissões hoje mesmo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="gap-2">
              Registrar como Afiliado <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
