/**
 * OpenTelemetry Instrumentation Setup (AG-34)
 * Distributed tracing and metrics collection for MMN AI-to-AI system
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { trace, metrics, SpanStatusCode, context } from "@opentelemetry/api";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

// Service name and version
const SERVICE_NAME = "mmn-ai-to-ai";
const SERVICE_VERSION = process.env.npm_package_version || "1.0.0";
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";

// Resource configuration
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  "deployment.environment": process.env.NODE_ENV || "development",
  "service.instance.id": process.env.HOSTNAME || `instance-${Math.random().toString(36).slice(2)}`,
});

// Trace exporter (OTLP HTTP)
const traceExporter = new OTLPTraceExporter({
  url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  timeoutMillis: 5000,
});

// Metric exporter (OTLP HTTP)
const metricExporter = new OTLPMetricExporter({
  url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
  timeoutMillis: 5000,
});

// Metric reader with periodic export (every 30 seconds)
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 30000,
});

// Initialize SDK with auto-instrumentation
const sdk = new NodeSDK({
  resource,
  traceExporter: new BatchSpanProcessor(traceExporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
    exportTimeoutMillis: 30000,
  }),
  metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Enable specific instrumentations
      "@opentelemetry/instrumentation-fs": { enabled: false }, // Disable noisy fs spans
      "@opentelemetry/instrumentation-http": {
        enabled: true,
        ignoreIncomingPaths: ["/health", "/metrics"],
      },
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-mysql2": { enabled: true },
      "@opentelemetry/instrumentation-redis-4": { enabled: true },
      "@opentelemetry/instrumentation-bull": { enabled: true },
    }),
  ],
});

// Start SDK
sdk.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk.shutdown()
    .then(() => console.log("[OpenTelemetry] SDK shut down successfully"))
    .catch((error) => console.error("[OpenTelemetry] Error shutting down SDK", error))
    .finally(() => process.exit(0));
});

// Export tracer and meter
export const tracer = trace.getTracer(SERVICE_NAME, SERVICE_VERSION);
export const meter = metrics.getMeter(SERVICE_NAME, SERVICE_VERSION);

// Common spans for tRPC procedures
export async function traceTRPCProcedure<T>(
  procedureName: string,
  routerName: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(`trpc.${routerName}.${procedureName}`, async (span) => {
    const startTime = Date.now();
    try {
      span.setAttribute("rpc.system", "trpc");
      span.setAttribute("rpc.method", procedureName);
      span.setAttribute("rpc.service", routerName);

      const result = await fn();

      span.setAttribute("rpc.status", "success");
      span.setAttribute("rpc.duration_ms", Date.now() - startTime);
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      span.setAttribute("rpc.status", "error");
      span.setAttribute("rpc.duration_ms", Date.now() - startTime);
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Common spans for database operations
export async function traceDatabaseOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(`db.${operation}.${table}`, async (span) => {
    const startTime = Date.now();
    try {
      span.setAttribute("db.system", "mysql");
      span.setAttribute("db.operation", operation);
      span.setAttribute("db.sql.table", table);

      const result = await fn();

      span.setAttribute("db.duration_ms", Date.now() - startTime);
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      span.setAttribute("db.status", "error");
      span.setAttribute("db.duration_ms", Date.now() - startTime);
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Common spans for AI/LLM operations
export async function traceAIOperation<T>(
  operation: string,
  model?: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(`ai.${operation}`, async (span) => {
    const startTime = Date.now();
    try {
      span.setAttribute("ai.operation", operation);
      if (model) span.setAttribute("ai.model", model);

      const result = await fn();

      span.setAttribute("ai.duration_ms", Date.now() - startTime);
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      span.setAttribute("ai.status", "error");
      span.setAttribute("ai.duration_ms", Date.now() - startTime);
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
}

// Metrics definitions
export const metricsDefinitions = {
  // HTTP metrics
  httpRequestsTotal: meter.createCounter("http_requests_total", {
    description: "Total number of HTTP requests",
  }),
  httpRequestDuration: meter.createHistogram("http_request_duration_ms", {
    description: "HTTP request duration in milliseconds",
    unit: "ms",
  }),

  // Database metrics
  dbQueriesTotal: meter.createCounter("db_queries_total", {
    description: "Total number of database queries",
  }),
  dbQueryDuration: meter.createHistogram("db_query_duration_ms", {
    description: "Database query duration in milliseconds",
    unit: "ms",
  }),

  // tRPC metrics
  trpcProceduresTotal: meter.createCounter("trpc_procedures_total", {
    description: "Total number of tRPC procedure calls",
  }),
  trpcProcedureDuration: meter.createHistogram("trpc_procedure_duration_ms", {
    description: "tRPC procedure duration in milliseconds",
    unit: "ms",
  }),

  // Agent metrics
  agentTasksTotal: meter.createCounter("agent_tasks_total", {
    description: "Total number of agent tasks",
  }),
  agentTaskDuration: meter.createHistogram("agent_task_duration_ms", {
    description: "Agent task duration in milliseconds",
    unit: "ms",
  }),
  activeAgentsGauge: meter.createObservableGauge("active_agents", {
    description: "Number of currently active agents",
  }),

  // Queue metrics
  queueJobsTotal: meter.createCounter("queue_jobs_total", {
    description: "Total number of queue jobs",
  }),
  queueJobDuration: meter.createHistogram("queue_job_duration_ms", {
    description: "Queue job duration in milliseconds",
    unit: "ms",
  }),
  queueJobErrorsTotal: meter.createCounter("queue_job_errors_total", {
    description: "Total number of queue job errors",
  }),

  // AI/LLM metrics
  llmRequestsTotal: meter.createCounter("llm_requests_total", {
    description: "Total number of LLM requests",
  }),
  llmTokensUsed: meter.createCounter("llm_tokens_used", {
    description: "Total number of LLM tokens used",
  }),
  llmRequestDuration: meter.createHistogram("llm_request_duration_ms", {
    description: "LLM request duration in milliseconds",
    unit: "ms",
  }),
  llmRequestErrorsTotal: meter.createCounter("llm_request_errors_total", {
    description: "Total number of LLM request errors",
  }),

  // Business metrics
  affiliateRegistrationsTotal: meter.createCounter("affiliate_registrations_total", {
    description: "Total number of affiliate registrations",
  }),
  ordersTotal: meter.createCounter("orders_total", {
    description: "Total number of orders",
  }),
  commissionsTotal: meter.createCounter("commissions_total", {
    description: "Total number of commissions processed",
    unit: "currency",
  }),
};

// Register observable gauges with callbacks
metricsDefinitions.activeAgentsGauge.addCallback((result) => {
  // This would be updated by the agent heartbeat system
  result.observe(0, { status: "active" });
});

// Export SDK for external use
export { sdk };

export default sdk;