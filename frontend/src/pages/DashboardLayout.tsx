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
  Image,
  LineChart,
  Link2,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Network,
  Package,
  Settings,
  ShoppingCart,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

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
  const logoutMutation = trpc.auth.logout.useMutation();

  const navGroups: NavGroup[] = [
    {
      title: "Geral",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <BarChart3 className="w-5 h-5" />,
        },
        {
          label: "Rede MMN",
          href: "/network",
          icon: <Network className="w-5 h-5" />,
        },
        {
          label: "Comissões",
          href: "/commissions",
          icon: <TrendingUp className="w-5 h-5" />,
        },
        {
          label: "Carreira / XP",
          href: "/career",
          icon: <Trophy className="w-5 h-5" />,
        },
        {
          label: "Pagamentos",
          href: "/payments",
          icon: <Wallet className="w-5 h-5" />,
        },
        {
          label: "Bônus & Recompensas",
          href: "/bonus",
          icon: <Star className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Agente IA",
      items: [
        {
          label: "Painel do Agente",
          href: "/agents",
          icon: <Cpu className="w-5 h-5" />,
          badge: "Beta",
        },
        {
          label: "Orquestrador",
          href: "/orchestrator",
          icon: <Globe className="w-5 h-5" />,
        },
        {
          label: "Pacotes / Skills",
          href: "/packs",
          icon: <Package className="w-5 h-5" />,
          badge: "Novo",
        },
        {
          label: "Upgrades",
          href: "/upgrades",
          icon: <Zap className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Marketing",
      items: [
        {
          label: "Hub de Conteúdo",
          href: "/content-hub",
          icon: <BookOpen className="w-5 h-5" />,
        },
        {
          label: "Calendário Social",
          href: "/content/calendar",
          icon: <Calendar className="w-5 h-5" />,
        },
        {
          label: "Materiais",
          href: "/marketing/materials",
          icon: <Image className="w-5 h-5" />,
        },
        {
          label: "Contas Sociais",
          href: "/social/accounts",
          icon: <MessageSquare className="w-5 h-5" />,
        },
        {
          label: "Rastreamento de Links",
          href: "/tracking/links",
          icon: <Link2 className="w-5 h-5" />,
        },
        {
          label: "Mini-site",
          href: "/minisite",
          icon: <Globe className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Loja & Operações",
      items: [
        {
          label: "Marketplaces",
          href: "/marketplaces",
          icon: <ShoppingCart className="w-5 h-5" />,
        },
        {
          label: "Dropshipping",
          href: "/dropshipping/orders",
          icon: <Box className="w-5 h-5" />,
        },
        {
          label: "Analytics",
          href: "/utilities",
          icon: <LineChart className="w-5 h-5" />,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    setLocation("/logout");
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Faça login para continuar
            </h1>
            <p className="text-sm text-text-secondary text-center max-w-sm">
              Acesso a este painel requer autenticação. Clique abaixo para
              iniciar o fluxo de login.
            </p>
          </div>
          <Button
            onClick={() => setLocation("/login")}
            className="w-full shadow-lg hover:shadow-xl transition-all gradient-btn"
          >
            Ir para Login
          </Button>
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
                MMNAI
              </span>
            </button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
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
            <DropdownMenuContent align="end" className="w-56">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Papel:{" "}
                    {user?.role === "admin" ? "Administrador" : "Afiliado"}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Status do Agente IA:
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[agentStatus]}`}
                    >
                      {agentStatus.charAt(0).toUpperCase() +
                        agentStatus.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
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
                className="cursor-pointer hover:bg-muted"
                onClick={() => setLocation("/profile")}
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>Configurações da Conta</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-muted"
                onClick={() => setLocation("/agents")}
              >
                <Cpu className="w-4 h-4 mr-2" />
                <span>Gerenciar Agente IA</span>
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-muted"
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
                className="cursor-pointer text-red-400 focus:bg-red-500/10 hover:bg-red-500/10"
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
    </div>
  );
}
