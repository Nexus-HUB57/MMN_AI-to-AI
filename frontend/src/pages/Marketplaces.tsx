import { Link } from "wouter";
import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import {
  EXTERNAL_MARKETPLACES,
  NEXUS_PACKS,
  formatCurrency,
  getLevelLabel,
  getLevelSubtitle,
  getOperationalInventory,
  getPackAccess,
  getProgressSnapshot,
  getUnlockedEbookBundles,
  getUnlockedSkillBundles,
} from "@/lib/nexus-marketplace";
import { buildMarketplaceCheckoutUrl } from "@/lib/marketplace-payments";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Flame,
  Lock,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

const MARKETPLACE_ICONS = { ShoppingBag, Flame, ShoppingCart, Tag } as Record<string, typeof ShoppingBag>;

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "lime" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full transition-all duration-500 ${tone === "lime" ? "bg-quantum-lime" : "bg-quantum-cyan"}`}
        style={{ width: `${Math.max(4, value)}%` }}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Trophy;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function Marketplaces() {
  const { profile } = useMarketplaceProfile();
  const progress = getProgressSnapshot(profile);
  const ebookBundles = getUnlockedEbookBundles(profile);
  const skillBundles = getUnlockedSkillBundles(profile);
  const hasOnboardingFlag =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("onboarding") === "1";
  const focusMonthlyActivation =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("focus") === "monthly-activation";

  const packStates = NEXUS_PACKS.map((pack) => ({
    ...pack,
    access: getPackAccess(profile, pack),
  }));

  const availableNow = packStates.filter((pack) => pack.access.status === "available");
  const lockedCount = packStates.filter((pack) => pack.access.status === "locked").length;
  const activeCount = packStates.filter((pack) => pack.access.status === "active").length;
  const activeEbooks = ebookBundles.filter((bundle) => bundle.status === "active").length;
  const activeSkills = skillBundles.filter((bundle) => bundle.status === "active").length;
  const stockItems = useMemo(() => getOperationalInventory(profile), [profile]);
  const heroPacks = availableNow.slice(0, 3);
  const featuredChannels = EXTERNAL_MARKETPLACES.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(0,229,255,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)] lg:block" />
          <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                  Loja Virtual Nexus Store
                </Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">Checkout com Pix e Mercado Pago</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">Entrega digital imediata</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                  Seu Marketplace agora opera como uma <span className="text-quantum-lime">loja virtual premium</span>.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  Reestruturamos o hub comercial para um formato mais elegante, intuitivo e orientado à conversão: vitrine de packs,
                  biblioteca de e-books, jornadas por nível e atalhos de compra em destaque, inspirado em experiências de venda mais
                  modernas e visuais.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <KpiCard label="packs ativos" value={String(activeCount)} icon={Package} accent="text-quantum-cyan" />
                <KpiCard label="bibliotecas" value={String(activeEbooks)} icon={BookOpen} accent="text-quantum-lime" />
                <KpiCard label="skills liberadas" value={String(activeSkills)} icon={Sparkles} accent="text-quantum-purple" />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/marketplaces/ebooks">
                  <Button className="gradient-btn h-12 px-6 text-sm font-semibold">
                    Explorar loja de e-books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/packs">
                  <Button variant="outline" className="h-12 border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10">
                    Ver packs e planos
                  </Button>
                </Link>
                <Link href="/estoque">
                  <Button variant="outline" className="h-12 border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10">
                    Abrir estoque operacional
                  </Button>
                </Link>
              </div>

              {hasOnboardingFlag && (
                <div className="rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/10 p-4 text-sm text-quantum-cyan">
                  Cadastro concluído. Seu onboarding já entra pela Loja Virtual com o Pack A² como primeira ativação possível.
                </div>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
              <Card className="overflow-hidden border-white/10 bg-white/6 backdrop-blur">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl text-white">Status da conta comercial</CardTitle>
                      <CardDescription className="mt-2 text-slate-300">
                        Visão rápida do seu nível e da próxima meta da loja.
                      </CardDescription>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-quantum-cyan">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">carreira atual</p>
                    <p className="mt-3 text-2xl font-bold text-white">{getLevelLabel(profile.currentLevel)}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{getLevelSubtitle(profile.currentLevel)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">XP atual</p>
                      <p className="mt-2 text-2xl font-bold text-white">{profile.currentXp.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Diretos</p>
                      <p className="mt-2 text-2xl font-bold text-white">{profile.directReferrals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/6 backdrop-blur">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Trophy className="h-4 w-4 text-amber-300" />
                    Próximo desbloqueio
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{progress.nextPack?.name ?? "Todos os packs concluídos"}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {progress.nextPack ? `Meta atual: ${progress.nextPack.shortName}` : "Você já concluiu toda a jornada de packs."}
                    </p>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-quantum-cyan" /> XP</span>
                      <span>
                        {progress.xpCurrent.toLocaleString("pt-BR")} / {progress.xpTarget.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <ProgressBar value={progress.xpProgress} />
                  </div>
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-quantum-lime" /> Diretos</span>
                      <span>
                        {progress.directCurrent} / {progress.directTarget}
                      </span>
                    </div>
                    <ProgressBar value={progress.directProgress} tone="lime" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {[
            {
              title: "Checkout fluido",
              description: "Fluxo visual de compra com Pix e Mercado Pago integrado ao ecossistema de packs e produtos.",
              icon: Wallet,
              accent: "text-quantum-cyan",
            },
            {
              title: "Catálogo elegante",
              description: "Cards maiores, hierarquia visual clara e vitrine mais parecida com loja virtual profissional.",
              icon: Store,
              accent: "text-quantum-lime",
            },
            {
              title: "Entrega instantânea",
              description: "E-books, bibliotecas e upgrades ficam claros para o afiliado e prontos para distribuição.",
              icon: CheckCircle2,
              accent: "text-quantum-purple",
            },
            {
              title: "Crescimento guiado",
              description: "A jornada de carreira permanece visível com metas de XP, critérios e próximos upgrades.",
              icon: Trophy,
              accent: "text-amber-300",
            },
          ].map((item) => (
            <Card key={item.title} className="border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20">
              <CardContent className="space-y-3 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${item.accent}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card
            className={`overflow-hidden border shadow-2xl shadow-black/20 ${
              focusMonthlyActivation
                ? "border-amber-400/40 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))]"
                : "border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))]"
            }`}
          >
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-200">Vitrine de ativação mensal</Badge>
                  <CardTitle className="mt-3 text-2xl text-white md:text-3xl">Produtos liberados para compra agora</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl text-slate-300">
                    Transformamos sua ativação mensal em uma vitrine mais comercial: investimento, benefícios e CTA ficam visíveis na primeira dobra.
                  </CardDescription>
                </div>
                <Link href="/packs">
                  <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                    Ver catálogo completo
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {heroPacks.length > 0 ? (
                heroPacks.map((pack, index) => (
                  <div
                    key={`hero-pack-${pack.slug}`}
                    className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition hover:-translate-y-1 hover:border-white/20"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{pack.shortName}</Badge>
                          {index === 0 && (
                            <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">Mais recomendado</Badge>
                          )}
                          {pack.bringsAgent && (
                            <Badge className="border border-purple-500/30 bg-purple-500/10 text-purple-300">Entrega agente IA</Badge>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{pack.name}</p>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{pack.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {pack.highlights.slice(0, 3).map((highlight) => (
                            <span key={highlight} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-[250px] space-y-4 rounded-[24px] border border-white/10 bg-white/5 p-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">investimento</p>
                          <p className="mt-2 text-4xl font-black text-white">{formatCurrency(pack.priceCents)}</p>
                        </div>
                        <Link
                          href={buildMarketplaceCheckoutUrl({
                            source: "marketplaces",
                            type: "pack",
                            slug: pack.slug,
                            name: pack.name,
                            amountCents: pack.priceCents,
                            description: pack.description,
                          })}
                        >
                          <Button className="gradient-btn h-12 w-full text-sm font-semibold">
                            Comprar agora
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <p className="text-xs leading-5 text-slate-400">Liberação vinculada à sua carreira e ao histórico de ativações já concluídas.</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-black/25 p-6 text-sm leading-6 text-slate-300">
                  Nenhum novo pack está aberto para compra neste instante. Complete os critérios de XP e diretos para destravar a próxima oferta da sua loja.
                </div>
              )}

              <div className="rounded-3xl border border-amber-300/25 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100/90">
                <p className="font-semibold text-amber-200">Janela oficial da ativação mensal</p>
                <p className="mt-2">O compromisso deve ser efetivado entre os dias 01 e 10 de cada mês para manter bônus e comissões ativos.</p>
                <ul className="mt-3 space-y-1 pl-5 list-disc">
                  <li>3 meses de inadimplência: suspensão de 90 dias.</li>
                  <li>Acima de 4 meses: retrocesso de nível + suspensão de 120 dias.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5 text-quantum-cyan" />
                Estoque pronto para operação
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tudo o que o agente já pode vender ou utilizar operacionalmente aparece nesta área como vitrine interna.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stockItems.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-sm leading-6 text-slate-300">
                  Seu estoque ainda está vazio. Faça uma ativação mensal para liberar packs, bibliotecas e produtos operacionais.
                </div>
              ) : (
                stockItems.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{item.description}</p>
                      </div>
                      <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{item.badge}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Qtd. {item.quantity.toLocaleString("pt-BR")}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Uso direto pelo agente</span>
                    </div>
                  </div>
                ))
              )}

              <Link href="/estoque">
                <Button variant="outline" className="mt-2 w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Abrir painel completo do estoque
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Canais de distribuição</Badge>
              <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">Ecossistema conectado ao seu mini-commerce</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                A loja principal organiza os ativos próprios do Nexus, enquanto os canais parceiros ampliam distribuição e monetização.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredChannels.map((channel) => {
              const Icon = MARKETPLACE_ICONS[channel.icon] ?? ShoppingBag;
              const url = channel.externalUrl ?? channel.internalUrl ?? "#";
              const isExternal = Boolean(channel.externalUrl);
              return (
                <a
                  key={channel.slug}
                  href={url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="group rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5" style={{ color: channel.color }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isExternal ? (
                      <ExternalLink className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
                    )}
                  </div>
                  <p className="mt-4 text-lg font-semibold text-white">{channel.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{channel.description}</p>
                  <Badge
                    className="mt-4 border"
                    style={{
                      borderColor: `${channel.color}44`,
                      backgroundColor: `${channel.color}11`,
                      color: channel.color,
                    }}
                  >
                    {channel.status === "ativo" ? "Operação ativa" : channel.status === "em_breve" ? "Em breve" : "Em manutenção"}
                  </Badge>
                </a>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-quantum-lime" />
                Bibliotecas de e-books por estágio
              </CardTitle>
              <CardDescription className="text-slate-400">
                Cada biblioteca acompanha a evolução da conta e funciona como uma linha de produtos da sua loja.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ebookBundles.map((bundle) => (
                <div
                  key={bundle.slug}
                  className={`rounded-3xl border p-4 ${
                    bundle.status === "active" ? "border-green-500/30 bg-green-500/10" : "border-white/10 bg-black/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{bundle.name}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{bundle.description}</p>
                    </div>
                    <Badge
                      className={`border ${
                        bundle.status === "active"
                          ? "border-green-500/30 bg-green-500/10 text-green-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {bundle.status === "active" ? "Liberado" : "Bloqueado"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{bundle.ebookCount} e-books</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Revenda {bundle.resalePriceLabel}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Pack {bundle.unlockPack?.shortName}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-quantum-purple" />
                Skills e upgrades do agente
              </CardTitle>
              <CardDescription className="text-slate-400">
                A experiência de loja agora também mostra os bundles de skills como produtos de evolução do seu agente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillBundles.map((bundle) => (
                <div
                  key={bundle.slug}
                  className={`rounded-3xl border p-4 ${
                    bundle.status === "active" ? "border-purple-500/30 bg-purple-500/10" : "border-white/10 bg-black/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{bundle.name}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{bundle.description}</p>
                    </div>
                    {bundle.status === "active" ? (
                      <CheckCircle2 className="mt-1 h-5 w-5 text-green-400" />
                    ) : (
                      <Lock className="mt-1 h-5 w-5 text-amber-300" />
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{bundle.skillSummary}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Pack {bundle.unlockPack?.shortName}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
