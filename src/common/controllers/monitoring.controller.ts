import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusMetricsService } from '@app/common/services/monitoring.service';

@Controller('metrics')
export class PrometheusController {
  constructor(private metricsService: PrometheusMetricsService) {}

  @Get()
  async getMetrics(@Res() res): Promise<void> {
    const metrics = await this.metricsService.getMetrics();
    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics);
  }
}
