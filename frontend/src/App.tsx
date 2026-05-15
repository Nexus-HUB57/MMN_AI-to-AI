import { Route, Switch } from "wouter";
import { TRPCProvider } from "./components/trpc-provider";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ContentHub from "./pages/ContentHub";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <TRPCProvider>
      <AuthProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/content-hub" component={ContentHub} />
          <Route component={NotFound} />
        </Switch>
      </AuthProvider>
    </TRPCProvider>
  );
}
