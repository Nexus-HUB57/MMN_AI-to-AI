import React, { Suspense } from 'react';
import { Route, Switch } from "wouter";
import { TRPCProvider } from "./components/trpc-provider";
import { AuthProvider } from "./contexts/AuthContext";

const Home = React.lazy(() => import("./pages/Home"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const ContentHub = React.lazy(() => import("./pages/ContentHub"));
const OrchestratorDashboard = React.lazy(() => import("./pages/OrchestratorDashboard"));
const LegacyReview = React.lazy(() => import("./pages/LegacyReview"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <TRPCProvider>
      <AuthProvider>
        <Suspense fallback={<div>Carregando...</div>}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/content-hub" component={ContentHub} />
            <Route path="/orchestrator" component={OrchestratorDashboard} />
            <Route path="/legacy-review" component={LegacyReview} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </AuthProvider>
    </TRPCProvider>
  );
}
