import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  Facebook,
  Instagram,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Smartphone,
  Trash2,
  Twitter,
  XCircle,
} from "lucide-react";

type PlatformKey = "whatsapp" | "instagram" | "facebook" | "telegram" | "twitter";
type AccountStatus = "active" | "inactive" | "expired" | "error";

type SocialAccountRow = {
  id: number;
  platform: PlatformKey;
  accountId: string | null;
  accountName: string | null;
  status: AccountStatus;
  createdAt: string | Date;
};

const PLATFORM_META: Record<PlatformKey, { label: string; icon: React.ElementType; accent: string }> = {
  whatsapp: { label: "WhatsApp", icon: Smartphone, accent: "text-quantum-lime" },
  instagram: { label: "Instagram", icon: Instagram, accent: "text-fuchsia-300" },
  facebook: { label: "Facebook", icon: Facebook, accent: "text-sky-300" },
  telegram: { label: "Telegram", icon: Send, accent: "text-quantum-cyan" },
  twitter: { label: "X / Twitter", icon: Twitter, accent: "text-slate-200" },
};

const STATUS_META: Record<AccountStatus, { label: string; className: string; icon: React.ElementType }> = {
  active: { label: "Ativa", className: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime", icon: CheckCircle2 },
  inactive: { label: "Inativa", className: "border-white/10 bg-white/5 text-slate-300", icon: XCircle },
  expired: { label: "Expirada", className: "border-amber-400/30 bg-amber-400/10 text-amber-200", icon: RefreshCw },
  error: { label: "Erro", className: "border-rose-400/30 bg-rose-400/10 text-rose-200", icon: XCircle },
};

export default function SocialAccounts() {
  const [showAdd, setShowAdd] = useState(false);
  const [platform, setPlatform] = useState<PlatformKey>("whatsapp");
  const [accountName, setAccountName] = useState("");

  const { data: accounts = [], isLoading, refetch } = trpc.social.listSocialAccounts.useQuery();

  const addMutation = trpc.social.addSocialAccount.useMutation({
    onSuccess: async () => {
      toast.success("Conta social adicionada.");
      setAccountName("");
      setShowAdd(false);
      await refetch();
    },
    onError: (error) => toast.error(error.message || "Não foi possível adicionar a conta."),
  });

  const updateMutation = trpc.social.updateSocialAccountStatus.useMutation({
    onSuccess: async () => {
      await refetch();
    },
    onError: (error) => toast.error(error.message || "Não foi possível atualizar a conta."),
  });

  const removeMutation = trpc.social.removeSocialAccount.useMutation({
    onSuccess: async () => {
      toast.success("Conta removida.");
      await refetch();
    },
    onError: (error) => toast.error(error.message || "Não foi possível remover a conta."),
  });

  const typedAccounts = accounts as SocialAccountRow[];

  const totals = useMemo(() => {
    const counts: Record<AccountStatus, number> = { active: 0, inactive: 0, expired: 0, error: 0 };
    typedAccounts.forEach((account) => {
      counts[account.status] += 1;
    });
    return counts;
  }, [typedAccounts]);

  const handleAdd = async () => {
    if (!accountName.trim()) {
      toast.error("Informe o identificador da conta.");
      return;
    }

    await addMutation.mutateAsync({
      platform,
      accountName: accountName.trim(),
      accountId: accountName.trim(),
    });
  };

  const toggleStatus = async (account: SocialAccountRow) => {
    const nextStatus: AccountStatus = account.status === "active" ? "inactive" : "active";
    await updateMutation.mutateAsync({ accountId: account.id, status: nextStatus });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Contas sociais</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">Persistência real via tRPC</Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Centralize seus canais de relacionamento</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Cadastre as contas utilizadas pelo seu agente e mantenha status, operação e disponibilidade visíveis para toda a equipe.
              </p>
            </div>
            <Button className="gradient-btn" onClick={() => setShowAdd((current) => !current)}>
              <Plus className="mr-2 h-4 w-4" />
              {showAdd ? "Cancelar" : "Adicionar conta"}
            </Button>
          </div>
        </section>

        {showAdd && (
          <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Nova conta social</CardTitle>
              <CardDescription className="text-slate-300">
                Informe a plataforma e o identificador operacional da conta usada pelo seu agente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Plataforma</Label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(PLATFORM_META) as PlatformKey[]).map((key) => {
                      const meta = PLATFORM_META[key];
                      const Icon = meta.icon;
                      const isActive = platform === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPlatform(key)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                            isActive
                              ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${meta.accent}`} />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="social-account-name">Identificador / nome</Label>
                  <Input id="social-account-name" placeholder="Ex: @minha.conta ou +55..." value={accountName} onChange={(event) => setAccountName(event.target.value)} className="border-white/10 bg-white/5 text-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="gradient-btn" onClick={handleAdd} disabled={addMutation.isPending}>
                  {addMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Adicionar conta
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setShowAdd(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Ativas" value={totals.active} accent="text-quantum-lime" />
          <KpiCard label="Inativas" value={totals.inactive} accent="text-slate-300" />
          <KpiCard label="Expiradas" value={totals.expired} accent="text-amber-300" />
          <KpiCard label="Com erro" value={totals.error} accent="text-rose-300" />
        </section>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Contas persistidas</CardTitle>
            <CardDescription className="text-slate-400">
              A lista abaixo é carregada do backend e permanece disponível entre sessões autenticadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : typedAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-slate-400">
                <Send className="h-10 w-10 opacity-30" />
                <p className="text-sm leading-6">
                  Nenhuma conta cadastrada ainda. Clique em <strong className="text-white">Adicionar conta</strong> para começar.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {typedAccounts.map((account) => {
                  const meta = PLATFORM_META[account.platform];
                  const status = STATUS_META[account.status];
                  const Icon = meta.icon;
                  const StatusIcon = status.icon;
                  return (
                    <div key={account.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${meta.accent}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{meta.label}</p>
                            <p className="text-xs text-slate-400">{account.accountName || account.accountId || "Sem identificador"}</p>
                          </div>
                        </div>
                        <Badge className={`inline-flex items-center gap-1 border ${status.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={updateMutation.isPending} onClick={() => toggleStatus(account)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {account.status === "active" ? "Pausar conta" : "Reativar conta"}
                        </Button>
                        <Button variant="outline" size="sm" className="border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate({ accountId: account.id })}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
        <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
