import { Toaster } from "sonner";
import { TRPCProvider } from "@/components/trpc-provider";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { Route, Switch } from "wouter";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Logout from "@/pages/Logout";
import Cadastro from "@/pages/Cadastro";
import Dashboard from "@/pages/Dashboard";
import Marketplaces from "@/pages/Marketplaces";
import Estoque from "@/pages/Estoque";
import AffiliateMiniSite from "@/pages/AffiliateMiniSite";
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
import AdminAcademia from "@/pages/AdminAcademia";
import AdminMeetings from "@/pages/AdminMeetings";
import AdminGovernance from "@/pages/AdminGovernance";
import AcademiaHub from "@/pages/AcademiaHub";
import AcademiaSection from "@/pages/AcademiaSection";
import AcademiaLesson from "@/pages/AcademiaLesson";
import MeetingHub from "@/pages/MeetingHub";
import LabChatbot from "@/pages/LabChatbot";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
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
      <Route path="/partners" component={PartnersDashboardPage} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/academia" component={AdminAcademia} />
      <Route path="/admin/meetings" component={AdminMeetings} />
      <Route path="/admin/governance" component={AdminGovernance} />
      <Route path="/academia" component={AcademiaHub} />
      <Route path="/academia/meetings" component={MeetingHub} />
      <Route path="/academia/ead/:slug" component={AcademiaSection} />
      <Route path="/academia/ead/:slug/:lessonId" component={AcademiaLesson} />
      <Route path="/academia/lab-nexus" component={LabChatbot} />
      <Route path="/academia/lab-nexus/chatbot" component={LabChatbot} />
      <Route path="/lab/chatbot" component={LabChatbot} />
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
