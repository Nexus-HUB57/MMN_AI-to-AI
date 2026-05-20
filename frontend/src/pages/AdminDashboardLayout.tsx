import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
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
} from "lucide-react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const MENU_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: BarChart3 },
  { label: "Usuários", path: "/admin/users", icon: Users },
  { label: "Comissões", path: "/admin/commissions", icon: Percent },
  { label: "Rede", path: "/admin/network", icon: Network },
  { label: "Pagamentos", path: "/admin/payments", icon: CreditCard },
  { label: "Inadimplentes", path: "/admin/delinquents", icon: AlertCircle },
  { label: "Materiais", path: "/admin/materials", icon: FileText },
  { label: "Logs", path: "/admin/logs", icon: Activity },
  { label: "Agendamentos", path: "/admin/schedules", icon: CalendarClock },
  { label: "Configurações", path: "/admin/settings", icon: Settings },
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
    return ["Backoffice Admin", active];
  }, [currentMenuItem]);

  const [notifications] = useState([
    { id: 1, title: "Nova Comissão Pendente", message: "1 nova comissão aguardando aprovação", time: "2 min", type: "warning" },
    { id: 2, title: "Usuário Novo Cadastrado", message: "João Silva se registrou na rede", time: "15 min", type: "info" },
    { id: 3, title: "Pagamento Aprovado", message: "Pagamento #1234 processado com sucesso", time: "1 hora", type: "success" },
  ]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <Card className="max-w-md p-8 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-slate-900">Acesso negado</h1>
          <p className="mb-6 text-slate-600">
            Esta área é exclusiva para administradores do Backoffice MMN AI-to-AI.
          </p>
          <Button onClick={() => navigate("/")}>Voltar para a home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-20"} flex flex-col border-r border-slate-800 bg-slate-950 text-white transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          {sidebarOpen ? (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nexus System</p>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Zap size={18} className="text-blue-400" />
                Backoffice Admin
              </h1>
            </div>
          ) : (
            <div className="mx-auto flex flex-col items-center gap-1">
              <Zap size={20} className="text-blue-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-300">ADM</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="rounded p-2 text-slate-300 transition hover:bg-slate-900 hover:text-white"
            aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Quick Links */}
        <div className="border-b border-slate-800 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            <Home size={16} />
            {sidebarOpen && <span>Voltar ao produto</span>}
          </Link>
          {sidebarOpen && (
            <Link
              href="/dashboard"
              className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              <Globe size={16} />
              <span>Painel Afiliado</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 ${sidebarOpen ? "" : "text-center"}`}>
            {sidebarOpen ? "Gestão" : "•••"}
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
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
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
          <div className="mx-3 mb-3 rounded-lg bg-slate-900 px-3 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Database size={14} />
              <span>Status do Sistema</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">API</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-green-400">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Database</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-green-400">OK</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Workers</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span className="text-xs text-blue-400">3/4</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Session */}
        <div className="border-t border-slate-800 px-4 py-4">
          {sidebarOpen && (
            <div className="mb-3 rounded-lg bg-slate-900 px-3 py-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">Sessão atual</p>
              <p className="truncate font-medium text-white">{user.name || user.email}</p>
              <p className="text-xs text-slate-400">Perfil: {user.role}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-700 bg-slate-950 text-white hover:bg-slate-900"
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
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight size={14} />}
                    <span>{crumb}</span>
                  </div>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{currentMenuItem?.label || "Backoffice Admin"}</h2>
              <p className="text-sm text-slate-500">
                {location === "/admin/dashboard"
                  ? "Visão geral da plataforma com métricas e indicadores em tempo real"
                  : "Gestão operacional centralizada"}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-2 mr-4">
                <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Sistema Operacional
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                  <Activity size={12} />
                  v1.0.8
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
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
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="font-semibold text-slate-900">Notificações</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="border-b border-slate-100 px-4 py-3 hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 h-2 w-2 rounded-full ${
                              notification.type === "warning" ? "bg-amber-500" :
                              notification.type === "success" ? "bg-green-500" : "bg-blue-500"
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 px-4 py-2">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        Ver todas as notificações
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Display */}
              <div className="hidden md:block text-right">
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString("pt-BR", { weekday: "long" })}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 px-6 py-6">{children}</div>
      </main>
    </div>
  );
}