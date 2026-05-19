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
  Cpu,
  LogOut,
  Menu,
  Network,
  Settings,
  ShoppingCart,
  TrendingUp,
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Rede",
      href: "/network",
      icon: <Network className="w-5 h-5" />,
    },
    {
      label: "Comissoes",
      href: "/commissions",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Agente IA",
      href: "/agent",
      icon: <Cpu className="w-5 h-5" />,
      badge: "Beta",
    },
    {
      label: "Marketplaces",
      href: "/marketplaces",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: "Upgrades",
      href: "/upgrades",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      label: "Pagamentos",
      href: "/payments",
      icon: <Wallet className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    setLocation("/logout");
  };

  const getAgentStatus = (): "ativo" | "inativo" | "configurando" => {
    // TODO: Integrar com API para obter status real do agente
    // Por enquanto, retorna "configurando" como estado padrao
    return "configurando";
  };

  const agentStatus = getAgentStatus();
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
              Faca login para continuar
            </h1>
            <p className="text-sm text-text-secondary text-center max-w-sm">
              Acesso a este painel requer autenticacao. Clique abaixo para iniciar o fluxo de login.
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                <Zap className="w-4 h-4 text-background" />
              </div>
              <span className="text-lg font-bold gradient-text hidden sm:inline">
                MMNAI
              </span>
            </div>
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
                      {user?.name || "Usuario"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {user?.role === "admin" ? "Administrador" : "Afiliado"}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name || "Usuario"}
                  </p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Papel: {user?.role === "admin" ? "Administrador" : "Afiliado"}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Status do Agente IA:
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        statusColors[agentStatus]
                      }`}
                    >
                      {agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {agentStatus === "ativo"
                      ? "Seu agente esta operacional"
                      : agentStatus === "inativo"
                      ? "Agente inativo. Clique para ativar"
                      : "Agente em configuracao. Finalize a instalacao"}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                <Settings className="w-4 h-4 mr-2" />
                <span>Configuracoes da Conta</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                <Cpu className="w-4 h-4 mr-2" />
                <span>Gerenciar Agente IA</span>
              </DropdownMenuItem>

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
        <nav className="h-full overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <span className="text-text-secondary group-hover:text-accent-cyan transition-colors">
                {item.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="text-xs px-2 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan">
                  {item.badge}
                </span>
              )}
            </a>
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
        ></div>
      )}
    </div>
  );
}
