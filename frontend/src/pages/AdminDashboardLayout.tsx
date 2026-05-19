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
  { label: "Logs", path: "/admin/logs", icon: FileText },
  { label: "Agendamentos", path: "/admin/schedules", icon: CalendarClock },
  { label: "Configurações", path: "/admin/settings", icon: Settings },
] as const;

const isDashboardRoute = (path: string) => path === "/admin" || path === "/admin/dashboard";

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      <aside
        className={`${sidebarOpen ? "w-72" : "w-20"} flex flex-col border-r border-slate-800 bg-slate-950 text-white transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          {sidebarOpen ? (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">MMN AI-to-AI</p>
              <h1 className="text-lg font-semibold">Backoffice Admin</h1>
            </div>
          ) : (
            <span className="mx-auto text-xs font-bold tracking-[0.2em] text-slate-300">ADM</span>
          )}
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="rounded p-2 text-slate-300 transition hover:bg-slate-900 hover:text-white"
            aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="border-b border-slate-800 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            <Home size={16} />
            {sidebarOpen && <span>Voltar ao produto</span>}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
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

      <main className="flex min-h-screen flex-1 flex-col overflow-hidden">
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
                Navegação operacional consolidada para o núcleo administrativo do sistema.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50 px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
