import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Copy, CheckCircle, Users } from "lucide-react";
import { useMemo, useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const { data: rawProfile } = trpc.mmn.getProfile.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: stats } = trpc.mmn.getStats.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: directReferrals } = trpc.mmn.getDirectReferrals.useQuery(
    undefined,
    {
      enabled: !!user,
    },
  );

  const profile = useMemo<AffiliateProfileData | null>(() => {
    if (!rawProfile) return null;
    return {
      id: rawProfile.id,
      userId: rawProfile.userId,
      affiliateCode: rawProfile.affiliateCode,
      sponsorId: rawProfile.sponsorId ?? null,
      commissionPercentage: rawProfile.commissionPercentage,
      status: rawProfile.status,
      totalCommissions: stats?.total ?? rawProfile.totalCommissions ?? 0,
      pendingCommissions: stats?.pending ?? rawProfile.pendingCommissions ?? 0,
      createdAt: rawProfile.createdAt
        ? new Date(rawProfile.createdAt)
        : new Date(),
      updatedAt: rawProfile.updatedAt
        ? new Date(rawProfile.updatedAt)
        : new Date(),
    };
  }, [rawProfile, stats]);

  const affiliateUrl = `${window.location.origin}/afiliado/${profile?.affiliateCode ?? ""}`;

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
        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          Meu Perfil de Afiliado
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Seus dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600">Nome</Label>
                <p className="text-lg font-medium text-slate-900">
                  {user?.name ?? "Não informado"}
                </p>
              </div>
              <div>
                <Label className="text-slate-600">Email</Label>
                <p className="text-lg font-medium text-slate-900">
                  {user?.email ?? "Não informado"}
                </p>
              </div>
              <div>
                <Label className="text-slate-600">Perfil</Label>
                <p className="text-lg font-medium text-slate-900 capitalize">
                  {user?.role ?? "user"}
                </p>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-lg font-medium text-slate-900 capitalize">
                    {profile.status}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-slate-600">Comissão Padrão</Label>
                <p className="text-lg font-medium text-slate-900">
                  {profile.commissionPercentage}%
                </p>
              </div>
              <div>
                <Label className="text-slate-600">Indicados Diretos</Label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <p className="text-lg font-medium text-slate-900">
                    {directReferrals?.length ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle>Seu Link de Indicação</CardTitle>
            <CardDescription>
              Compartilhe este link para indicar novas pessoas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={affiliateUrl} readOnly className="bg-white" />
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Comissões Totais</p>
              <p className="text-3xl font-bold text-green-700">
                R$ {profile.totalCommissions}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Comissões Pendentes</p>
              <p className="text-3xl font-bold text-yellow-700">
                R$ {profile.pendingCommissions}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">
                Disponível para Operação
              </p>
              <p className="text-3xl font-bold text-blue-700">
                R${" "}
                {Math.max(
                  profile.totalCommissions - profile.pendingCommissions,
                  0,
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
