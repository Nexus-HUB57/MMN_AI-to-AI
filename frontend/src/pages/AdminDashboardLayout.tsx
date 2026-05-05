import { useAuth } from "@/_core/hooks/useAuth";
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
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const MENU_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Usuários", path: "/admin/users", icon: Users },
  { label: "Comissões", path: "/admin/commissions", icon: Percent },
  { label: "Rede", path: "/admin/network", icon: Network },
  { label: "Pagamentos", path: "/admin/payments", icon: CreditCard },
  { label: "Inadimplentes", path: "/admin/delinquents", icon: AlertCircle },
  { label: "Materiais", path: "/admin/materials", icon: FileText },
];

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
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {MENU_ITEMS.find((item) => item.path === location)?.label || "Painel Administrativo"}
          </h2>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString("pt-BR")}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
