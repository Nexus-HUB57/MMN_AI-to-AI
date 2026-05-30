import { Link, useLocation } from "wouter";
import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { useAuth } from "@/contexts/AuthContext";
import { resolveShowcaseMarketplaceProfile } from "@/lib/public-marketplace";
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
  LogIn,
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
  Bot,
  Globe,
  TrendingUp,
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

/** Banner de CTA para visitantes não logados, exibido no topo do checkout */
function PublicCtaBanner({ packSlug, packName, amountCents, description }: { packSlug: string; packName: string; amountCents: number; description: string }) {
  const checkoutUrl = buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: packSlug, name: packName, amountCents, description });
  return (
    <div className="rounded-[28px] border border-quantum-cyan/30 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.14),transparent_35%),rgba(15,23,42,0.95)] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{packName}</Badge>
          <p className="text-2xl font-bold text-white">{formatCurrency(amountCents)}</p>
          <p className="max-w-xl text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <Link href={`/login?from=${encodeURIComponent(checkoutUrl)}`}>
          <Button className="gradient-btn h-12 min-w-[180px] px-6 text-sm font-semibold">
            <LogIn className="mr-2 h-4 w-4" />
            Entrar para adquirir
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MarketplacesContent({ isPublicView }: { isPublicView: boolean }) {
  const { profile } = useMarketplaceProfile();
  const { isAuthenticated } = useAuth();

  const displayProfile = useMemo(
    () => resolveShowcaseMarketplaceProfile(profile, isAuthenticated),
    [profile, isAuthenticated],
  );

  const progress = getProgressSnapshot(displayProfile);
  const ebookBundles = getUnlockedEbookBundles(displayProfile);
  const skillBundles = getUnlockedSkillBundles(displayProfile);
  const hasOnboardingFlag =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("onboarding") === "1";

  const packStates = NEXUS_PACKS.map((pack) => ({
    ...pack,
    access: getPackAccess(displayProfile, pack),
  }));

  const availableNow = packStates.filter((pack) => pack.access.status === "available");
  const activeCount = packStates.filter((pack) => pack.access.status === "active").length;
  const activeEbooks = ebookBundles.filter((bundle) => bundle.status === "active").length;
  const activeSkills = skillBundles.filter((bundle) => bundle.status === "active").length;
  const stockItems = useMemo(() => getOperationalInventory(displayProfile), [displayProfile]);
  const heroPacks = (isPublicView ? packStates.slice(0, 3) : availableNow.slice(0, 3));
  const featuredChannels = EXTERNAL_MARKETPLACES.slice(0, 4);

  return (
    <div className="space-y-8 pb-8">

      {/* HERO NEXUS STORIE MARKETPLACE */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(0,229,255,0.20),transparent_30%),linear-gradient(180deg,rgba(10,18,40,0.98),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,rgba(124,255,178,0.10),transparent_55%)] lg:block" />
        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Nexus Storie Marketplace
              </Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Pix · Mercado Pago</Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Entrega digital imediata</Badge>
              {isPublicView && (
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  Vitrine pública · faça login para comprar
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                Sua central de{" "}
                <span className="text-quantum-lime">produtos, packs e oportunidades</span>
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                O Nexus Storie Marketplace reúne todos os produtos, packs de evolução, bibliotecas de e-books e canais
                parceiros em um único lugar. Compre, ative seu agente e comece a revender — tudo com checkout
                integrado e entrega automática.
              </p>
            </div>

            {!isPublicView && (
              <div className="grid gap-3 sm:grid-cols-3">
                <KpiCard label="packs ativos" value={String(activeCount)} icon={Package} accent="text-quantum-cyan" />
                <KpiCard label="bibliotecas" value={String(activeEbooks)} icon={BookOpen} accent="text-quantum-lime" />
                <KpiCard label="skills liberadas" value={String(activeSkills)} icon={Sparkles} accent="text-quantum-purple" />
              </div>
            )}

            {isPublicView && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-quantum-lime/20 bg-quantum-lime/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-quantum-lime/70">Packs disponíveis</p>
                  <p className="mt-3 text-3xl font-bold text-white">15</p>
                </div>
                <div className="rounded-3xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-quantum-cyan/70">E-books no catálogo</p>
                  <p className="mt-3 text-3xl font-bold text-white">800+</p>
                </div>
                <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-purple-300/70">Skills do agente</p>
                  <p className="mt-3 text-3xl font-bold text-white">45</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {isPublicView ? (
                <>
                  <Link href="/cadastro">
                    <Button className="gradient-btn h-12 px-6 text-sm font-semibold">
                      <Bot className="mr-2 h-4 w-4" />
                      Criar conta e ativar agente
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="h-12 border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10">
                      <LogIn className="mr-2 h-4 w-4" />
                      Já tenho conta
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/estoque">
                    <Button className="gradient-btn h-12 px-6 text-sm font-semibold">
                      Abrir meu estoque
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/packs">
                    <Button variant="outline" className="h-12 border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10">
                      Ver packs e planos
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {hasOnboardingFlag && (
              <div className="rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/10 p-4 text-sm text-quantum-cyan">
                Cadastro concluído! Seu onboarding começa aqui com o Pack A² como primeira ativação.
              </div>
            )}
          </div>

          {/* CARD LATERAL */}
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
            {!isPublicView ? (
              <>
                <Card className="overflow-hidden border-white/10 bg-white/6 backdrop-blur">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl text-white">Sua conta comercial</CardTitle>
                        <CardDescription className="mt-2 text-slate-300">Nível atual e próxima meta.</CardDescription>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-quantum-cyan">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">nível atual</p>
                      <p className="mt-3 text-2xl font-bold text-white">{getLevelLabel(displayProfile.currentLevel)}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{getLevelSubtitle(displayProfile.currentLevel)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">XP acumulado</p>
                        <p className="mt-2 text-2xl font-bold text-white">{displayProfile.currentXp.toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Indicados diretos</p>
                        <p className="mt-2 text-2xl font-bold text-white">{displayProfile.directReferrals}</p>
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
                      <p className="text-lg font-bold text-white">{progress.nextPack?.name ?? "Jornada completa!"}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {progress.nextPack ? `Meta: ${progress.nextPack.shortName}` : "Você concluiu toda a jornada de packs."}
                      </p>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-quantum-cyan" /> XP</span>
                        <span>{progress.xpCurrent.toLocaleString("pt-BR")} / {progress.xpTarget.toLocaleString("pt-BR")}</span>
                      </div>
                      <ProgressBar value={progress.xpProgress} />
                    </div>
                    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-quantum-lime" /> Indicados</span>
                        <span>{progress.directCurrent} / {progress.directTarget}</span>
                      </div>
                      <ProgressBar value={progress.directProgress} tone="lime" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Card visível para visitantes — vitrine dos benefícios */
              <Card className="overflow-hidden border-quantum-lime/20 bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.12),transparent_40%),rgba(15,23,42,0.95)] backdrop-blur">
                <CardHeader className="space-y-3">
                  <Badge className="w-fit border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                    <Star className="mr-1.5 h-3 w-3" />
                    Por que entrar no Nexus?
                  </Badge>
                  <CardTitle className="text-2xl text-white">Tudo que você ganha ao se cadastrar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Bot, text: "Agente IA ativado no primeiro pack", color: "text-quantum-cyan" },
                    { icon: BookOpen, text: "Biblioteca de e-books para revenda imediata", color: "text-quantum-lime" },
                    { icon: TrendingUp, text: "Comissões sobre toda a sua rede de indicados", color: "text-emerald-400" },
                    { icon: Globe, text: "Mini-site automatizado com seu catálogo", color: "text-quantum-purple" },
                    { icon: Wallet, text: "Checkout com Pix e Mercado Pago integrado", color: "text-amber-300" },
                    { icon: ShieldCheck, text: "Painel de carreira com 15 níveis progressivos", color: "text-quantum-cyan" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                      <span className="text-sm text-slate-200">{item.text}</span>
                    </div>
                  ))}
                  <Link href="/cadastro">
                    <Button className="gradient-btn mt-2 h-11 w-full text-sm font-semibold">
                      Criar conta grátis agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS RÁPIDOS */}
      <section className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {[
          {
            title: "Checkout integrado",
            description: "Pague ou receba com Pix e Mercado Pago diretamente pelo painel, sem sair da plataforma.",
            icon: Wallet,
            accent: "text-quantum-cyan",
          },
          {
            title: "Catálogo sempre pronto",
            description: "E-books, packs e produtos organizados em cards visuais, prontos para apresentar e vender.",
            icon: Store,
            accent: "text-quantum-lime",
          },
          {
            title: "Entrega instantânea",
            description: "Produtos digitais liberados automaticamente após confirmação do pagamento.",
            icon: CheckCircle2,
            accent: "text-quantum-purple",
          },
          {
            title: "Crescimento guiado",
            description: "Jornada de carreira com 15 níveis, metas claras de XP e recompensas progressivas.",
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

      {/* VITRINE DE PACKS */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card
          className="overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] shadow-2xl shadow-black/20"
        >
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge className="border border-quantum-lime/30 bg-quantum-lime/10 text-quantum-lime">
                  Packs disponíveis para ativação
                </Badge>
                <CardTitle className="mt-3 text-2xl text-white md:text-3xl">
                  {isPublicView ? "Escolha seu pack de entrada" : "Produtos disponíveis agora"}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-slate-300">
                  {isPublicView
                    ? "Cada pack ativa novas capacidades no seu Agente IA, libera produtos para revenda e avança sua carreira na plataforma."
                    : "Packs que você já pode adquirir com base no seu nível e histórico de ativações."}
                </CardDescription>
              </div>
              {!isPublicView && (
                <Link href="/packs">
                  <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                    Ver catálogo completo
                  </Button>
                </Link>
              )}
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
                          <Badge className="border border-purple-500/30 bg-purple-500/10 text-purple-300">
                            <Bot className="mr-1 h-3 w-3" />
                            Ativa o Agente IA
                          </Badge>
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
                      {isPublicView ? (
                        <Link href={`/login?from=${encodeURIComponent(buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: pack.slug, name: pack.name, amountCents: pack.priceCents, description: pack.description }))}`}>
                          <Button className="gradient-btn h-12 w-full text-sm font-semibold">
                            <LogIn className="mr-2 h-4 w-4" />
                            Entrar para adquirir
                          </Button>
                        </Link>
                      ) : (
                        <Link href={buildMarketplaceCheckoutUrl({ source: "marketplaces", type: "pack", slug: pack.slug, name: pack.name, amountCents: pack.priceCents, description: pack.description })}>
                          <Button className="gradient-btn h-12 w-full text-sm font-semibold">
                            Adquirir agora
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <p className="text-xs leading-5 text-slate-400">Entrega digital imediata após confirmação do pagamento.</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-black/25 p-6 text-sm leading-6 text-slate-300">
                Nenhum pack está disponível para compra agora. Complete os critérios de XP e indicados para desbloquear a próxima oferta.
              </div>
            )}

            <div className="rounded-3xl border border-amber-300/25 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100/90">
              <p className="font-semibold text-amber-200">Ativação mensal (dias 01 a 10)</p>
              <p className="mt-2">Mantenha sua ativação em dia para garantir bônus, comissões e acesso pleno ao catálogo.</p>
              <ul className="mt-3 space-y-1 pl-5 list-disc">
                <li>3 meses sem ativação: suspensão temporária de 90 dias.</li>
                <li>Mais de 4 meses: revisão de nível + suspensão de 120 dias.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ESTOQUE LATERAL */}
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Package className="h-5 w-5 text-quantum-cyan" />
              {isPublicView ? "O que vem no seu estoque" : "Meu estoque operacional"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isPublicView
                ? "Produtos e conteúdos que ficam disponíveis para revenda assim que você ativa um pack."
                : "Produtos que o Agente IA pode usar para automação e revenda."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPublicView ? (
              /* Preview de estoque para visitantes */
              [
                { title: "Biblioteca de E-books A²", badge: "E-books", desc: "10 e-books prontos para revenda digital." },
                { title: "Pacotes PREU AG", badge: "PREU", desc: "Pacotes comerciais com 25 e-books cada." },
                { title: "Pack SiSu de indicação", badge: "SiSu", desc: "Sub-contas vinculadas ao seu CPF." },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{item.desc}</p>
                    </div>
                    <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">{item.badge}</Badge>
                  </div>
                </div>
              ))
            ) : stockItems.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-sm leading-6 text-slate-300">
                Seu estoque está vazio. Faça uma ativação para liberar packs, bibliotecas e produtos.
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
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Agente IA habilitado</span>
                  </div>
                </div>
              ))
            )}

            {isPublicView ? (
              <Link href="/cadastro">
                <Button className="gradient-btn mt-2 h-11 w-full text-sm font-semibold">
                  Criar conta e ver meu estoque real
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/estoque">
                <Button variant="outline" className="mt-2 w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Ver painel completo do estoque
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      {/* CANAIS PARCEIROS */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="border border-white/10 bg-white/5 text-slate-200">Canais de distribuição</Badge>
            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
              Seu catálogo distribuído nos maiores canais do mercado
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Além da loja Nexus, seus produtos podem ser distribuídos por canais parceiros para ampliar alcance e receita.
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
                  {channel.status === "ativo" ? "Canal ativo" : channel.status === "em_breve" ? "Em breve" : "Em manutenção"}
                </Badge>
              </a>
            );
          })}
        </div>
      </section>

      {/* E-BOOKS E SKILLS */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-quantum-lime" />
              Bibliotecas de e-books por nível
            </CardTitle>
            <CardDescription className="text-slate-400">
              Cada biblioteca acompanha sua evolução e funciona como uma linha de produtos da sua loja.
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
              Capacidades do seu Agente IA
            </CardTitle>
            <CardDescription className="text-slate-400">
              Cada pack libera novos conjuntos de capacidades que o agente usa nas suas automações comerciais.
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
  );
}

export default function Marketplaces() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <MarketplacesContent isPublicView={false} />
      </DashboardLayout>
    );
  }

  /* Layout público — sem sidebar, com navbar da home */
  return (
    <div className="relative min-h-screen bg-[#020617] text-foreground font-sans antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.08),transparent_55%)]" />

      {/* Navbar pública */}
      <nav className="relative z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#020617]/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-quantum-cyan shadow-[0_0_12px_#00E5FF]">
            <span className="absolute inset-0 animate-ping rounded-full bg-quantum-cyan/60" />
          </span>
          <Link href="/">
            <span className="font-bold tracking-wider text-sm text-white cursor-pointer">
              NEXUS <span className="text-quantum-cyan">AFFIL'IA'TE</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/estoque">
            <Button variant="ghost" className="h-8 px-4 text-xs text-slate-300 hover:text-white">
              Vitrine
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="h-8 border-quantum-cyan/40 bg-quantum-cyan/10 px-4 text-xs font-semibold text-quantum-cyan hover:bg-quantum-cyan/20">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button className="gradient-btn h-8 px-4 text-xs font-semibold">
              Cadastrar
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6">
        <MarketplacesContent isPublicView={true} />
      </div>

      {/* Footer público */}
      <footer className="relative z-10 border-t border-white/10 bg-[#020617]/80 px-6 py-8 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Nexus Affil'IA'te · <a href="https://oneverso.com.br" className="text-quantum-cyan hover:underline">oneverso.com.br</a>
        </p>
      </footer>
    </div>
  );
}
