import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MousePointer,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type TrackingLinkRow = {
  id: string;
  shortCode: string | null;
  destinationUrl: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  clickCount: number;
  conversionCount: number;
  totalRevenue: number;
  createdAt: string | Date;
};

const MEDIUM_PALETTE: Record<string, string> = {
  social: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  email: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  affiliate: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
  influencer: "border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple",
  whatsapp: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  instagram: "border-pink-400/30 bg-pink-400/10 text-pink-200",
};

function currencyFromCents(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((value || 0) / 100);
}

export default function TrackingLinks() {
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: trackingLinks = [], isLoading, refetch } = trpc.social.listTrackingLinks.useQuery({ limit: 50 });
  const { data: performance } = trpc.social.getPerformance.useQuery({ period: "monthly", days: 30 });

  const createMutation = trpc.social.createTrackingLink.useMutation({
    onSuccess: async () => {
      toast.success("Link criado com sucesso.");
      setLabel("");
      setDestinationUrl("");
      setSource("");
      setMedium("");
      setShowCreate(false);
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível criar o link.");
    },
  });

  const deleteMutation = trpc.social.deleteTrackingLink.useMutation({
    onSuccess: async () => {
      toast.success("Link removido.");
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível remover o link.");
    },
  });

  const links = useMemo(() => {
    return (trackingLinks as TrackingLinkRow[]).map((link) => ({
      ...link,
      displayName: link.campaign || link.source || `Link ${link.shortCode || link.id.slice(-6)}`,
      clicks: Number(link.clickCount || 0),
      conversions: Number(link.conversionCount || 0),
      revenue: Number(link.totalRevenue || 0),
    }));
  }, [trackingLinks]);

  const totals = useMemo(() => {
    const totalClicks = links.reduce((acc, link) => acc + link.clicks, 0);
    const totalConversions = links.reduce((acc, link) => acc + link.conversions, 0);
    const totalRevenue = links.reduce((acc, link) => acc + link.revenue, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    return { totalClicks, totalConversions, totalRevenue, conversionRate };
  }, [links]);

  const handleCreate = async () => {
    if (!label.trim() || !destinationUrl.trim()) {
      toast.error("Preencha o nome do link e a URL de destino.");
      return;
    }

    await createMutation.mutateAsync({
      linkType: "promo",
      destinationUrl: destinationUrl.trim(),
      campaign: label.trim(),
      source: source.trim() || undefined,
      medium: medium.trim() || undefined,
    });
  };

  const handleCopy = async (shortCode: string | null, id: string) => {
    const path = shortCode ? `/r/${shortCode}` : `/tracking/${id}`;
    const url = `${typeof window === "undefined" ? "" : window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  Rastreamento de Links
                </Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">
                  Persistência real via tRPC
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                Links persistentes para medir campanhas e conversões
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Cadastre links rastreáveis, acompanhe cliques e mantenha a operação comercial centralizada no painel Nexus.
              </p>
            </div>
            <Button className="gradient-btn" onClick={() => setShowCreate((current) => !current)}>
              <Plus className="mr-2 h-4 w-4" />
              {showCreate ? "Cancelar" : "Criar link"}
            </Button>
          </div>
        </section>

        {showCreate && (
          <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Novo link rastreável</CardTitle>
              <CardDescription className="text-slate-300">
                O nome interno é salvo como campanha e pode ser usado para identificar peças, páginas e fontes de tráfego.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="trk-label">Nome interno / campanha</Label>
                  <Input id="trk-label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ex: Lançamento Pack A²" className="border-white/10 bg-white/5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trk-url">URL de destino</Label>
                  <Input id="trk-url" value={destinationUrl} onChange={(event) => setDestinationUrl(event.target.value)} placeholder="https://oneverso.com.br/marketplaces" className="border-white/10 bg-white/5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trk-source">Origem</Label>
                  <Input id="trk-source" value={source} onChange={(event) => setSource(event.target.value)} placeholder="instagram, whatsapp, afiliado" className="border-white/10 bg-white/5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trk-medium">Canal / medium</Label>
                  <Input id="trk-medium" value={medium} onChange={(event) => setMedium(event.target.value)} placeholder="social, email, influencer" className="border-white/10 bg-white/5 text-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="gradient-btn" onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Salvar link
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Links ativos" value={links.length} icon={Link2} accent="text-quantum-cyan" />
          <KpiCard label="Cliques em 30 dias" value={totals.totalClicks} icon={MousePointer} accent="text-quantum-lime" />
          <KpiCard label="Conversões" value={totals.totalConversions} icon={Sparkles} accent="text-quantum-purple" />
          <KpiCard label="Taxa média" value={`${totals.conversionRate.toFixed(2)}%`} icon={TrendingUp} accent="text-amber-300" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-quantum-cyan" />
                Seus links persistidos
              </CardTitle>
              <CardDescription className="text-slate-400">
                Dados carregados do backend e prontos para continuidade entre sessões.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-slate-400">
                  <Link2 className="h-10 w-10 opacity-30" />
                  <p className="text-sm leading-6">
                    Você ainda não criou nenhum link persistente. Clique em <strong className="text-white">Criar link</strong> para começar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => {
                    const fullUrl = `${typeof window === "undefined" ? "" : window.location.origin}/r/${link.shortCode || link.id}`;
                    const mediumClass = link.medium ? MEDIUM_PALETTE[link.medium] ?? "border-white/10 bg-white/5 text-slate-200" : null;
                    return (
                      <div key={link.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-white">{link.displayName}</p>
                            <p className="mt-1 text-xs text-slate-400 break-all">{link.destinationUrl}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Badge className="border border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                                /r/{link.shortCode || link.id.slice(-6)}
                              </Badge>
                              {link.source && (
                                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                                  {link.source}
                                </Badge>
                              )}
                              {link.medium && mediumClass && <Badge className={`border ${mediumClass}`}>{link.medium}</Badge>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => handleCopy(link.shortCode, link.id)}>
                              {copiedId === link.id ? <CheckCircle2 className="mr-2 h-4 w-4 text-quantum-lime" /> : <Copy className="mr-2 h-4 w-4" />}
                              Copiar
                            </Button>
                            <a href={fullUrl} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Abrir
                              </Button>
                            </a>
                            <Button variant="outline" size="sm" className="border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate({ linkId: link.id })}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-4">
                          <Stat label="Cliques" value={link.clicks} />
                          <Stat label="Conversões" value={link.conversions} />
                          <Stat label="Taxa" value={`${link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(2) : "0.00"}%`} />
                          <Stat label="Receita" value={currencyFromCents(link.revenue)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Resumo operacional</CardTitle>
              <CardDescription className="text-slate-400">
                Indicadores agregados do backend social para os últimos 30 dias.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Cliques únicos</p>
                <p className="mt-2 text-2xl font-bold text-white">{Number(performance?.uniqueClicks || 0).toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Canal dominante</p>
                <p className="mt-2 text-2xl font-bold text-white">{performance?.topChannel || "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Eventos</p>
                <p className="mt-2 text-2xl font-bold text-white">{Number(performance?.eventsCount || 0).toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-4 text-sm leading-6 text-slate-300">
                Use <strong className="text-white">origem</strong> para identificar o canal principal e <strong className="text-white">medium</strong> para o formato da ação. Isso facilita a leitura do funil comercial depois.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: React.ElementType; accent: string }) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${accent}`} />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-white break-all">{value}</p>
    </div>
  );
}
