import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import RecommendedProducts from "./pages/RecommendedProducts";
import TrendingProducts from "./pages/TrendingProducts";
import DropshippingOrders from "./pages/DropshippingOrders";
import OrderTracking from "./pages/OrderTracking";
import NotificationCenter from "./pages/NotificationCenter";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/recommended-products"} component={RecommendedProducts} />
      <Route path={"/trending-products"} component={TrendingProducts} />
      <Route path={"/dropshipping"} component={DropshippingOrders} />
      <Route path={"/order-tracking/:orderId"} component={OrderTracking} />
      <Route path={"/notifications"} component={NotificationCenter} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
