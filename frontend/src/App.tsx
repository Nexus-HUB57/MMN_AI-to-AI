import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { TRPCProvider } from "@/components/trpc-provider";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { Route, Switch } from "wouter";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Logout = lazy(() => import("@/pages/Logout"));
const Cadastro = lazy(() => import("@/pages/Cadastro"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Marketplaces = lazy(() => import("@/pages/Marketplaces"));
const Estoque = lazy(() => import("@/pages/Estoque"));
const AffiliateMiniSite = lazy(() => import("@/pages/AffiliateMiniSite"));
const PixCheckout = lazy(() => import("@/pages/PixCheckout"));
const PixHistory = lazy(() => import("@/pages/PixHistory"));
const PacksMarketplace = lazy(() => import("@/pages/PacksMarketplace"));
const SkillsMarketplace = lazy(() => import("@/pages/SkillsMarketplace"));
const Upgrades = lazy(() => import("@/pages/Upgrades"));
const Network = lazy(() => import("@/pages/Network"));
const Payments = lazy(() => import("@/pages/Payments"));
const CareerProgress = lazy(() => import("@/pages/CareerProgress"));
const ContentHub = lazy(() => import("@/pages/ContentHub"));
const ContentCalendar = lazy(() => import("@/pages/ContentCalendar"));
const MarketingMaterials = lazy(() => import("@/pages/MarketingMaterials"));
const TrackingLinks = lazy(() => import("@/pages/TrackingLinks"));
const MarketplaceEbooks = lazy(() => import("@/pages/MarketplaceEbooks"));
const SisuPanel = lazy(() => import("@/pages/SisuPanel"));
const DropshippingOrders = lazy(() => import("@/pages/DropshippingOrders"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
const Utilities = lazy(() => import("@/pages/Utilities"));
const Commissions = lazy(() => import("@/pages/Commissions"));
const BonusPage = lazy(() => import("@/pages/BonusPage"));
const Agents = lazy(() => import("@/pages/Agents"));
const AgentsSync = lazy(() => import("@/pages/AgentsSync"));
const OrchestratorDashboard = lazy(() => import("@/pages/OrchestratorDashboard"));
const SocialAccounts = lazy(() => import("@/pages/SocialAccounts"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.08),transparent_45%),linear-gradient(180deg,#020617,#0f172a)] px-6 text-white">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
        <Loader2 className="h-5 w-5 animate-spin text-quantum-cyan" />
        <span className="text-sm text-slate-200">Carregando painel…</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/logout" component={Logout} />
        <Route path="/cadastro" component={Cadastro} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/marketplaces" component={Marketplaces} />
        <Route path="/marketplaces/ebooks" component={MarketplaceEbooks} />
        <Route path="/estoque" component={Estoque} />
        <Route path="/minisite" component={AffiliateMiniSite} />
        <Route path="/afiliado/:code" component={AffiliateMiniSite} />
        <Route path="/pix/checkout" component={PixCheckout} />
        <Route path="/pix/history" component={PixHistory} />
        <Route path="/packs" component={PacksMarketplace} />
        <Route path="/skills" component={SkillsMarketplace} />
        <Route path="/upgrades" component={Upgrades} />
        <Route path="/network" component={Network} />
        <Route path="/payments" component={Payments} />
        <Route path="/commissions" component={Commissions} />
        <Route path="/career" component={CareerProgress} />
        <Route path="/bonus" component={BonusPage} />
        <Route path="/agents" component={Agents} />
        <Route path="/agents/sync" component={AgentsSync} />
        <Route path="/orchestrator" component={OrchestratorDashboard} />
        <Route path="/content-hub" component={ContentHub} />
        <Route path="/content/calendar" component={ContentCalendar} />
        <Route path="/marketing/materials" component={MarketingMaterials} />
        <Route path="/tracking/links" component={TrackingLinks} />
        <Route path="/social/accounts" component={SocialAccounts} />
        <Route path="/sisu" component={SisuPanel} />
        <Route path="/dropshipping/orders" component={DropshippingOrders} />
        <Route path="/dropshipping/orders/:orderId" component={OrderTracking} />
        <Route path="/order-tracking/:orderId" component={OrderTracking} />
        <Route path="/utilities" component={Utilities} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundaryWrapper>
      <TRPCProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TRPCProvider>
    </ErrorBoundaryWrapper>
  );
}
