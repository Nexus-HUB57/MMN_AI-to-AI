/* UX_MAX_v1 */
import { Toaster } from "sonner";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { TRPCProvider } from "@/components/trpc-provider";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { Route, Switch } from "wouter";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import Logout from "@/pages/Logout";
import Cadastro from "@/pages/Cadastro";
import Dashboard from "@/pages/Dashboard";
import Marketplaces from "@/pages/Marketplaces";
import Estoque from "@/pages/Estoque";
import AffiliateMiniSite from "@/pages/AffiliateMiniSite";
import MinhaLoja from "@/pages/MinhaLoja";
import PixCheckout from "@/pages/PixCheckout";
import PixHistory from "@/pages/PixHistory";
import PacksMarketplace from "@/pages/PacksMarketplace";
import SkillsMarketplace from "@/pages/SkillsMarketplace";
import Upgrades from "@/pages/Upgrades";
import Network from "@/pages/Network";
import Payments from "@/pages/Payments";
import CareerProgress from "@/pages/CareerProgress";
import ContentHub from "@/pages/ContentHub";
import ContentCalendar from "@/pages/ContentCalendar";
import MarketingMaterials from "@/pages/MarketingMaterials";
import ProfileSettings from "@/pages/ProfileSettings";
import PartnersAccessGuard from "@/components/PartnersAccessGuard";
import EbookManager from "@/pages/EbookManager";
import ImageGenerator from "@/pages/ImageGenerator";
import ContentGeneration from "@/pages/ContentGeneration";
import ContentGenerator from "@/pages/ContentGenerator";
import TrackingLinks from "@/pages/TrackingLinks";
import MarketplaceEbooks from "@/pages/MarketplaceEbooks";
import SisuPanel from "@/pages/SisuPanel";
import DropshippingOrders from "@/pages/DropshippingOrders";
import OrderTracking from "@/pages/OrderTracking";
import Utilities from "@/pages/Utilities";
import Commissions from "@/pages/Commissions";
import BonusPage from "@/pages/BonusPage";
import Agents from "@/pages/Agents";
import AgentsSync from "@/pages/AgentsSync";
import OrchestratorDashboard from "@/pages/OrchestratorDashboard";
import SocialAccounts from "@/pages/SocialAccounts";
import PartnersDashboardPage from "@/pages/PartnersDashboardPage";
import Subscriptions from "@/pages/Subscriptions";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminNetwork from "@/pages/AdminNetwork";
import AdminPayments from "@/pages/AdminPayments";
import AdminScheduler from "@/pages/AdminScheduler";
import AdminSchedules from "@/pages/AdminSchedules";
import AdminMaterials from "@/pages/AdminMaterials";
import AdminDelinquents from "@/pages/AdminDelinquents";
import AdminCommissions from "@/pages/AdminCommissions";
import AdminApprovals from "@/pages/AdminApprovals";
import AdminRuntime from "@/pages/AdminRuntime";
import AdminSettings from "@/pages/AdminSettings";
import AdminPackTickets from "@/pages/AdminPackTickets";
import AdminPanel from "@/pages/AdminPanel";
import AdminSkills from "@/pages/AdminSkills";
import AdminAgentDetails from "@/pages/AdminAgentDetails";
import AdminAcademia from "@/pages/AdminAcademia";
import AdminAcademiaAnalytics from "@/pages/AdminAcademiaAnalytics";
import AcademiaHub from "@/pages/AcademiaHub";
import AcademiaSection from "@/pages/AcademiaSection";
import AcademiaLesson from "@/pages/AcademiaLesson";
import LabChatbot from "@/pages/LabChatbot";
import NotFound from "@/pages/NotFound";
import CommandPalette from "@/components/ux/CommandPalette";
import QuickAgentDock from "@/components/ux/QuickAgentDock";
import RouteProgress from "@/components/ux/RouteProgress";
import WelcomeTour from "@/components/ux/WelcomeTour";

function Router() {
  return (
    <><RouteProgress /><CommandPalette /><QuickAgentDock /><WelcomeTour /><Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/recuperar-senha" component={ForgotPassword} />
      <Route path="/logout" component={Logout} />
      <Route path="/cadastro" component={Cadastro} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/afiliado" component={Dashboard} />
      <Route path="/marketplaces" component={Marketplaces} />
      <Route path="/marketplaces/ebooks">{() => { if (typeof window !== "undefined") { window.location.replace("/marketplaces"); } return null; }}</Route>
      <Route path="/estoque" component={Estoque} />
      <Route path="/minisite" component={MinhaLoja} />
      <Route path="/minha-loja" component={MinhaLoja} />
      <Route path="/minha-loja/:code" component={MinhaLoja} />
      <Route path="/afiliado/:code" component={MinhaLoja} />
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
      <Route path="/partners"><PartnersAccessGuard><PartnersDashboardPage /></PartnersAccessGuard></Route>
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/academia/analytics" component={AdminAcademiaAnalytics} />
      <Route path="/admin/academia" component={AdminAcademia} />
      <Route path="/academia" component={AcademiaHub} />
      <Route path="/academia/ead/:slug" component={AcademiaSection} />
      <Route path="/academia/ead/:slug/:lessonId" component={AcademiaLesson} />
      <Route path="/academia/lab-nexus" component={LabChatbot} />
      <Route path="/academia/lab-nexus/chatbot" component={LabChatbot} />
      <Route path="/lab/chatbot" component={LabChatbot} />
      <Route path="/content-hub" component={ContentHub} />
      <Route path="/content/calendar" component={ContentCalendar} />
      <Route path="/marketing/materials" component={MarketingMaterials} />
      <Route path="/profile" component={ProfileSettings} />
      <Route path="/content/generator" component={ContentGenerator} />
      <Route path="/content/generation" component={ContentGeneration} />
      <Route path="/content/image" component={ImageGenerator} />
      <Route path="/marketing/ebooks" component={EbookManager} />
      <Route path="/tracking/links" component={TrackingLinks} />
      <Route path="/social/accounts" component={SocialAccounts} />
      <Route path="/sisu" component={SisuPanel} />
      <Route path="/dropshipping/orders" component={DropshippingOrders} />
      <Route path="/dropshipping/orders/:orderId" component={OrderTracking} />
      <Route path="/order-tracking/:orderId" component={OrderTracking} />
      <Route path="/utilities" component={Utilities} />

      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/network" component={AdminNetwork} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/scheduler" component={AdminScheduler} />
      <Route path="/admin/schedules" component={AdminSchedules} />
      <Route path="/admin/materials" component={AdminMaterials} />
      <Route path="/admin/delinquents" component={AdminDelinquents} />
      <Route path="/admin/commissions" component={AdminCommissions} />
      <Route path="/admin/approvals" component={AdminApprovals} />
      <Route path="/admin/status" component={AdminRuntime} />
      <Route path="/admin/runtime" component={AdminRuntime} />
      <Route path="/admin/config" component={AdminSettings} />
      <Route path="/admin/pack-tickets" component={AdminPackTickets} />
          <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/panel" component={AdminPanel} />
      <Route path="/admin/skills" component={AdminSkills} />
      <Route path="/admin/agents/:agentId" component={AdminAgentDetails} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch></>
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
