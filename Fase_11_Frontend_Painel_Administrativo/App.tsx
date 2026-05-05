import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminCommissions from "./pages/AdminCommissions";
import AdminNetwork from "./pages/AdminNetwork";
import AdminPayments from "./pages/AdminPayments";
import AdminDelinquents from "./pages/AdminDelinquents";
import AdminMaterials from "./pages/AdminMaterials";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/commissions"} component={AdminCommissions} />
      <Route path={"/admin/network"} component={AdminNetwork} />
      <Route path={"/admin/payments"} component={AdminPayments} />
      <Route path={"/admin/delinquents"} component={AdminDelinquents} />
      <Route path={"/admin/materials"} component={AdminMaterials} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
