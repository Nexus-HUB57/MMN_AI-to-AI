import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Percent,
  Network,
  CreditCard,
  AlertCircle,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Calendar,
  ShieldCheck,
  Globe,
  Settings,
  Activity,
  CheckSquare,
  Sparkles,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

type MenuItem = {
  label: string;
  path: string;
  icon: typeof BarChart3;
  group?: string;
};

const MENU_ITEMS: MenuItem[] = [
  // Operação
  { label: "Dashboard", path: "/admin", icon: BarChart3, group: "Operação" },
  { label: "Status do Sistema", path: "/admin/status", icon: Activity, group: "Operação" },
  { label: "Aprovações", path: "/admin/approvals", icon: CheckSquare, group: "Operação" },
  { label: "Agendamentos", path: "/admin/scheduler", icon: Calendar, group: "Operação" },
  // Negócio
  { label: "Usuários", path: "/admin/users", icon: Users, group: "Negócio" },
  { label: "Rede", path: "/admin/network", icon: Network, group: "Negócio" },
  { label: "Comissões", path: "/admin/commissions", icon: Percent, group: "Negócio" },
  { label: "Pagamentos", path: "/admin/payments", icon: CreditCard, group: "Negócio" },
  { label: "Inadimplentes", path: "/admin/delinquents", icon: AlertCircle, group: "Negócio" },
  { label: "Pack Tickets", path: "/admin/pack-tickets", icon: Ticket, group: "Negócio" },
  // Conteúdo
  { label: "Materiais", path: "/admin/materials", icon: FileText, group: "Conteúdo" },
  { label: "Academia EAD", path: "/admin/academia", icon: GraduationCap, group: "Conteúdo" },
  { label: "Academia Analytics", path: "/admin/academia/analytics", icon: TrendingUp, group: "Conteúdo" },
  { label: "Meetings", path: "/admin/meetings", icon: Calendar, group: "Conteúdo" },
  // Agentic
  { label: "Skills", path: "/admin/skills", icon: Sparkles, group: "Agentic" },
  { label: "Governance", path: "/admin/governance", icon: ShieldCheck, group: "Agentic" },
  { label: "Federation", path: "/admin/federation", icon: Globe, group: "Agentic" },
  // Sistema
  { label: "Configurações", path: "/admin/settings", icon: Settings, group: "Sistema" },
];

const GROUP_ORDER = ["Operação", "Negócio", "Conteúdo", "Agentic", "Sistema"];

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para acessar este painel.</p>
          <Button onClick={() => navigate("/")}>Voltar para Home</Button>
        </Card>
      </div>
    );
  }

  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: MENU_ITEMS.filter((i) => i.group === g),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-700`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">MMNAI Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items (agrupado) */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-3">
          {grouped.map((section) => (
            <div key={section.group} className="space-y-1">
              {sidebarOpen && (
                <p className="px-3 pt-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  {section.group}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="border-t border-slate-700 p-4 space-y-3">
          {sidebarOpen && (
            <div className="text-sm">
              <p className="text-gray-400">Logado como</p>
              <p className="font-semibold truncate">{user.name || user.email}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => logout()}
          >
            <LogOut size={16} />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
