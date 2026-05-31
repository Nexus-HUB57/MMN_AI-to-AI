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
  Eye,
  ExternalLink,
  Link2,
  MousePointer,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TrackingLinkEntry {
  id: string;
  name: string;
  destinationUrl: string;
  shortCode: string;
  campaign?: string;
  medium?: string;
  clicks: number;
  conversions: number;
  createdAt: string;
}

const MEDIUM_PALETTE: Record<string, string> = {
  social: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  email: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  affiliate: "border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime",
  influencer: "border-quantum-purple/30 bg-quantum-purple/10 text-quantum-purple",
};

function buildShortCode(prefix: string) {
  const part = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${part}`;
}

export default function TrackingLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState<TrackingLinkEntry[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [campaign, setCampaign] = useState("");
  const [medium, setMedium] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const referralPrefix = useMemo(() => {
    const raw = (user?.id || "").toString().replace(/[^A-Za-z0-9]/g, "");
    return raw ? raw.substring(0, 4).toUpperCase() : "NX";
  }, [user?.id]);

  const totals = useMemo(() => {
    const totalClicks = links.reduce((acc, link) => acc + link.clicks, 0);
    const totalConversions = links.reduce((acc, link) => acc + link.conversions, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    return { totalClicks, totalConversions, conversionRate };
  }, [links]);

  const handleCreate = () => {
    if (!name.trim() || !destinationUrl.trim()) return;

    const entry: TrackingLinkEntry = {
      id: `${Date.now()}`,
      name: name.trim(),
      destinationUrl: destinationUrl.trim(),
      shortCode: buildShortCode(`${referralPrefix}-`),
      campaign: campaign.trim() || undefined,
      medium: medium.trim() || undefined,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };

    setLinks((current) => [entry, ...current]);
    setName("");
    setDestinationUrl("");
    setCampaign("");
    setMedium("");
    setShowCreate(false);
  };

  const handleCopy = async (link: TrackingLinkEntry) => {
    const url = `${typeof window === "undefined" ? "" : window.location.origin}/r/${link.shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* noop */
    }
  };

  const handleDelete = (id: string) => {
    setLinks((current) => current.filter((link) => link.id !== id));
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
                  Operação comercial Nexus
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                Crie links que sua rede consegue acompanhar
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Gere links exclusivos para campanhas, identifique a origem dos cliques e mantenha um controle simples de conversões dentro do mesmo painel comercial.
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
              <CardTitle className="text-white">Novo link de rastreamento</CardTitle>
              <CardDescription className="text-slate-300">
                Defina o nome, o destino e, opcionalmente, a campanha e o canal de distribuição.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="trk-name">Nome do link</Label>
                  <Input
                    id="trk-name"
                    placeholder="Ex: Campanha verão"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trk-url">URL de destino</Label>
                  <Input
                    id="trk-url"
                    placeholder="https://oneverso.com.br/afiliado/SEU-ID"
                    value={destinationUrl}
                    onChange={(event) => setDestinationUrl(event.target.value)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trk-campaign">Campanha (opcional)</Label>
                  <Input
                    id="trk-campaign"
                    placeholder="Ex: lancamento_pack_a2"
                    value={campaign}
                    onChange={(event) => setCampaign(event.target.value)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trk-medium">Canal (opcional)</Label>
                  <Input
                    id="trk-medium"
                    placeholder="social, email, affiliate, influencer"
                    value={medium}
                    onChange={(event) => setMedium(event.target.value)}
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="gradient-btn" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar link
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Links criados" value={links.length} icon={Link2} accent="text-quantum-cyan" />
          <KpiCard label="Total de cliques" value={totals.totalClicks} icon={Eye} accent="text-quantum-lime" />
          <KpiCard label="Conversões" value={totals.totalConversions} icon={MousePointer} accent="text-quantum-purple" />
          <KpiCard label="Taxa de conversão" value={`${totals.conversionRate.toFixed(2)}%`} icon={TrendingUp} accent="text-amber-300" />
        </section>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-quantum-cyan" />
              Seus links de rastreamento
            </CardTitle>
            <CardDescription className="text-slate-400">
              Os links ficam armazenados nesta sessão para uso operacional imediato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-slate-400">
                <Link2 className="h-10 w-10 opacity-30" />
                <p className="text-sm leading-6">
                  Você ainda não criou nenhum link. Clique em <strong className="text-white">Criar link</strong> para começar a rastrear suas campanhas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => {
                  const fullUrl = `${typeof window === "undefined" ? "" : window.location.origin}/r/${link.shortCode}`;
                  const mediumClass = link.medium ? MEDIUM_PALETTE[link.medium] ?? "border-white/10 bg-white/5 text-slate-200" : null;
                  return (
                    <div key={link.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-white">{link.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{link.destinationUrl}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge className="border border-white/10 bg-white/5 font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                              /r/{link.shortCode}
                            </Badge>
                            {link.campaign && (
                              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                                {link.campaign}
                              </Badge>
                            )}
                            {link.medium && mediumClass && (
                              <Badge className={`border ${mediumClass}`}>
                                {link.medium}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => handleCopy(link)}
                          >
                            {copiedId === link.id ? <CheckCircle2 className="mr-2 h-4 w-4 text-quantum-lime" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copiar link
                          </Button>
                          <a href={fullUrl} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Abrir
                            </Button>
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20"
                            onClick={() => handleDelete(link.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <Stat label="Cliques" value={link.clicks} />
                        <Stat label="Conversões" value={link.conversions} />
                        <Stat
                          label="Conversão"
                          value={`${link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(2) : "0.00"}%`}
                        />
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

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: string;
}) {
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
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
