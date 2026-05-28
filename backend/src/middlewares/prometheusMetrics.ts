/**
 * Prometheus Metrics Middleware — Epic 10.6.1
 *
 * Expõe métricas no formato Prometheus text exposition v0.0.4.
 * Sem dependências externas de biblioteca — serialização manual
 * para manter o bundle leve enquanto a infra ainda não tem prom-client.
 *
 * Endpoint: GET /metrics  (scraping pelo Prometheus / Grafana Agent)
 *
 * Para adicionar prom-client quando a infra estiver pronta:
 *   pnpm --workspace backend add prom-client
 */

import type { Request, Response, NextFunction } from "express";
import { getCacheStats } from "../services/cache-service";

// ============================================================================
// Contadores e gauges em memória
// ============================================================================

const startTime = Date.now();

const counters: Record<string, number> = {
  http_requests_total: 0,
  http_requests_success_total: 0,
  http_requests_error_total: 0,
  trpc_calls_total: 0,
  trpc_errors_total: 0,
  pix_qr_generated_total: 0,
  pix_payments_confirmed_total: 0,
  agent_sessions_started_total: 0,
  agent_sessions_completed_total: 0,
  agent_sessions_failed_total: 0,
  commission_events_total: 0,
};

const histograms: Record<string, { sum: number; count: number; buckets: number[] }> = {
  http_request_duration_ms: {
    sum: 0,
    count: 0,
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
  },
  trpc_call_duration_ms: {
    sum: 0,
    count: 0,
    buckets: [5, 25, 50, 100, 250, 500, 1000, 3000],
  },
};

const histogramCounts: Record<string, Record<number, number>> = {};

for (const key of Object.keys(histograms)) {
  histogramCounts[key] = {};
  for (const bucket of histograms[key].buckets) {
    histogramCounts[key][bucket] = 0;
  }
}

// ============================================================================
// API pública para incrementar contadores
// ============================================================================

export function incrementCounter(name: keyof typeof counters, by = 1): void {
  if (name in counters) {
    counters[name] += by;
  }
}

export function recordDuration(histogramName: string, durationMs: number): void {
  const h = histograms[histogramName];
  if (!h) return;
  h.sum += durationMs;
  h.count += 1;
  for (const bucket of h.buckets) {
    if (durationMs <= bucket) {
      histogramCounts[histogramName][bucket] += 1;
    }
  }
}

// ============================================================================
// Express middleware — mede duração de cada request
// ============================================================================

export function metricsCollector(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  counters.http_requests_total += 1;

  res.on("finish", () => {
    const duration = Date.now() - start;
    recordDuration("http_request_duration_ms", duration);

    if (res.statusCode >= 400) {
      counters.http_requests_error_total += 1;
    } else {
      counters.http_requests_success_total += 1;
    }

    if (req.path.startsWith("/trpc") || req.path.startsWith("/api/trpc")) {
      counters.trpc_calls_total += 1;
      recordDuration("trpc_call_duration_ms", duration);
      if (res.statusCode >= 400) {
        counters.trpc_errors_total += 1;
      }
    }
  });

  next();
}

// ============================================================================
// Serialização Prometheus text format
// ============================================================================

function escapeLabel(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function serializeCounters(): string {
  return Object.entries(counters)
    .map(([name, value]) => {
      return (
        `# HELP ${name} MMN AI counter\n` +
        `# TYPE ${name} counter\n` +
        `${name} ${value}\n`
      );
    })
    .join("\n");
}

function serializeHistograms(): string {
  return Object.entries(histograms)
    .map(([name, h]) => {
      let out =
        `# HELP ${name} MMN AI histogram (ms)\n` +
        `# TYPE ${name} histogram\n`;

      for (const bucket of h.buckets) {
        const count = histogramCounts[name][bucket] ?? 0;
        out += `${name}_bucket{le="${bucket}"} ${count}\n`;
      }

      out += `${name}_bucket{le="+Inf"} ${h.count}\n`;
      out += `${name}_sum ${h.sum}\n`;
      out += `${name}_count ${h.count}\n`;
      return out;
    })
    .join("\n");
}

function serializeProcessMetrics(): string {
  const uptimeSec = (Date.now() - startTime) / 1000;
  const mem = process.memoryUsage();

  return [
    "# HELP process_uptime_seconds Node.js process uptime",
    "# TYPE process_uptime_seconds gauge",
    `process_uptime_seconds ${uptimeSec.toFixed(3)}`,
    "",
    "# HELP process_heap_used_bytes V8 heap used",
    "# TYPE process_heap_used_bytes gauge",
    `process_heap_used_bytes ${mem.heapUsed}`,
    "",
    "# HELP process_heap_total_bytes V8 heap total",
    "# TYPE process_heap_total_bytes gauge",
    `process_heap_total_bytes ${mem.heapTotal}`,
    "",
    "# HELP process_rss_bytes Resident set size",
    "# TYPE process_rss_bytes gauge",
    `process_rss_bytes ${mem.rss}`,
    "",
    "# HELP nodejs_version_info Node.js version",
    "# TYPE nodejs_version_info gauge",
    `nodejs_version_info{version="${process.version}"} 1`,
  ].join("\n");
}

// ============================================================================
// Handler do endpoint /metrics
// ============================================================================

export async function metricsHandler(req: Request, res: Response): Promise<void> {
  let cacheStatsText = "";
  try {
    const stats = await getCacheStats();
    cacheStatsText =
      "\n# HELP cache_keys_total Number of keys in cache\n" +
      "# TYPE cache_keys_total gauge\n" +
      `cache_keys_total ${stats.dbSize}\n`;
  } catch {
    // silently skip cache stats if unavailable
  }

  const body = [
    serializeCounters(),
    serializeHistograms(),
    serializeProcessMetrics(),
    cacheStatsText,
  ].join("\n");

  res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  res.send(body);
}

// ============================================================================
// Snapshot para tRPC (usado pelo observabilityRouter)
// ============================================================================

export function getMetricsSnapshot() {
  const uptimeSec = (Date.now() - startTime) / 1000;
  const mem = process.memoryUsage();
  return {
    counters: { ...counters },
    uptime: uptimeSec,
    memory: {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
    },
    histograms: Object.fromEntries(
      Object.entries(histograms).map(([k, v]) => [
        k,
        { sum: v.sum, count: v.count, avgMs: v.count > 0 ? v.sum / v.count : 0 },
      ]),
    ),
  };
}
