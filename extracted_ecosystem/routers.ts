// routers.ts - tRPC Router Configuration
// Nexus-HUB57 MMN AI-to-AI Platform

import { router } from './trpc';
import { orchestrorRouter } from './routers/orquestrador';

// Import other routers
// import { dashboardRouter } from './routers/dashboard';
// import { agentsRouter } from './routers/agents';
// import { governanceRouter } from './routers/governance';
// import { marketplaceRouter } from './routers/marketplace';

export const appRouter = router({
  // Orquestrador - Multi-Module AI Agent System
  orquestrador: orchestrorRouter,

  // Future routers will be added here
  // dashboard: dashboardRouter,
  // agents: agentsRouter,
  // governance: governanceRouter,
  // marketplace: marketplaceRouter,
});

export type AppRouter = typeof appRouter;