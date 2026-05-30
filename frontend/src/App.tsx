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
import PacksMarketplace from "@/pages/PacksMarketplace";
import SkillsMarketplace from "@/pages/SkillsMarketplace";
import Upgrades from "@/pages/Upgrades";
import Network from "@/pages/Network";
import Payments from "@/pages/Payments";
import CareerProgress from "@/pages/CareerProgress";
import ContentHub from "@/pages/ContentHub";
import Agents from "@/pages/Agents";
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
      <Route path="/estoque" component={Estoque} />
      <Route path="/minisite" component={AffiliateMiniSite} />
      <Route path="/afiliado/:code" component={AffiliateMiniSite} />
      <Route path="/pix/checkout" component={PixCheckout} />
      <Route path="/packs" component={PacksMarketplace} />
      <Route path="/skills" component={SkillsMarketplace} />
      <Route path="/upgrades" component={Upgrades} />
      <Route path="/network" component={Network} />
      <Route path="/payments" component={Payments} />
      <Route path="/career" component={CareerProgress} />
      <Route path="/content-hub" component={ContentHub} />
      <Route path="/agents" component={Agents} />
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
