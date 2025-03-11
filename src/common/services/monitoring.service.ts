import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Registry } from 'prom-client';

@Injectable()
export class PrometheusMetricsService {
  private registry: Registry = new Registry();
  public httpRequestCount: Counter<string>;
  public memoryUsageGauge: Gauge<string>;

  constructor() {
    this.httpRequestCount = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
    });

    this.memoryUsageGauge = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
    });

    this.registry.registerMetric(this.httpRequestCount);
    this.registry.registerMetric(this.memoryUsageGauge);
  }

  getMetrics() {
    return this.registry.metrics();
  }
}
