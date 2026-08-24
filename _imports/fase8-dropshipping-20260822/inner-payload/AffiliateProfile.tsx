import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function AffiliateProfile() {
  const { user } = useAuth();
  const { data: profile } = trpc.mmn.getProfile.useQuery();
  const [copied, setCopied] = useState(false);

  const affiliateUrl = `${window.location.origin}/affiliate/${profile?.affiliateCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Meu Perfil de Afiliado</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Seus dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600">Nome</Label>
                <p className="text-lg font-medium text-slate-900">{user?.name}</p>
              </div>
              <div>
                <Label className="text-slate-600">Email</Label>
                <p className="text-lg font-medium text-slate-900">{user?.email}</p>
              </div>
              <div>
                <Label className="text-slate-600">Perfil</Label>
                <p className="text-lg font-medium text-slate-900 capitalize">{user?.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dados de Afiliado */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Dados de Afiliado</CardTitle>
              <CardDescription>Informações da rede</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-lg font-medium text-slate-900 capitalize">{profile?.status}</p>
                </div>
              </div>
              <div>
                <Label className="text-slate-600">Comissão Padrão</Label>
                <p className="text-lg font-medium text-slate-900">{profile?.commissionPercentage}%</p>
              </div>
              <div>
                <Label className="text-slate-600">Indicados Diretos</Label>
                <p className="text-lg font-medium text-slate-900">{profile?.directReferrals}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link de Indicação */}
        <Card className="border-0 shadow-sm mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle>Seu Link de Indicação</CardTitle>
            <CardDescription>Compartilhe este link para indicar novas pessoas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={affiliateUrl}
                readOnly
                className="bg-white"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Seu código único: <span className="font-mono font-bold text-slate-900">{profile?.affiliateCode}</span>
            </p>
          </CardContent>
        </Card>

        {/* Ganhos e Comissões */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Ganhos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">R$ {profile?.totalEarnings}</p>
              <p className="text-sm text-slate-600 mt-2">Valor total acumulado</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Comissões Acumuladas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">R$ {profile?.totalCommissions}</p>
              <p className="text-sm text-slate-600 mt-2">Comissões de rede</p>
            </CardContent>
          </Card>
        </div>

        {/* Rede Total */}
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle>Tamanho da Rede</CardTitle>
            <CardDescription>Total de pessoas em sua rede (diretos e indiretos)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-indigo-600">{profile?.totalNetworkSize}</p>
            <p className="text-sm text-slate-600 mt-2">Pessoas na sua rede multinível</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
