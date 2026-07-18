import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, UserCircle2, ShieldCheck, Lock, Save, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { user } = useAuth();
  const meQuery = (trpc as any).profile?.getMe?.useQuery?.(undefined, { retry: false }) ?? { data: null, isLoading: false, refetch: () => {} };
  const updateMutation = (trpc as any).profile?.updateProfile?.useMutation?.({
    onSuccess: () => {
      toast.success("Dados atualizados com sucesso");
      meQuery.refetch?.();
    },
    onError: (e: any) => toast.error(e?.message || "Falha ao atualizar dados"),
  }) ?? { isPending: false, mutate: () => {} };

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const src = meQuery.data || user || {};
    setName(String((src as any).name || ""));
    setCpf(String((src as any).cpf || ""));
    setPhone(String((src as any).phone || ""));
  }, [meQuery.data, user]);

  const email = String((meQuery.data as any)?.email || (user as any)?.email || "");

  const submit = () => {
    updateMutation.mutate({ name: name.trim(), cpf: cpf.trim() || null, phone: phone.trim() || null });
  };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/20">
          <div className="space-y-3">
            <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Conta Nexus</Badge>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Configurações da conta</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Atualize seus dados cadastrais. O e-mail permanece <strong>fixo e oficial</strong> — vinculado à sua conta e ao seu ID Indicador.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserCircle2 className="h-5 w-5 text-quantum-cyan" /> Perfil editável
              </CardTitle>
              <CardDescription className="text-slate-400">
                Nome, CPF e telefone podem ser ajustados a qualquer momento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-slate-400">Nome</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-quantum-cyan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-slate-400 flex items-center gap-2">
                  E-mail oficial <Lock className="h-3.5 w-3.5" />
                </label>
                <div className="flex items-center gap-2">
                  <input
                    className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-slate-400"
                    value={email}
                    readOnly
                    disabled
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={copyEmail}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[11px] leading-5 text-slate-500">
                  Este é o e-mail vinculado permanentemente à sua conta Nexus. Ele não pode ser alterado pelo usuário.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-slate-400">CPF</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-quantum-cyan"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="Somente números"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Telefone</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-quantum-cyan"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(DDD) 9 9999-9999"
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={submit}
                disabled={updateMutation.isPending || meQuery.isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-quantum-lime" /> Segurança e identidade
              </CardTitle>
              <CardDescription className="text-slate-400">
                Regras de conta e integridade dos dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 leading-6">
                <p>• O e-mail cadastrado é <strong>imutável</strong> e serve como identidade oficial e canônica.</p>
                <p className="mt-2">• Alterações de nome, CPF e telefone são registradas com carimbo de data em <code>updatedAt</code>.</p>
                <p className="mt-2">• Solicitações de troca de e-mail devem ser feitas via suporte administrativo com validação humana.</p>
                <p className="mt-2">• O acesso administrativo permanece separado do painel do afiliado.</p>
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
