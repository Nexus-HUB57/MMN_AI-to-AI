import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  Network,
  Percent,
  Settings,
  Users,
  X,
  Bell,
  Database,
  Activity,
  Zap,
  Globe,
  UserCog,
  Shield,
  Package,
  Briefcase,
  ChevronLeft,
} from "lucide-react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const MENU_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: BarChart3 },
  { label: "Usuarios", path: "/admin/users", icon: Users },
  { label: "Comissoes", path: "/admin/commissions", icon: Percent },
  { label: "Rede", path: "/admin/network", icon: Network },
  { label: "Pagamentos", path: "/admin/payments", icon: CreditCard },
  { label: "Aprovacoes", path: "/admin/approvals", icon: CheckCircle2 },
  { label: "Inadimplentes", path: "/admin/delinquents", icon: AlertCircle },
  { label: "Materiais", path: "/admin/materials", icon: FileText },
  { label: "Logs", path: "/admin/logs", icon: Activity },
  { label: "Configuracoes", path: "/admin/settings", icon: Settings },
] as const;

const isDashboardRoute = (path: string) => path === "/admin" || path === "/admin/dashboard";

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const currentMenuItem = useMemo(() => {
    if (isDashboardRoute(location)) {
      return MENU_ITEMS[0];
    }
    return MENU_ITEMS.find((item) => location === item.path || location.startsWith(`${item.path}/`));
  }, [location]);

  const breadcrumbs = useMemo(() => {
    const active = currentMenuItem?.label || "Backoffice Admin";
    return ["Admin", active];
  }, [currentMenuItem]);

  const [notifications] = useState([
    { id: 1, title: "Nova Comissao Pendente", message: "1 nova comissao aguardando aprovacao", time: "2 min", type: "warning" },
    { id: 2, title: "Usuario Novo Cadastrado", message: "Novo afiliado registrado na rede", time: "15 min", type: "info" },
    { id: 3, title: "Pagamento Aprovado", message: "Pagamento processado com sucesso", time: "1 hora", type: "success" },
  ]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="max-w-md p-8 text-center bg-card/50 backdrop-blur border-border/50">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="mb-4 text-2xl font-bold">Acesso Negado</h1>
          <p className="mb-6 text-text-secondary">
            Esta area e exclusiva para administradores do Backoffice MMN AI-to-AI.
          </p>
          <Button onClick={() => navigate("/")} className="gradient-btn">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} flex flex-col border-r border-border/50 bg-card transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                <Zap className="w-5 h-5 text-background" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Nexus System</p>
                <h1 className="text-sm font-bold">Backoffice Admin</h1>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                <Zap className="w-5 h-5 text-background" />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="rounded-lg p-2 text-text-muted transition hover:bg-accent-cyan/10 hover:text-accent-cyan"
            aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Quick Links */}
        <div className="border-b border-border/50 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-accent-cyan/10 hover:text-accent-cyan"
          >
            <Home size={16} />
            {sidebarOpen && <span>Voltar ao produto</span>}
          </Link>
          {sidebarOpen && (
            <Link
              href="/dashboard"
              className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition hover:bg-accent-cyan/10 hover:text-accent-cyan"
            >
              <Globe size={16} />
              <span>Painel Afiliado</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <p className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted ${sidebarOpen ? "" : "text-center"}`}>
            {sidebarOpen ? "Gestao" : "---"}
          </p>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/admin/dashboard"
              ? isDashboardRoute(location)
              : location === item.path || location.startsWith(`${item.path}/`);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? "bg-gradient-to-r from-accent-cyan/20 to-accent-green/20 text-accent-cyan border border-accent-cyan/30"
                    : "text-text-secondary hover:bg-accent-cyan/10 hover:text-accent-cyan"
                }`}
              >
                <Icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        {sidebarOpen && (
          <div className="mx-3 mb-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20 px-3 py-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
              <Database size={14} />
              <span>Status do Sistema</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">API</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent-green"></span>
                  <span className="text-xs text-accent-green">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Database</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent-green"></span>
                  <span className="text-xs text-accent-green">OK</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Workers</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent-cyan"></span>
                  <span className="text-xs text-accent-cyan">3/4</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Session */}
        <div className="border-t border-border/50 px-4 py-4">
          {sidebarOpen && (
            <div className="mb-3 rounded-xl bg-accent-purple/5 border border-accent-purple/20 px-3 py-3 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center text-xs font-bold text-background">
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name || "Admin"}</p>
                  <p className="text-xs text-accent-cyan">Administrador</p>
                </div>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className={`w-full border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 ${!sidebarOpen ? "px-2" : ""}`}
            onClick={() => logout()}
          >
            <LogOut size={16} />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-md px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight size={14} />}
                    <span className={index === breadcrumbs.length - 1 ? "text-foreground" : ""}>{crumb}</span>
                  </div>
                ))}
              </div>
              <h2 className="text-xl font-bold">{currentMenuItem?.label || "Backoffice Admin"}</h2>
              <p className="text-sm text-text-muted mt-1">
                {location === "/admin/dashboard"
                  ? "Visao geral da plataforma com metricas em tempo real"
                  : "Gestao operacional centralizada"}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-2 mr-4">
                <div className="flex items-center gap-1.5 rounded-full bg-accent-green/10 px-3 py-1.5 text-xs font-medium text-accent-green border border-accent-green/20">
                  <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse"></span>
                  Sistema Operacional
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-accent-cyan/10 px-3 py-1.5 text-xs font-medium text-accent-cyan border border-accent-cyan/20">
                  <Activity size={12} />
                  v1.0.8
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative border-border/50 hover:bg-accent-cyan/10"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {notifications.length}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border/50 bg-card shadow-xl backdrop-blur-md">
                    <div className="border-b border-border/50 px-4 py-3">
                      <h3 className="font-semibold">Notificacoes</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="border-b border-border/30 px-4 py-3 hover:bg-accent-cyan/5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 h-2 w-2 rounded-full ${
                              notification.type === "warning" ? "bg-yellow-500" :
                              notification.type === "success" ? "bg-accent-green" : "bg-accent-cyan"
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-text-muted mt-0.5">{notification.message}</p>
                              <p className="text-xs text-text-muted mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/50 px-4 py-2">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-accent-cyan">
                        Ver todas as notificacoes
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Display */}
              <div className="hidden md:block text-right">
                <p className="text-xs text-text-muted">
                  {new Date().toLocaleDateString("pt-BR", { weekday: "short" })}
                </p>
                <p className="text-sm font-semibold">
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-background/50 px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
