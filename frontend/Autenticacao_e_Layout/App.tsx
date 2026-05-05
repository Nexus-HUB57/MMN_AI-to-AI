import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Network from "./pages/Network";
import Commissions from "./pages/Commissions";
import Agent from "./pages/Agent";
import Marketplaces from "./pages/Marketplaces";
import Upgrades from "./pages/Upgrades";
import Payments from "./pages/Payments";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/logout"} component={Logout} />
      <Route path={"/"} component={Home} />
      <Route path={"/network"} component={Network} />
      <Route path={"/commissions"} component={Commissions} />
      <Route path={"/agent"} component={Agent} />
      <Route path={"/marketplaces"} component={Marketplaces} />
      <Route path={"/upgrades"} component={Upgrades} />
      <Route path={"/payments"} component={Payments} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
