import React, { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { TRPCProvider } from "./components/trpc-provider";
import { AuthProvider } from "./contexts/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContentHub = lazy(() => import("./pages/ContentHub"));
const ContentGeneration = lazy(() => import("./pages/ContentGeneration"));
const ContentCalendar = lazy(() => import("./pages/ContentCalendar"));
const OrchestratorDashboard = lazy(() => import("./pages/OrchestratorDashboard"));
const LegacyReview = lazy(() => import("./pages/LegacyReview"));

const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminNetwork = lazy(() => import("./pages/AdminNetwork"));
const AdminCommissions = lazy(() => import("./pages/AdminCommissions"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminApprovals = lazy(() => import("./pages/AdminApprovals"));
const AdminDelinquents = lazy(() => import("./pages/AdminDelinquents"));
const AdminMaterials = lazy(() => import("./pages/AdminMaterials"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminSchedules = lazy(() => import("./pages/AdminSchedules"));

const AffiliateProfile = lazy(() => import("./pages/AffiliateProfile"));
const AffiliatePayments = lazy(() => import("./pages/AffiliatePayments"));
const AffiliateMiniSite = lazy(() => import("./pages/AffiliateMiniSite"));

const Agents = lazy(() => import("./pages/Agents"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AgentStatus = lazy(() => import("./pages/AgentStatus"));
const AgentConfiguration = lazy(() => import("./pages/AgentConfiguration"));

const Marketplaces = lazy(() => import("./pages/Marketplaces"));
const DropshippingOrders = lazy(() => import("./pages/DropshippingOrders"));

const MarketingMaterials = lazy(() => import("./pages/MarketingMaterials"));
const BannerManager = lazy(() => import("./pages/BannerManager"));
const EbookManager = lazy(() => import("./pages/EbookManager"));

const ContentGenerator = lazy(() => import("./pages/ContentGenerator"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));

const Commissions = lazy(() => import("./pages/Commissions"));
const BonusRewards = lazy(() => import("./pages/BonusRewards"));

const SocialAccounts = lazy(() => import("./pages/NotFound"));
const TrackingLinks = lazy(() => import("./pages/NotFound"));

const Login = lazy(() => import("./pages/Login"));
const Logout = lazy(() => import("./pages/Logout"));

const ExecutionLogs = lazy(() => import("./pages/ExecutionLogs"));
const NotFound = lazy(() => import("./pages/NotFound"));

export const NAVIGATION_STRUCTURE = {
  PUBLIC: [
    { path: "/", name: "Home", component: "Home" },
    { path: "/login", name: "Login", component: "Login" },
  ],
  AFFILIATE: [
    { path: "/dashboard", name: "Dashboard", component: "Dashboard", layout: "DashboardLayout" },
    { path: "/profile", name: "Perfil", component: "AffiliateProfile", layout: "DashboardLayout" },
    { path: "/payments", name: "Pagamentos", component: "AffiliatePayments", layout: "DashboardLayout" },
    { path: "/commissions", name: "Comissões", component: "Commissions", layout: "DashboardLayout" },
    { path: "/bonus", name: "Bônus", component: "BonusRewards", layout: "DashboardLayout" },
    { path: "/minisite", name: "MiniSite", component: "AffiliateMiniSite", layout: "DashboardLayout" },
  ],
  AGENTS: [
    { path: "/agents", name: "Agentes", component: "Agents", layout: "DashboardLayout" },
    { path: "/agents/dashboard", name: "Dashboard Agentes", component: "AgentDashboard", layout: "DashboardLayout" },
    { path: "/agents/config", name: "Configurar Agente", component: "AgentConfiguration", layout: "DashboardLayout" },
    { path: "/agents/status", name: "Status", component: "AgentStatus", layout: "DashboardLayout" },
  ],
  CONTENT: [
    { path: "/content-hub", name: "Hub de Conteúdo", component: "ContentHub", layout: "DashboardLayout" },
    { path: "/content/generate", name: "Gerar Conteúdo", component: "ContentGeneration", layout: "DashboardLayout" },
    { path: "/content/generator", name: "Gerador IA", component: "ContentGenerator", layout: "DashboardLayout" },
    { path: "/content/image", name: "Gerar Imagem", component: "ImageGenerator", layout: "DashboardLayout" },
    { path: "/content/calendar", name: "Calendário", component: "ContentCalendar", layout: "DashboardLayout" },
  ],
  MARKETPLACE: [
    { path: "/marketplaces", name: "Marketplaces", component: "Marketplaces", layout: "DashboardLayout" },
    { path: "/dropshipping/orders", name: "Pedidos Dropshipping", component: "DropshippingOrders", layout: "DashboardLayout" },
  ],
  MARKETING: [
    { path: "/marketing/materials", name: "Materiais", component: "MarketingMaterials", layout: "DashboardLayout" },
    { path: "/marketing/banners", name: "Banners", component: "BannerManager", layout: "DashboardLayout" },
    { path: "/marketing/ebooks", name: "E-books", component: "EbookManager", layout: "DashboardLayout" },
  ],
  SOCIAL: [
    { path: "/social/accounts", name: "Contas Sociais", component: "SocialAccounts", layout: "DashboardLayout" },
  ],
  TRACKING: [
    { path: "/tracking/links", name: "Links de Rastreamento", component: "TrackingLinks", layout: "DashboardLayout" },
  ],
  UTILITY: [
    { path: "/logs", name: "Logs de Execução", component: "ExecutionLogs", layout: "DashboardLayout" },
    { path: "/orchestrator", name: "Orquestrador", component: "OrchestratorDashboard", layout: "DashboardLayout" },
  ],
  ADMIN: [
    { path: "/admin", name: "Dashboard Admin", component: "AdminDashboard", layout: "AdminDashboardLayout" },
    { path: "/admin/dashboard", name: "Dashboard Admin", component: "AdminDashboard", layout: "AdminDashboardLayout" },
    { path: "/admin/users", name: "Usuários", component: "AdminUsers", layout: "AdminDashboardLayout" },
    { path: "/admin/network", name: "Rede", component: "AdminNetwork", layout: "AdminDashboardLayout" },
    { path: "/admin/commissions", name: "Comissões", component: "AdminCommissions", layout: "AdminDashboardLayout" },
    { path: "/admin/payments", name: "Pagamentos", component: "AdminPayments", layout: "AdminDashboardLayout" },
    { path: "/admin/approvals", name: "Aprovações", component: "AdminApprovals", layout: "AdminDashboardLayout" },
    { path: "/admin/delinquents", name: "Inadimplentes", component: "AdminDelinquents", layout: "AdminDashboardLayout" },
    { path: "/admin/materials", name: "Materiais", component: "AdminMaterials", layout: "AdminDashboardLayout" },
    { path: "/admin/logs", name: "Logs", component: "ExecutionLogs", layout: "AdminDashboardLayout" },
    { path: "/admin/schedules", name: "Agendamentos", component: "AdminSchedules", layout: "AdminDashboardLayout" },
    { path: "/admin/settings", name: "Configurações", component: "AdminSettings", layout: "AdminDashboardLayout" },
    { path: "/admin/legacy", name: "Painel legado admin", component: "AdminPanel", layout: "AdminDashboardLayout" },
  ],
};

export default function App() {
  return (
    <TRPCProvider>
      <AuthProvider>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/legacy-review" component={LegacyReview} />

            <Route path="/dashboard" component={Dashboard} />
            <Route path="/profile" component={AffiliateProfile} />
            <Route path="/payments" component={AffiliatePayments} />
            <Route path="/commissions" component={Commissions} />
            <Route path="/bonus" component={BonusRewards} />
            <Route path="/minisite" component={AffiliateMiniSite} />

            <Route path="/agents" component={Agents} />
            <Route path="/agents/dashboard" component={AgentDashboard} />
            <Route path="/agents/config" component={AgentConfiguration} />
            <Route path="/agents/status" component={AgentStatus} />

            <Route path="/content-hub" component={ContentHub} />
            <Route path="/content/generate" component={ContentGeneration} />
            <Route path="/content/generator" component={ContentGenerator} />
            <Route path="/content/image" component={ImageGenerator} />
            <Route path="/content/calendar" component={ContentCalendar} />

            <Route path="/marketplaces" component={Marketplaces} />
            <Route path="/dropshipping/orders" component={DropshippingOrders} />

            <Route path="/marketing/materials" component={MarketingMaterials} />
            <Route path="/marketing/banners" component={BannerManager} />
            <Route path="/marketing/ebooks" component={EbookManager} />

            <Route path="/social/accounts" component={SocialAccounts} />
            <Route path="/tracking/links" component={TrackingLinks} />

            <Route path="/logs" component={ExecutionLogs} />
            <Route path="/orchestrator" component={OrchestratorDashboard} />

            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/admin/network" component={AdminNetwork} />
            <Route path="/admin/commissions" component={AdminCommissions} />
            <Route path="/admin/payments" component={AdminPayments} />
            <Route path="/admin/approvals" component={AdminApprovals} />
            <Route path="/admin/delinquents" component={AdminDelinquents} />
            <Route path="/admin/materials" component={AdminMaterials} />
            <Route path="/admin/logs" component={ExecutionLogs} />
            <Route path="/admin/schedules" component={AdminSchedules} />
            <Route path="/admin/settings" component={AdminSettings} />
            <Route path="/admin/legacy" component={AdminPanel} />

            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </AuthProvider>
    </TRPCProvider>
  );
}
