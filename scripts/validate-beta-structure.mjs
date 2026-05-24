#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();

const requiredFiles = [
  'backend/src/_core/events/auditSubscribers.ts',
  'backend/src/index.ts',
  'backend/src/appRouter.ts',
  'backend/src/domains/index.ts',
  'backend/src/domains/README.md',
  'backend/src/domains/shared/eventFactory.ts',
  'backend/src/domains/affiliate/router.ts',
  'backend/src/domains/affiliate/events.ts',
  'backend/src/domains/affiliate/types.ts',
  'backend/src/domains/affiliate/service.ts',
  'backend/src/domains/commissions/router.ts',
  'backend/src/domains/commissions/events.ts',
  'backend/src/domains/commissions/types.ts',
  'backend/src/domains/commissions/repository.ts',
  'backend/src/domains/commissions/service.ts',
  'backend/src/domains/marketplace/router.ts',
  'backend/src/domains/marketplace/events.ts',
  'backend/src/domains/marketplace/types.ts',
  'backend/src/domains/marketplace/repository.ts',
  'backend/src/domains/marketplace/service.ts',
  'backend/src/domains/agent-runtime/router.ts',
  'backend/src/domains/agent-runtime/events.ts',
  'backend/src/domains/billing/router.ts',
  'backend/src/domains/billing/events.ts',
  'backend/src/domains/cron/router.ts',
  'backend/src/domains/cron/events.ts',
  'backend/src/domains/xp/router.ts',
  'backend/src/domains/xp/events.ts',
  'backend/src/domains/auth/router.ts',
  'backend/src/domains/auth/events.ts',
  'tests/unit/eventBus.test.ts',
  'tests/unit/healthRouter.test.ts',
  'tests/unit/commissionsDomainService.test.ts',
  'tests/unit/affiliateDomainService.test.ts',
  'tests/unit/marketplaceDomainService.test.ts',
  'docs/validation-reports/FASE_BETA_CONTINUATION.md',
];

const contentChecks = [
  {
    file: 'backend/src/index.ts',
    includes: ['registerAuditSubscribers', 'registerAuditSubscribers();'],
    label: 'bootstrap registra audit subscribers',
  },
  {
    file: 'backend/src/appRouter.ts',
    includes: [
      './domains/agent-runtime/router',
      './domains/auth/router',
      './domains/marketplace/router',
      './domains/affiliate/router',
      './domains/billing/router',
      './domains/commissions/router',
      './domains/cron/router',
      './domains/xp/router',
    ],
    label: 'appRouter usa camada domains',
  },
  {
    file: 'backend/src/routers/mmnRouter.ts',
    includes: [
      '../domains/affiliate/service',
      'registerAffiliateService',
      'AffiliateAlreadyExistsError',
      'SponsorNotFoundError',
      'AffiliateCreationFailedError',
    ],
    label: 'router MMN delega registro de afiliado ao service do domínio',
  },
  {
    file: 'backend/src/routers/commissionsRouter.ts',
    includes: [
      'publishCommissionApproved',
      'publishCommissionPaid',
      'publishCommissionRejected',
      '../domains/commissions/service',
      'createUpdateStatusAudit',
      'getCommissionStats',
    ],
    label: 'router de comissões usa service do domínio e publica eventos',
  },
  {
    file: 'backend/src/routers/marketplacesRouter.ts',
    includes: [
      '../domains/marketplace/service',
      '../domains/marketplace/repository',
      'connectMarketplaceAccount',
      'queueMarketplaceSync',
      'buildAffiliateMarginsResponse',
      'buildProductAnalyticsResponse',
    ],
    label: 'router de marketplace usa service e repository do domínio',
  },
  {
    file: 'backend/src/routers/agentRuntimeRouter.ts',
    includes: ['publishAgentSessionStarted', 'publishAgentSessionCompleted', 'publishAgentContentGenerated'],
    label: 'agent runtime publica eventos',
  },
  {
    file: 'backend/src/workers/marketplaceSyncWorker.ts',
    includes: ['publishMarketplaceSyncCompleted'],
    label: 'worker de marketplace publica sync completed',
  },
  {
    file: 'backend/src/_core/events/auditSubscribers.ts',
    includes: ['eventBus.subscribe', 'domain-event', 'Audit subscribers registered'],
    label: 'subscribers de auditoria estruturados',
  },
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

const missingFiles = requiredFiles.filter((file) => !existsSync(join(repoRoot, file)));
const contentResults = contentChecks.map((check) => {
  if (!existsSync(join(repoRoot, check.file))) {
    return { ...check, ok: false, missing: check.includes };
  }

  const content = read(check.file);
  const missing = check.includes.filter((needle) => !content.includes(needle));
  return { ...check, ok: missing.length === 0, missing };
});

const report = {
  ok: missingFiles.length === 0 && contentResults.every((result) => result.ok),
  checkedAt: new Date().toISOString(),
  summary: {
    requiredFiles: requiredFiles.length,
    contentChecks: contentChecks.length,
    missingFiles: missingFiles.length,
    failedChecks: contentResults.filter((result) => !result.ok).length,
  },
  missingFiles,
  contentResults,
};

console.log(JSON.stringify(report, null, 2));

if (!report.ok) {
  process.exit(1);
}
