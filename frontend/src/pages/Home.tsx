import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Bot,
  ShoppingCart,
  BarChart3,
  Star,
  Check,
} from "lucide-react";

const ADMIN_EMAIL = "lucasmpthomaz@gmail.com";

export default function Home() {
  const systemInfo = trpc.system.info.useQuery();
  const bootstrapStatus = trpc.bootstrap.status.useQuery();

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Agentes IA Autônomos",
      desc: "Squads de agentes trabalhando 24/7 para maximizar seus resultados",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Comissões em Cascata",
      desc: "Ganhe comissões em até 15 níveis da sua rede",
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Marketplaces Integrados",
      desc: "Mercado Livre, Shopee, Hotmart e mais",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Avançado",
      desc: "Dashboard completo com métricas em tempo real",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Rede Neural MMN",
      desc: "Visualize e gerencie toda sua rede de afiliados",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Segurança Robusta",
      desc: "JWT, RBAC e proteção de dados em camadas",
    },
  ];

  const stats = [
    { value: "15K+", label: "Afiliados Ativos" },
    { value: "R$ 2.5M+", label: "Comissões Pagas" },
    { value: "98.5%", label: "Uptime do Sistema" },
    { value: "24/7", label: "Suporte IA" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/5 rounded-full blur-[150px]" />
      </div>

      <header className="relative z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                <Zap className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold gradient-text">MMNAI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-text-secondary hover:text-foreground transition-colors">Funcionalidades</a>
              <a href="#review" className="text-sm text-text-secondary hover:text-foreground transition-colors">Revisão</a>
              <Link href="/login" className="text-sm text-text-secondary hover:text-foreground transition-colors">Entrar</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login?mode=admin" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">Admin</Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm" className="gradient-btn">Cadastre-se Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20">
                <Star className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm text-accent-cyan font-medium">Plataforma MMN com revisão guiada de usuário e admin</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">Marketing Multinível</span>
                <br />
                <span className="text-foreground">Reinventado com IA</span>
              </h1>
              <p className="text-lg text-text-secondary max-w-xl">
                Homepage preparada para validar cadastro, login, backoffice do afiliado e backoffice administrativo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cadastro">
                  <Button size="lg" className="w-full sm:w-auto gradient-btn text-lg px-8">
                    Revisar fluxo de cadastro
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login?mode=admin">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                    Revisar acesso admin
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green border-2 border-background flex items-center justify-center text-xs font-bold text-background">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-text-muted">+2.500 afiliados ativos</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 rounded-3xl blur-2xl" />
              <Card className="relative bg-card/50 backdrop-blur-xl border-border/50 p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                      <Zap className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <p className="font-semibold">Revisão de acesso</p>
                      <p className="text-sm text-accent-green">User e admin prontos</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-accent-green/20 text-accent-green text-sm font-medium">Ativo</span>
                </div>
                <div className="grid gap-3">
                  <div className="p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
                    <p className="text-sm font-medium text-accent-cyan mb-1">Backoffice Usuário</p>
                    <p className="text-sm text-text-secondary">Fluxo com cadastro, login e dashboard do afiliado.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
                    <p className="text-sm font-medium text-accent-purple mb-1">Backoffice Admin</p>
                    <p className="text-sm text-text-secondary">Acesso administrativo revisado com Lucas Thomaz ({ADMIN_EMAIL}).</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="review" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Revisão funcional <span className="gradient-text">homepage + backoffices</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              A homepage agora conduz diretamente para os fluxos de usuário e administrador, simplificando a validação completa do sistema.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <p className="text-sm font-semibold text-accent-cyan">Cadastro</p>
              <p className="mt-3 text-sm text-text-secondary">Fluxo em 3 etapas com validação local e redirecionamento automático para o painel do usuário.</p>
              <Link href="/cadastro" className="mt-6 inline-flex">
                <Button variant="outline">Abrir cadastro</Button>
              </Link>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <p className="text-sm font-semibold text-accent-green">Login usuário</p>
              <p className="mt-3 text-sm text-text-secondary">Entrada rápida para revisar o backoffice do afiliado e os atalhos principais da operação.</p>
              <Link href="/login?mode=affiliate" className="mt-6 inline-flex">
                <Button variant="outline">Abrir login usuário</Button>
              </Link>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <p className="text-sm font-semibold text-accent-purple">Login admin</p>
              <p className="mt-3 text-sm text-text-secondary">Acesso administrativo preparado para Lucas Thomaz com destino direto ao /admin/dashboard.</p>
              <Link href="/login?mode=admin" className="mt-6 inline-flex">
                <Button variant="outline">Abrir login admin</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tudo que você precisa para <span className="gradient-text">dominar o mercado</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Uma plataforma completa com ferramentas avançadas de IA para impulsionar seus resultados no marketing multinível.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-accent-cyan/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                Estado do Sistema
              </h3>
              {systemInfo.isLoading ? (
                <p className="text-text-muted">Consultando...</p>
              ) : systemInfo.data ? (
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <dt className="text-text-secondary">Runtime</dt>
                    <dd className="font-medium">{systemInfo.data.runtime}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <dt className="text-text-secondary">Database</dt>
                    <dd className="font-medium">{systemInfo.data.database}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <dt className="text-text-secondary">Redis</dt>
                    <dd className="font-medium">{systemInfo.data.redis}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-text-secondary">Mode</dt>
                    <dd className="font-medium">{systemInfo.data.mode}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-red-400">Erro ao conectar</p>
              )}
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                Routers Ativos
              </h3>
              {bootstrapStatus.isLoading ? (
                <p className="text-text-muted">Consultando...</p>
              ) : bootstrapStatus.data ? (
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <dt className="text-text-secondary">Frontend</dt>
                    <dd className={`font-medium ${bootstrapStatus.data.frontend === "operational" ? "text-accent-green" : "text-yellow-500"}`}>
                      {bootstrapStatus.data.frontend}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <dt className="text-text-secondary">Backend</dt>
                    <dd className={`font-medium ${bootstrapStatus.data.backend === "operational" ? "text-accent-green" : "text-yellow-500"}`}>
                      {bootstrapStatus.data.backend}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <dt className="text-text-secondary">Genkit</dt>
                    <dd className={`font-medium ${bootstrapStatus.data.genkit === "operational" ? "text-accent-green" : "text-yellow-500"}`}>
                      {bootstrapStatus.data.genkit}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-text-secondary">Agentic Layer</dt>
                    <dd className="font-medium text-accent-cyan">Ativo</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-red-400">Erro ao conectar</p>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border-accent-cyan/30 backdrop-blur-xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pronto para revisar o sistema?</h2>
            <p className="text-text-secondary mb-8 max-w-xl mx-auto">
              Acesse a homepage, valide o cadastro, confira o painel do afiliado e revise o backoffice administrativo com o perfil de Lucas Thomaz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro">
                <Button size="lg" className="w-full sm:w-auto gradient-btn text-lg px-8">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login?mode=admin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  Abrir admin
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-text-muted flex-wrap">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-green" /> Cadastro revisado</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-green" /> Login dual user/admin</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-green" /> Backoffice validável</span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
