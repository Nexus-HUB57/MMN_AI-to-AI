import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen, Cpu, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { trpc } from "../lib/trpc";

// =============================================================================
// /content-hub — antes mostrava erro "Unexpected token '<', ... is not valid JSON".
// Refatorado para nunca depender da resposta JSON: capturamos erros do tRPC e
// exibimos um fallback informativo + atalhos de produção de conteúdo.
// =============================================================================

export default function ContentHub() {
  const bootstrapStatus = trpc.bootstrap?.status?.useQuery
    ? trpc.bootstrap.status.useQuery(undefined, { retry: false })
    : { data: undefined, isLoading: false, error: undefined as any };

  const systemInfo = trpc.system?.info?.useQuery
    ? trpc.system.info.useQuery(undefined, { retry: false })
    : { data: undefined, isLoading: false, error: undefined as any };

  const apiOffline = Boolean(bootstrapStatus.error || systemInfo.error);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Hub de Conteúdo · Núcleo Gerativo
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Hub de Conteúdo</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Central de produção do agente IA: roteiros, banners, e-books, calendário social e geração via IA. Quando o backend está temporariamente indisponível, exibimos um painel funcional com atalhos.
              </p>
            </div>
            <Link href="/content/generator">
              <Button className="gradient-btn">
                <Sparkles className="mr-2 h-4 w-4" /> Abrir gerador IA
              </Button>
            </Link>
          </div>
        </section>

        {apiOffline && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">API tRPC ainda não publicada</p>
              <p className="mt-1">
                Esta tela costumava devolver “Unexpected token '&lt;', "&lt;!DOCTYPE "... is not valid JSON” quando o backend não estava online. Substituímos esse comportamento por este aviso e mantemos o hub utilizável com atalhos diretos.
              </p>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Cpu className="h-5 w-5 text-quantum-cyan" />
                Probe do bootstrap
              </CardTitle>
              <CardDescription className="text-slate-400">
                Status da camada bootstrap. Sem erros JSON: mostramos o estado real.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              {bootstrapStatus.isLoading && <p>Consultando bootstrap…</p>}
              {bootstrapStatus.error && (
                <p className="text-amber-200">API indisponível — exibindo fallback.</p>
              )}
              {bootstrapStatus.data && (
                <ul className="space-y-1">
                  <li><strong>frontend:</strong> {bootstrapStatus.data.frontend}</li>
                  <li><strong>backend:</strong> {bootstrapStatus.data.backend}</li>
                  <li><strong>genkit:</strong> {bootstrapStatus.data.genkit}</li>
                </ul>
              )}
              {!bootstrapStatus.data && !bootstrapStatus.isLoading && (
                <ul className="space-y-1 text-slate-400">
                  <li><strong>frontend:</strong> publicado em oneverso.com.br</li>
                  <li><strong>backend:</strong> aguardando deploy em VPS</li>
                  <li><strong>genkit:</strong> configurado, em standby</li>
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-quantum-purple" />
                Notas do runtime
              </CardTitle>
              <CardDescription className="text-slate-400">
                Resumo das features ativas no monorepo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              {systemInfo.data?.features && Array.isArray(systemInfo.data.features) ? (
                <ul className="space-y-1">
                  {systemInfo.data.features.map((f: string) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-1 text-slate-400">
                  <li>• AI Content Hub · MMN Engine · Agent Management</li>
                  <li>• Marketplace Integration · Commission Tracking</li>
                  <li>• Social Media Scheduling · Analytics Dashboard</li>
                  <li>• Orchestrator System · Pack Marketplace Sync</li>
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Atalhos de produção</CardTitle>
              <CardDescription className="text-slate-400">
                Acesse diretamente as ferramentas do núcleo gerativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/content/generator", label: "Gerador de conteúdo IA", icon: Sparkles },
                { href: "/content/image", label: "Gerador de imagens IA", icon: ImageIcon },
                { href: "/content/calendar", label: "Calendário social", icon: FileText },
                { href: "/marketing/ebooks", label: "Gerenciar e-books", icon: BookOpen },
              ].map((shortcut) => {
                const Icon = shortcut.icon;
                return (
                  <Link key={shortcut.href} href={shortcut.href}>
                    <Button variant="outline" className="w-full justify-start border-white/15 bg-white/5 text-white hover:bg-white/10">
                      <Icon className="mr-2 h-4 w-4 text-quantum-cyan" />
                      {shortcut.label}
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
