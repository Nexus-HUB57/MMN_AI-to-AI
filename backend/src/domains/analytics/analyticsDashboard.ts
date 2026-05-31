/**
 * Nexus Partners Pack - Sistema de Analytics e Gráficos de Tendências
 * Dashboard com métricas em tempo real e visualização de tendências
 */

import { EventEmitter } from 'events';

// Types
export type TrendPeriod = '7d' | '30d' | '90d' | '1y' | 'all';
export type MetricType = 'commissions' | 'sales' | 'network_growth' | 'xp_progress' | 'revenue';
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'gauge';

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TrendData {
  metric: MetricType;
  period: TrendPeriod;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  changeDirection: 'up' | 'down' | 'stable';
  dataPoints: TimeSeriesPoint[];
  predictions?: TimeSeriesPoint[];
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  subtitle?: string;
  metrics: MetricType[];
  period: TrendPeriod;
  showLegend: boolean;
  showTooltip: boolean;
  showGrid: boolean;
  animated: boolean;
  colors?: string[];
  thresholds?: {
    warning?: number;
    critical?: number;
    goal?: number;
  };
}

export interface AnalyticsEvent {
  type: 'metric_update' | 'trend_alert' | 'anomaly_detected' | 'goal_reached';
  timestamp: Date;
  data: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'progress' | 'activity';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: ChartConfig | MetricDisplayConfig | TableConfig;
}

export interface MetricDisplayConfig {
  value: number;
  previousValue?: number;
  format: 'currency' | 'number' | 'percentage' | 'compact';
  label: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
}

export interface TableConfig {
  columns: Array<{
    key: string;
    label: string;
    format?: 'currency' | 'date' | 'number';
    sortable?: boolean;
  }>;
  data: Record<string, any>[];
  pageSize?: number;
}

// Storage for analytics data
interface MetricSnapshot {
  metric: MetricType;
  value: number;
  timestamp: Date;
  affiliateId?: number;
}

/**
 * Analytics Data Store
 * Handles time-series data storage and aggregation
 */
export class AnalyticsStore extends EventEmitter {
  private metrics: Map<string, MetricSnapshot[]> = new Map();
  private maxDataPoints = 1000;

  /**
   * Record a metric value
   */
  recordMetric(
    metric: MetricType,
    value: number,
    affiliateId?: number,
    metadata?: Record<string, any>
  ): void {
    const key = affiliateId ? `${metric}_${affiliateId}` : metric;

    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const snapshots = this.metrics.get(key)!;
    snapshots.push({
      metric,
      value,
      timestamp: new Date(),
      affiliateId,
    });

    // Prune old data points
    if (snapshots.length > this.maxDataPoints) {
      snapshots.shift();
    }

    this.emit('metric:recorded', { metric, value, affiliateId });
  }

  /**
   * Get metric data for a period
   */
  getMetricData(
    metric: MetricType,
    period: TrendPeriod,
    affiliateId?: number
  ): TimeSeriesPoint[] {
    const key = affiliateId ? `${metric}_${affiliateId}` : metric;
    const snapshots = this.metrics.get(key) || [];

    const cutoffDate = this.getCutoffDate(period);
    const filtered = snapshots.filter(s => s.timestamp >= cutoffDate);

    return filtered.map(s => ({
      timestamp: s.timestamp,
      value: s.value,
    }));
  }

  /**
   * Aggregate metrics
   */
  aggregate(metric: MetricType, period: TrendPeriod, aggFn: 'sum' | 'avg' | 'max' | 'min'): number {
    const data = this.getMetricData(metric, period);
    if (data.length === 0) return 0;

    const values = data.map(d => d.value);
    switch (aggFn) {
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'max': return Math.max(...values);
      case 'min': return Math.min(...values);
    }
  }

  private getCutoffDate(period: TrendPeriod): Date {
    const now = new Date();
    switch (period) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case 'all': return new Date(0);
    }
  }

  /**
   * Clear old data
   */
  pruneData(daysToKeep: number = 90): void {
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    this.metrics.forEach((snapshots, key) => {
      const filtered = snapshots.filter(s => s.timestamp >= cutoff);
      this.metrics.set(key, filtered);
    });
  }
}

/**
 * Trend Analyzer
 * Calculates trends, predictions, and anomalies
 */
export class TrendAnalyzer {
  /**
   * Calculate trend from time series data
   */
  calculateTrend(data: TimeSeriesPoint[]): {
    slope: number;
    direction: 'up' | 'down' | 'stable';
    strength: number; // 0-1
    volatility: number;
  } {
    if (data.length < 2) {
      return { slope: 0, direction: 'stable', strength: 0, volatility: 0 };
    }

    const n = data.length;
    const xMean = (n - 1) / 2;
    const yMean = data.reduce((sum, d) => sum + d.value, 0) / n;

    let numerator = 0;
    let denominator = 0;
    let variance = 0;

    data.forEach((point, i) => {
      const xDiff = i - xMean;
      const yDiff = point.value - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
      variance += yDiff * yDiff;
    });

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const rSquared = denominator !== 0 ? (numerator * numerator) / (denominator * variance) : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (slope > 0.01) direction = 'up';
    else if (slope < -0.01) direction = 'down';

    const stdDev = Math.sqrt(variance / n);
    const volatility = stdDev / (yMean || 1);

    return {
      slope,
      direction,
      strength: Math.min(Math.abs(rSquared), 1),
      volatility: Math.min(volatility, 1),
    };
  }

  /**
   * Simple linear prediction
   */
  predict(data: TimeSeriesPoint[], futurePoints: number = 7): TimeSeriesPoint[] {
    const trend = this.calculateTrend(data);
    if (data.length === 0) return [];

    const lastTimestamp = data[data.length - 1].timestamp;
    const lastValue = data[data.length - 1].value;
    const interval = this.getAverageInterval(data);

    const predictions: TimeSeriesPoint[] = [];

    for (let i = 1; i <= futurePoints; i++) {
      const timestamp = new Date(lastTimestamp.getTime() + interval * i);
      const value = Math.max(0, lastValue + trend.slope * i);
      predictions.push({ timestamp, value });
    }

    return predictions;
  }

  /**
   * Detect anomalies using standard deviation
   */
  detectAnomalies(data: TimeSeriesPoint[], threshold: number = 2): Array<{
    point: TimeSeriesPoint;
    type: 'spike' | 'drop' | 'unusual';
  }> {
    if (data.length < 10) return [];

    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    const anomalies: Array<{ point: TimeSeriesPoint; type: 'spike' | 'drop' | 'unusual' }> = [];

    data.forEach(point => {
      const zScore = Math.abs((point.value - mean) / (stdDev || 1));
      if (zScore > threshold) {
        let type: 'spike' | 'drop' | 'unusual' = 'unusual';
        if (point.value > mean * 1.5) type = 'spike';
        else if (point.value < mean * 0.5) type = 'drop';
        anomalies.push({ point, type });
      }
    });

    return anomalies;
  }

  /**
   * Calculate moving average
   */
  movingAverage(data: TimeSeriesPoint[], window: number): TimeSeriesPoint[] {
    if (data.length < window) return data;

    const result: TimeSeriesPoint[] = [];

    for (let i = window - 1; i < data.length; i++) {
      const windowData = data.slice(i - window + 1, i + 1);
      const avgValue = windowData.reduce((sum, d) => sum + d.value, 0) / window;
      result.push({
        timestamp: data[i].timestamp,
        value: avgValue,
      });
    }

    return result;
  }

  private getAverageInterval(data: TimeSeriesPoint[]): number {
    if (data.length < 2) return 24 * 60 * 60 * 1000; // Default: 1 day

    const intervals: number[] = [];
    for (let i = 1; i < data.length; i++) {
      intervals.push(data[i].timestamp.getTime() - data[i - 1].timestamp.getTime());
    }
    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }
}

/**
 * Analytics Dashboard
 * Manages dashboard configuration and data
 */
export class AnalyticsDashboard extends EventEmitter {
  private store: AnalyticsStore;
  private analyzer: TrendAnalyzer;
  private widgets: Map<string, DashboardWidget> = new Map();
  private updateInterval: number = 300000; // 5 minutes

  constructor() {
    super();
    this.store = new AnalyticsStore();
    this.analyzer = new TrendAnalyzer();
    this.initializeDefaultWidgets();
  }

  /**
   * Initialize default dashboard widgets
   */
  private initializeDefaultWidgets(): void {
    this.widgets.set('commissions_trend', {
      id: 'commissions_trend',
      type: 'chart',
      title: 'Tendência de Comissões',
      position: { x: 0, y: 0, w: 6, h: 3 },
      config: {
        id: 'commissions_trend',
        type: 'area',
        title: 'Tendência de Comissões',
        metrics: ['commissions'],
        period: '30d',
        showLegend: false,
        showTooltip: true,
        showGrid: true,
        animated: true,
        colors: ['#2563eb', '#10b981'],
      } as ChartConfig,
    });

    this.widgets.set('revenue_summary', {
      id: 'revenue_summary',
      type: 'metric',
      title: 'Receita Total',
      position: { x: 6, y: 0, w: 3, h: 1 },
      config: {
        value: 0,
        format: 'currency',
        label: 'Receita Total',
        trend: 'up',
      } as MetricDisplayConfig,
    });

    this.widgets.set('network_growth', {
      id: 'network_growth',
      type: 'chart',
      title: 'Crescimento da Rede',
      position: { x: 0, y: 3, w: 4, h: 3 },
      config: {
        id: 'network_growth',
        type: 'line',
        title: 'Crescimento da Rede',
        metrics: ['network_growth'],
        period: '30d',
        showLegend: true,
        showTooltip: true,
        showGrid: true,
        animated: true,
        colors: ['#8b5cf6'],
      } as ChartConfig,
    });

    this.widgets.set('xp_progress', {
      id: 'xp_progress',
      type: 'progress',
      title: 'Progresso XP',
      position: { x: 4, y: 3, w: 4, h: 3 },
      config: {
        id: 'xp_progress',
        type: 'area',
        title: 'Progresso XP',
        metrics: ['xp_progress'],
        period: '30d',
        showLegend: false,
        showTooltip: true,
        showGrid: false,
        animated: true,
        colors: ['#f59e0b'],
      } as ChartConfig,
    });

    this.widgets.set('sales_trend', {
      id: 'sales_trend',
      type: 'chart',
      title: 'Tendência de Vendas',
      position: { x: 8, y: 0, w: 4, h: 6 },
      config: {
        id: 'sales_trend',
        type: 'bar',
        title: 'Tendência de Vendas',
        metrics: ['sales'],
        period: '30d',
        showLegend: false,
        showTooltip: true,
        showGrid: true,
        animated: true,
        colors: ['#ef4444', '#f97316', '#eab308'],
      } as ChartConfig,
    });
  }

  /**
   * Record metric data
   */
  recordMetric(metric: MetricType, value: number, affiliateId?: number): void {
    this.store.recordMetric(metric, value, affiliateId);
  }

  /**
   * Get trend data for a metric
   */
  getTrendData(metric: MetricType, period: TrendPeriod, affiliateId?: number): TrendData {
    const dataPoints = this.store.getMetricData(metric, period, affiliateId);
    const trend = this.analyzer.calculateTrend(dataPoints);
    const predictions = this.analyzer.predict(dataPoints);

    const currentValue = dataPoints.length > 0
      ? dataPoints[dataPoints.length - 1].value
      : 0;

    const previousValue = dataPoints.length > 1
      ? dataPoints[0].value
      : currentValue;

    const changePercentage = previousValue !== 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    return {
      metric,
      period,
      currentValue,
      previousValue,
      changePercentage,
      changeDirection: trend.direction,
      dataPoints,
      predictions: predictions.length > 0 ? predictions : undefined,
    };
  }

  /**
   * Get chart data for dashboard
   */
  getChartData(chartId: string): {
    chart: ChartConfig | null;
    data: TimeSeriesPoint[];
    trend: ReturnType<TrendAnalyzer['calculateTrend']>;
    predictions?: TimeSeriesPoint[];
    anomalies?: Array<{ point: TimeSeriesPoint; type: 'spike' | 'drop' | 'unusual' }>;
  } {
    const widget = this.widgets.get(chartId);
    if (!widget || widget.type !== 'chart') {
      return { chart: null, data: [], trend: { slope: 0, direction: 'stable', strength: 0, volatility: 0 } };
    }

    const config = widget.config as ChartConfig;
    const allData: TimeSeriesPoint[] = [];

    for (const metric of config.metrics) {
      const metricData = this.store.getMetricData(metric, config.period);
      allData.push(...metricData);
    }

    const trend = this.analyzer.calculateTrend(allData);
    const predictions = this.analyzer.predict(allData);
    const anomalies = this.analyzer.detectAnomalies(allData);

    return {
      chart: config,
      data: allData,
      trend,
      predictions: predictions.length > 0 ? predictions : undefined,
      anomalies: anomalies.length > 0 ? anomalies : undefined,
    };
  }

  /**
   * Get metric display data
   */
  getMetricData(metricId: string): MetricDisplayConfig | null {
    const widget = this.widgets.get(metricId);
    if (!widget || widget.type !== 'metric') {
      return null;
    }
    return widget.config as MetricDisplayConfig;
  }

  /**
   * Get all widgets
   */
  getWidgets(): DashboardWidget[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Update widget configuration
   */
  updateWidget(widgetId: string, config: Partial<DashboardWidget>): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      this.widgets.set(widgetId, { ...widget, ...config });
      this.emit('widget:updated', { widgetId });
    }
  }

  /**
   * Add custom widget
   */
  addWidget(widget: DashboardWidget): void {
    this.widgets.set(widget.id, widget);
    this.emit('widget:added', widget);
  }

  /**
   * Remove widget
   */
  removeWidget(widgetId: string): boolean {
    return this.widgets.delete(widgetId);
  }

  /**
   * Get dashboard summary
   */
  getSummary(): {
    totalMetrics: number;
    widgetsCount: number;
    lastUpdate: Date;
    alerts: AnalyticsEvent[];
  } {
    const alerts: AnalyticsEvent[] = [];

    // Check for anomalies and generate alerts
    ['commissions', 'sales', 'network_growth'].forEach(metric => {
      const data = this.store.getMetricData(metric as MetricType, '7d');
      const anomalies = this.analyzer.detectAnomalies(data);

      anomalies.forEach(anomaly => {
        alerts.push({
          type: 'anomaly_detected',
          timestamp: anomaly.point.timestamp,
          data: { metric, ...anomaly },
          severity: 'warning',
        });
      });
    });

    return {
      totalMetrics: this.store.metrics.size,
      widgetsCount: this.widgets.size,
      lastUpdate: new Date(),
      alerts: alerts.slice(0, 10), // Limit to 10 alerts
    };
  }

  /**
   * Export data for charting library
   */
  exportChartData(chartId: string, format: 'chartjs' | 'recharts' | 'apexcharts'): any {
    const chartData = this.getChartData(chartId);
    if (!chartData.chart) return null;

    switch (format) {
      case 'chartjs':
        return {
          type: chartData.chart.type,
          data: {
            labels: chartData.data.map(d => d.timestamp.toISOString()),
            datasets: [{
              label: chartData.chart.title,
              data: chartData.data.map(d => d.value),
              borderColor: chartData.chart.colors?.[0] || '#2563eb',
              backgroundColor: chartData.chart.type === 'area'
                ? `${chartData.chart.colors?.[0] || '#2563eb'}33`
                : undefined,
            }],
          },
        };

      case 'recharts':
        return chartData.data.map(d => ({
          timestamp: d.timestamp.toISOString(),
          value: d.value,
        }));

      case 'apexcharts':
        return {
          series: [{
            name: chartData.chart.title,
            data: chartData.data.map(d => ({ x: d.timestamp.getTime(), y: d.value })),
          }],
          chart: { type: chartData.chart.type },
        };

      default:
        return chartData.data;
    }
  }
}

// Singleton instances
export const analyticsStore = new AnalyticsStore();
export const trendAnalyzer = new TrendAnalyzer();
export const analyticsDashboard = new AnalyticsDashboard();

// Helper functions
export function recordAffiliateCommission(affiliateId: number, amount: number): void {
  analyticsStore.recordMetric('commissions', amount, affiliateId);
  analyticsDashboard.recordMetric('commissions', amount, affiliateId);
}

export function recordAffiliateSale(affiliateId: number, amount: number): void {
  analyticsStore.recordMetric('sales', amount, affiliateId);
  analyticsDashboard.recordMetric('sales', amount, affiliateId);
}

export function recordNetworkGrowth(affiliateId: number, newMembers: number): void {
  analyticsStore.recordMetric('network_growth', newMembers, affiliateId);
  analyticsDashboard.recordMetric('network_growth', newMembers, affiliateId);
}

export function recordXPProgress(affiliateId: number, xpGained: number): void {
  analyticsStore.recordMetric('xp_progress', xpGained, affiliateId);
  analyticsDashboard.recordMetric('xp_progress', xpGained, affiliateId);
}

export function getDashboardTrends(period: TrendPeriod = '30d'): TrendData[] {
  const metrics: MetricType[] = ['commissions', 'sales', 'network_growth', 'xp_progress', 'revenue'];
  return metrics.map(metric => analyticsDashboard.getTrendData(metric, period));
}