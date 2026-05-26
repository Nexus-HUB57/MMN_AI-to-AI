import { Link } from "wouter";
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
  getPackAccess,
  getProgressSnapshot,
  getUnlockedEbookBundles,
  getUnlockedSkillBundles,
} from "@/lib/nexus-marketplace";
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
  Tag,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const MARKETPLACE_ICONS = { ShoppingBag, Flame, ShoppingCart, Tag } as Record<string, typeof ShoppingBag>;

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "lime" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full ${tone === "lime" ? "bg-quantum-lime" : "bg-quantum-cyan"}`}
        style={{ width: `${Math.max(4, value)}%` }}
      />
    </div>
  );
}

export default function Marketplaces() {
  const { profile, activate } = useMarketplaceProfile();
  const progress = getProgressSnapshot(profile);
  const ebookBundles = getUnlockedEbookBundles(profile);
  const skillBundles = getUnlockedSkillBundles(profile);
  const hasOnboardingFlag = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("onboarding") === "1";

  const packStates = NEXUS_PACKS.map((pack) => ({
    ...pack,
    access: getPackAccess(profile, pack),
  }));

  const availableNow = packStates.filter((pack) => pack.access.status === "available");
  const lockedCount = packStates.filter((pack) => pack.access.status === "locked").length;
  const activeCount = packStates.filter((pack) => pack.access.status === "active").length;
  const activeEbooks = ebookBundles.filter((bundle) => bundle.status === "active").length;
  const activeSkills = skillBundles.filter((bundle) => bundle.status === "active").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Canais de venda integrados</Badge>
              <h2 className="mt-3 text-2xl font-bold text-white">Marketplaces conectados ao agente IA</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                O agente IA opera vendas diretas no Marketplace Nexus Storie e em plataformas parceiras (Hotmart, Shopee e Mercado Livre) via dropshipping e revenda.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {EXTERNAL_MARKETPLACES.map((channel) => {
              const Icon = MARKETPLACE_ICONS[channel.icon] ?? ShoppingBag;
              const url = channel.externalUrl ?? channel.internalUrl ?? "#";
              const isExternal = Boolean(channel.externalUrl);
              return (
                <a
                  key={channel.slug}
                  href={url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold"
                      style={{ backgroundColor: `${channel.color}22`, color: channel.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {isExternal ? (
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{channel.name}</p>
                  <p className="mt-1 text-xs text-slate-400 leading-5">{channel.description}</p>
                  <Badge
                    className="mt-3 border"
                    style={{
                      borderColor: `${channel.color}44`,
                      backgroundColor: `${channel.color}11`,
                      color: channel.color,
                    }}
                  >
                    {channel.status === "ativo" ? "Ativo" : channel.status === "em_breve" ? "Em breve" : "Em manutenção"}
                  </Badge>
                </a>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.94))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Marketplace Nexus sincronizado com Age.txt
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white md:text-4xl">Marketplace Nexus reconfigurado por nível, XP e plano</h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  O fluxo inicial agora respeita o plano de carreira do Nexus: após o cadastro, o usuário entra no Marketplace com apenas o Pack Agente Afiliado A² liberado. Todos os demais packs, bibliotecas, skills e upgrades ficam bloqueados até a conclusão integral dos critérios de nível / XP.
                </p>
              </div>
              {hasOnboardingFlag && (
                <div className="rounded-2xl border border-quantum-cyan/30 bg-quantum-cyan/10 p-4 text-sm text-quantum-cyan">
                  Cadastro concluído. Seu onboarding começou no Marketplace e o Pack A² foi liberado como primeira ativação.
                </div>
              )}
            </div>

            <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-quantum-cyan" />
                  Status do afiliado
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Regras atuais de acesso do seu ecossistema Nexus.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">carreira atual</p>
                  <p className="mt-2 text-lg font-semibold text-white">{getLevelLabel(profile.currentLevel)}</p>
                  <p className="mt-1 text-slate-400">{getLevelSubtitle(profile.currentLevel)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">XP atual</p>
                    <p className="mt-2 text-2xl font-bold text-white">{profile.currentXp.toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Diretos qualificados</p>
                    <p className="mt-2 text-2xl font-bold text-white">{profile.directReferrals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Packs ativos", value: activeCount, icon: Package, tone: "text-quantum-cyan" },
            { label: "Packs bloqueados", value: lockedCount, icon: Lock, tone: "text-amber-300" },
            { label: "Bibliotecas liberadas", value: activeEbooks, icon: BookOpen, tone: "text-quantum-lime" },
            { label: "Skills liberadas", value: activeSkills, icon: Sparkles, tone: "text-quantum-purple" },
          ].map((item) => (
            <Card key={item.label} className="border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
                </div>
                <item.icon className={`h-7 w-7 ${item.tone}`} />
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-quantum-cyan" />
                Critérios para o próximo upgrade
              </CardTitle>
              <CardDescription className="text-slate-400">
                O próximo plano só é liberado quando nível, XP e rede qualificada forem concluídos integralmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">próxima etapa</p>
                    <p className="mt-2 text-lg font-semibold text-white">{progress.nextPack?.name ?? "Todos os packs concluídos"}</p>
                  </div>
                  {progress.nextPack ? (
                    <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                      {progress.nextPack.shortName}
                    </Badge>
                  ) : (
                    <Badge className="border border-green-500/30 bg-green-500/10 text-green-400">Concluído</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-quantum-cyan" /> XP acumulado</span>
                  <span>{progress.xpCurrent.toLocaleString("pt-BR")} / {progress.xpTarget.toLocaleString("pt-BR")}</span>
                </div>
                <ProgressBar value={progress.xpProgress} />
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-quantum-lime" /> Diretos qualificados</span>
                  <span>{progress.directCurrent} / {progress.directTarget}</span>
                </div>
                <ProgressBar value={progress.directProgress} tone="lime" />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Link href="/packs">
                  <Button className="w-full gradient-btn">Ver packs</Button>
                </Link>
                <Link href="/skills">
                  <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">Ver skills</Button>
                </Link>
                <Link href="/upgrades">
                  <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">Ver upgrades</Button>
                </Link>
                <Link href="/marketplaces/ebooks">
                  <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">Ver e-books</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
                Liberado agora no pós-cadastro
              </CardTitle>
              <CardDescription className="text-slate-400">
                Apenas ofertas realmente acessíveis neste momento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableNow.map((pack) => (
                <div key={pack.slug} className="rounded-2xl border border-quantum-cyan/20 bg-quantum-cyan/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{pack.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{pack.description}</p>
                    </div>
                    <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                      {pack.badge ?? "Disponível"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pack.highlights.slice(0, 3).map((highlight) => (
                      <span key={highlight} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">investimento</p>
                      <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(pack.priceCents)}</p>
                    </div>
                    <Button className="gradient-btn" onClick={() => activate(pack.slug)}>
                      Ativar agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {availableNow.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
                  Nenhum novo pack está disponível neste instante. Complete os critérios de carreira para avançar ao próximo upgrade.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-quantum-cyan" />
                Bibliotecas de e-books vinculadas aos packs
              </CardTitle>
              <CardDescription className="text-slate-400">
                Os e-books são liberados pela hierarquia de packs e permanecem sincronizados com o plano ativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ebookBundles.map((bundle) => (
                <div key={bundle.slug} className={`rounded-2xl border p-4 ${bundle.status === "active" ? "border-green-500/30 bg-green-500/10" : "border-white/10 bg-black/20"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{bundle.name}</p>
                      <p className="mt-1 text-sm text-slate-300">{bundle.description}</p>
                    </div>
                    {bundle.status === "active" ? (
                      <Badge className="border border-green-500/30 bg-green-500/10 text-green-400">Liberado</Badge>
                    ) : (
                      <Badge className="border border-amber-500/30 bg-amber-500/10 text-amber-300">Bloqueado</Badge>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{bundle.ebookCount} e-books</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Revenda {bundle.resalePriceLabel}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Vinculado ao {bundle.unlockPack?.shortName}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-quantum-purple" />
                Skills liberadas por plano
              </CardTitle>
              <CardDescription className="text-slate-400">
                Cada bundle de skills acompanha o upgrade do agente e só aparece quando o pack correspondente for concluído.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillBundles.map((bundle) => (
                <div key={bundle.slug} className={`rounded-2xl border p-4 ${bundle.status === "active" ? "border-purple-500/30 bg-purple-500/10" : "border-white/10 bg-black/20"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{bundle.name}</p>
                      <p className="mt-1 text-sm text-slate-300">{bundle.description}</p>
                    </div>
                    {bundle.status === "active" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-amber-300" />
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
