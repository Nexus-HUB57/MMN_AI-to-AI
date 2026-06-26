import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  BookOpen,
  Box,
  Briefcase,
  Calendar,
  ChevronDown,
  Cpu,
  Globe,
  History,
  Image,
  LineChart,
  Link2,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Network,
  Package,
  QrCode,
  Settings,
  ShoppingCart,
  Star,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import React, { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

// NEXUS_ONBOARDING_V2
import OnboardingBundle from "@/components/OnboardingBundle";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const invalidateRemoteSession = async () => {
    try {
      await Promise.race([
        logoutMutation.mutateAsync(),
        new Promise((_, reject) =>
          window.setTimeout(() => reject(new Error("logout-timeout")), 2000),
        ),
      ]);
    } catch (error) {
      console.warn("Falha ao invalidar sessão remota. Logout local aplicado.", error);
    }
  };

  // Auto-recolhe o popup de configurações após inatividade.
  React.useEffect(() => {
    if (!userMenuOpen) return;
    const timer = window.setTimeout(() => setUserMenuOpen(false), 6000);
    return () => window.clearTimeout(timer);
  }, [userMenuOpen]);

  // NEXUS_HUBS_V2 — 3 Hubs: Operar / Crescer / Conta
  const navGroups: NavGroup[] = [
    {
      title: "🧠 Operar — Agente & Conteúdo",
      items: [
        { label: "Painel do Agente", href: "/agents", icon: <Cpu className="w-5 h-5" />, badge: "Live" },
        { label: "Skills do Agente", href: "/skills", icon: <Sparkles className="w-5 h-5" />, badge: "25" },
        { label: "Sincronizar IA", href: "/agents/sync", icon: <Globe className="w-5 h-5" /> },
        { label: "Orquestrador", href: "/orchestrator", icon: <Network className="w-5 h-5" /> },
        { label: "Hub de Conteúdo", href: "/content-hub", icon: <BookOpen className="w-5 h-5" /> },
        { label: "Gerador de Conteúdo", href: "/content/generation", icon: <Sparkles className="w-5 h-5" /> },
        { label: "Calendário Social", href: "/content/calendar", icon: <Calendar className="w-5 h-5" /> },
        { label: "Materiais", href: "/marketing/materials", icon: <Image className="w-5 h-5" /> },
        { label: "Contas Sociais", href: "/social/accounts", icon: <MessageSquare className="w-5 h-5" /> },
      ],
    },
    {
      title: "🚀 Crescer — Vendas & Rede",
      items: [
        { label: "Marketplace Nexus", href: "/marketplaces", icon: <ShoppingCart className="w-5 h-5" />, badge: "201" },
        { label: "Minha Loja", href: "/minha-loja", icon: <Globe className="w-5 h-5" /> },
        { label: "Meu Estoque", href: "/estoque", icon: <Box className="w-5 h-5" /> },
        { label: "Rastreamento", href: "/tracking/links", icon: <Link2 className="w-5 h-5" /> },
        { label: "Dropshipping", href: "/dropshipping/orders", icon: <Package className="w-5 h-5" /> },
        { label: "Rede Binária N.O", href: "/network", icon: <Network className="w-5 h-5" /> },
        { label: "Sub-Redes (SiSu)", href: "/sisu", icon: <Network className="w-5 h-5" /> },
        { label: "Comissões", href: "/commissions", icon: <TrendingUp className="w-5 h-5" /> },
        { label: "Carreira / XP", href: "/career", icon: <Trophy className="w-5 h-5" /> },
        { label: "Bônus & Recompensas", href: "/bonus", icon: <Star className="w-5 h-5" /> },
        { label: "Analytics", href: "/utilities", icon: <LineChart className="w-5 h-5" /> },
      ],
    },
    {
      title: "👤 Conta — Gestão & Pagamentos",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Packs Nexus", href: "/packs", icon: <Package className="w-5 h-5" /> },
        { label: "Upgrades", href: "/upgrades", icon: <Zap className="w-5 h-5" /> },
        { label: "Pagamentos", href: "/payments", icon: <Wallet className="w-5 h-5" /> },
        { label: "Checkout PIX", href: "/pix/checkout", icon: <QrCode className="w-5 h-5" /> },
        { label: "Histórico PIX", href: "/pix/history", icon: <History className="w-5 h-5" /> },
        { label: "Subscriptions", href: "/subscriptions", icon: <Briefcase className="w-5 h-5" /> },
        { label: "Partners (API)", href: "/partners", icon: <Users className="w-5 h-5" /> },
        { label: "Academ'IA", href: "/academia", icon: <BookOpen className="w-5 h-5" /> },
      ],
    },
  ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    void invalidateRemoteSession();
    await logout();
    setLocation("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard")
      return location === "/" || location === "/dashboard";
    return location.startsWith(href);
  };

  const agentStatus = "configurando" as "ativo" | "inativo" | "configurando";
  const statusColors = {
    ativo: "bg-accent-green/20 text-accent-green",
    inativo: "bg-red-500/20 text-red-400",
    configurando: "bg-accent-cyan/20 text-accent-cyan",
  };

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.16),transparent_25%),radial-gradient(circle_at_top_right,rgba(0,229,255,0.16),transparent_28%),linear-gradient(180deg,#020617,#0f172a)] px-6">
        <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur md:p-10">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
            <div className="inline-flex rounded-full border border-quantum-cyan/30 bg-quantum-cyan/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-quantum-cyan">
              Acesso protegido
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Faça login para acessar sua Loja Virtual Nexus.
              </h1>
              <p className="text-sm leading-7 text-slate-300 md:text-base">
                O painel comercial, os packs, os e-books e o checkout inteligente ficam disponíveis após autenticação. Entre para continuar sua jornada com uma experiência mais premium e organizada.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Packs</p>
                <p className="mt-2 text-lg font-bold text-white">15 níveis</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Bibliotecas</p>
                <p className="mt-2 text-lg font-bold text-white">Entrega digital</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Checkout</p>
                <p className="mt-2 text-lg font-bold text-white">Pix + MP</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/login")}
              className="gradient-btn h-12 w-full max-w-sm shadow-lg transition-all hover:shadow-xl"
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                <Zap className="w-4 h-4 text-background" />
              </div>
              <span className="text-lg font-bold gradient-text hidden sm:inline">
                IOAID · SaaS
              </span>
            </button>
          </div>

          {/* User Menu */}
          <DropdownMenu modal={false} open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center text-sm font-bold text-background">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {user?.role === "admin" ? "Administrador" : "Afiliado"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-secondary hidden sm:block" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 border border-slate-300 bg-slate-50/95 text-slate-950 shadow-2xl shadow-black/20 backdrop-blur"
              onMouseLeave={() => setUserMenuOpen(false)}
              onInteractOutside={() => setUserMenuOpen(false)}
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-slate-700">{user?.email}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Papel:{" "}
                    {user?.role === "admin" ? "Administrador" : "Afiliado"}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-700">
                      Status do Agente IA:
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[agentStatus]}`}
                    >
                      {agentStatus.charAt(0).toUpperCase() +
                        agentStatus.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {agentStatus === "ativo"
                      ? "Seu agente está operacional"
                      : agentStatus === "inativo"
                        ? "Agente inativo. Clique para ativar"
                        : "Agente em configuração. Finalize a instalação"}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem
                className="cursor-pointer text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-950"
                onClick={() => setLocation("/profile")}
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>Configurações da Conta</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-950"
                onClick={() => setLocation("/agents")}
              >
                <Cpu className="w-4 h-4 mr-2" />
                <span>Gerenciar Agente IA</span>
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem
                  className="cursor-pointer text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-950"
                  onClick={() => setLocation("/admin")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  <span>Painel Admin</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-700 focus:bg-red-100 data-[highlighted]:bg-red-100 data-[highlighted]:text-red-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-30 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="h-full overflow-y-auto p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setLocation(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        active
                          ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                          : "text-text-secondary hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`transition-colors ${
                          active
                            ? "text-accent-cyan"
                            : "text-text-secondary group-hover:text-accent-cyan"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent-cyan/20 text-accent-cyan">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
        <OnboardingBundle />
    </div>
  );
}
