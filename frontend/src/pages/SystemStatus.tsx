import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";

// Ícones SVG inline para evitar dependências externas
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const ServerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
    <line x1="6" y1="6" x2="6.01" y2="6"/>
    <line x1="6" y1="18" x2="6.01" y2="18"/>
  </svg>
);

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

interface ServiceStatus {
  name: string;
  status: "online" | "degraded" | "offline";
  latency?: number;
  lastCheck: string;
  description: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCommissions: number;
  pendingCommissions: number;
  totalAgents: number;
  activeAgents: number;
}

export default function SystemStatus() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [systemHealth, setSystemHealth] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simular dados de status do sistema
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        // Simular dados de serviços
        const services: ServiceStatus[] = [
          {
            name: "API Backend",
            status: "online",
            latency: 45,
            lastCheck: new Date().toISOString(),
            description: "tRPC API endpoints responding normally"
          },
          {
            name: "Database MySQL",
            status: "online",
            latency: 12,
            lastCheck: new Date().toISOString(),
            description: "Primary database connection stable"
          },
          {
            name: "Redis Cache",
            status: "online",
            latency: 3,
            lastCheck: new Date().toISOString(),
            description: "Cache layer operational"
          },
          {
            name: "AI Agents",
            status: "online",
            latency: 156,
            lastCheck: new Date().toISOString(),
            description: "Agentic AI services active"
          },
          {
            name: "Cron Scheduler",
            status: "online",
            lastCheck: new Date().toISOString(),
            description: "Background jobs running"
          },
          {
            name: "Payment Gateway",
            status: "degraded",
            latency: 234,
            lastCheck: new Date().toISOString(),
            description: "Elevated latency detected"
          }
        ];

        const mockMetrics: SystemMetrics = {
          totalUsers: 1247,
          activeUsers: 89,
          totalCommissions: 456780.50,
          pendingCommissions: 12340.75,
          totalAgents: 45,
          activeAgents: 38
        };

        setSystemHealth(services);
        setMetrics(mockMetrics);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (err) {
        setError("Failed to load system status");
        setLoading(false);
      }
    };

    fetchSystemStatus();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "online": return "text-green-500";
      case "degraded": return "text-yellow-500";
      case "offline": return "text-red-500";
    }
  };

  const getStatusBg = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "online": return "bg-green-500/10 border-green-500/30";
      case "degraded": return "bg-yellow-500/10 border-yellow-500/30";
      case "offline": return "bg-red-500/10 border-red-500/30";
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "online": return <CheckCircleIcon />;
      case "degraded": return <AlertCircleIcon />;
      case "offline": return <XCircleIcon />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const uptimePercentage = systemHealth.filter(s => s.status === "online").length / systemHealth.length * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando status do sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl mb-2">Erro ao carregar status</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/admin")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                System Status
              </h1>
              <p className="text-sm text-gray-500">Monitoramento em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ClockIcon />
            <span>Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Uptime Total */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Uptime Total</span>
              <ActivityIcon />
            </div>
            <div className="text-3xl font-bold text-green-500 mb-2">
              {uptimePercentage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uptimePercentage}%` }}
              />
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Total Usuários</span>
              <ServerIcon />
            </div>
            <div className="text-3xl font-bold mb-2">
              {metrics ? formatNumber(metrics.totalUsers) : "-"}
            </div>
            <div className="text-sm text-green-500">
              {metrics ? `${metrics.activeUsers} ativos` : ""}
            </div>
          </div>

          {/* Comissões */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Total Comissões</span>
              <DatabaseIcon />
            </div>
            <div className="text-3xl font-bold text-green-500 mb-2">
              {metrics ? formatCurrency(metrics.totalCommissions) : "-"}
            </div>
            <div className="text-sm text-yellow-500">
              {metrics ? `${formatCurrency(metrics.pendingCommissions)} pendentes` : ""}
            </div>
          </div>

          {/* Agentes AI */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Agentes AI</span>
              <ActivityIcon />
            </div>
            <div className="text-3xl font-bold mb-2">
              {metrics ? `${metrics.activeAgents}/${metrics.totalAgents}` : "-"}
            </div>
            <div className="text-sm text-green-500">
              Operacionais
            </div>
          </div>
        </div>

        {/* Services Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemHealth.map((service, index) => (
            <div
              key={index}
              className={`bg-gray-900 rounded-xl border p-6 ${getStatusBg(service.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={getStatusColor(service.status)}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    <p className="text-sm text-gray-400">{service.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  Status: <span className={`font-semibold ${getStatusColor(service.status)}`}>
                    {service.status === "online" ? "Online" : service.status === "degraded" ? "Degradado" : "Offline"}
                  </span>
                </div>
                {service.latency && (
                  <div className="text-gray-400">
                    Latência: <span className={service.latency > 200 ? "text-yellow-500" : "text-green-500"}>
                      {service.latency}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* System Architecture */}
        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ServerIcon />
            Arquitetura do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-400 border-b border-blue-500/30 pb-2">
                Frontend
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• React 18 + TypeScript</li>
                <li>• Vite Build System</li>
                <li>• TailwindCSS + Radix UI</li>
                <li>• tRPC Client</li>
                <li>• wouter Routing</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-green-400 border-b border-green-500/30 pb-2">
                Backend
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Node.js + Express</li>
                <li>• tRPC Server</li>
                <li>• Drizzle ORM</li>
                <li>• BullMQ Workers</li>
                <li>• Genkit AI</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                Infrastructure
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• MySQL Database</li>
                <li>• Redis Cache</li>
                <li>• Docker Compose</li>
                <li>• Cron Jobs</li>
                <li>• WebSocket Support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">40+</div>
            <div className="text-sm text-gray-400">Rotas API</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">50+</div>
            <div className="text-sm text-gray-400">Páginas Frontend</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">10+</div>
            <div className="text-sm text-gray-400">Routers tRPC</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">5</div>
            <div className="text-sm text-gray-400">Workers Ativos</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 py-4 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>Nexus System AfilIAte-AI • v1.0.9 • IOAID · SaaS Platform</p>
        </div>
      </footer>
    </div>
  );
}