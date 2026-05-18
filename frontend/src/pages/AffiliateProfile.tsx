import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Copy, CheckCircle, Users, Wallet, Network } from "lucide-react";
import { useState } from "react";

interface AffiliateProfileData {
  id: number;
  userId: number;
  affiliateCode: string;
  sponsorId: number | null;
  commissionPercentage: number;
  status: "active" | "inactive" | "suspended";
  totalCommissions: number;
  pendingCommissions: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AffiliateProfile() {
  const { user } = useAuth();
  const { data: profile } = trpc.mmn.getProfile.useQuery(undefined, {
    enabled: !!user,
    select: (data): AffiliateProfileData | null => {
      if (!data) return null;
      return {
        id: data.id,
        userId: data.userId,
        affiliateCode: data.affiliateCode,
        sponsorId: data.sponsorId ?? null,
        commissionPercentage: data.commissionPercentage,
        status: data.status,
        totalCommissions: data.totalCommissions ?? 0,
        pendingCommissions: data.pendingCommissions ?? 0,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      };
    },
  });

  const { data: stats } = trpc.mmn.getStats.useQuery(
    { affiliateId: profile?.id ?? 0 },
    { enabled: !!profile?.id }
  );

  const { data: directReferrals } = trpc.mmn.getDirectReferrals.useQuery(
    { userId: profile?.userId ?? 0 },
    { enabled: !!profile?.userId }
  );

  const [copied, setCopied] = useState(false);

  const affiliateUrl = `${window.location.origin}/afiliado/${profile?.affiliateCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8">
            <p className="text-slate-600">Carregando perfil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <p className="text-lg font-medium text-slate-900">{user?.name ?? "Não informado"}</p>
              </div>
              <div>
                <Label className="text-slate-600">Email</Label>
                <p className="text-lg font-medium text-slate-900">{user?.email ?? "Não informado"}</p>
              </div>
              <div>
                <Label className="text-slate-600">Perfil</Label>
                <p className="text-lg font-medium text-slate-900 capitalize">{user?.role ?? "user"}</p>
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
                  <p className="text-lg font-medium text-slate-900 capitalize">{profile.status}</p>
                </div>
              </div>
              <div>
                <Label className="text-slate-600">Comissão Padrão</Label>
                <p className="text-lg font-medium text-slate-900">{profile.commissionPercentage}%</p>
              </div>
              <div>
                <Label className="text-slate-600">Indicados Diretos</Label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <p className="text-lg font-medium text-slate-900">{directReferrals?.length ?? 0}</p>
                </div>
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
              Seu código único: <span className="font-mono font-bold text-slate-900">{profile.affiliateCode}</span>
            </p>
          </CardContent>
        </Card>

        {/* Ganhos e Comissões */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" />
                Ganhos Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">R$ {(profile.totalCommissions / 100).toFixed(2)}</p>
              <p className="text-sm text-slate-600 mt-2">Valor total acumulado</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Comissões Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">R$ {(profile.pendingCommissions / 100).toFixed(2)}</p>
              <p className="text-sm text-slate-600 mt-2">Comissões aguardando confirmação</p>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" />
              Resumo Financeiro
            </CardTitle>
            <CardDescription>Visão geral dos seus ganhos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-slate-900">{directReferrals?.length ?? 0}</p>
                <p className="text-sm text-slate-600 mt-1">Diretos</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">R$ {(profile.totalCommissions / 100).toFixed(2)}</p>
                <p className="text-sm text-slate-600 mt-1">Total Ganho</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">R$ {(profile.pendingCommissions / 100).toFixed(2)}</p>
                <p className="text-sm text-slate-600 mt-1">Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
