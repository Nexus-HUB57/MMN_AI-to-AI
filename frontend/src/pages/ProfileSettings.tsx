import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, UserCircle2, ShieldCheck, Link2, Copy, Check, Share2 } from "lucide-react";

export default function ProfileSettings() {
  const { user } = useAuth();
  const referralQuery = trpc.users.getReferral.useQuery(undefined, {
    retry: false,
    enabled: true,
  });
  const [copiedField, setCopiedField] = useState<"code" | "url" | null>(null);

  // Fallback estável caso o endpoint ainda não esteja propagado
  const fallbackCode = (() => {
    if (!user) return "";
    const raw = (user as any).id ?? (user as any).email ?? "";
    if (typeof raw === "number") {
      return "NX" + Number(raw).toString(36).toUpperCase().padStart(5, "0");
    }
    const slug = String(raw).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
    return slug ? "NX" + slug : "";
  })();

  const code = referralQuery.data?.code || fallbackCode;
  const refUrl =
    referralQuery.data?.url ||
    (code ? `https://oneverso.com.br/cadastro?ref=${code}` : "");

  const copy = async (value: string, kind: "code" | "url") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(kind);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/20">
          <div className="space-y-3">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Conta Nexus</Badge>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Configurações da conta</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Centralize seus dados cadastrais, segurança operacional, ID Indicador único e preferências do ecossistema.
            </p>
          </div>
        </section>

        {/* ID INDICADOR ÚNICO */}
        <Card className="border-quantum-cyan/30 bg-[linear-gradient(180deg,rgba(0,229,255,0.06),rgba(2,6,23,0.65))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Link2 className="h-5 w-5 text-quantum-cyan" /> ID Indicador único
            </CardTitle>
            <CardDescription className="text-slate-400">
              Este é o seu identificador exclusivo para indicar novos afiliados. Cada indicação trazida por este link
              será posicionada na sua Rede Binária <strong>N.O</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Seu código</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-2xl font-bold text-quantum-cyan">{code || "—"}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => code && copy(code, "code")}
                    disabled={!code}
                  >
                    {copiedField === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Link de indicação</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="truncate text-sm text-slate-200">{refUrl || "—"}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => refUrl && copy(refUrl, "url")}
                    disabled={!refUrl}
                  >
                    {copiedField === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-xs leading-6 text-slate-400">
              <p>
                <Share2 className="mr-1 inline h-3.5 w-3.5 text-quantum-cyan" />
                Compartilhe este link nas redes sociais, WhatsApp e mini-site para trazer novos afiliados e construir
                sua Rede Binária <strong>N.O</strong>. O ID é único e está vinculado permanentemente à sua conta.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><UserCircle2 className="h-5 w-5 text-quantum-cyan" /> Perfil</CardTitle>
              <CardDescription className="text-slate-400">Dados ativos na sessão atual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p><strong className="text-white">Nome:</strong> {(user as any)?.name ?? "Não informado"}</p>
                <p className="mt-2"><strong className="text-white">E-mail:</strong> {(user as any)?.email ?? "Não informado"}</p>
                <p className="mt-2"><strong className="text-white">Perfil:</strong> {(user as any)?.role ?? "affiliate"}</p>
              </div>
              <Button className="w-full">Atualizar dados da conta</Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><ShieldCheck className="h-5 w-5 text-quantum-lime" /> Segurança</CardTitle>
              <CardDescription className="text-slate-400">Controles básicos do acesso operacional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p>• Sessão autenticada e protegida pelo runtime atual.</p>
                <p className="mt-2">• Login social permanece vinculado ao painel do afiliado.</p>
                <p className="mt-2">• O backoffice administrativo continua restrito.</p>
              </div>
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" /> Ajustar preferências
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
