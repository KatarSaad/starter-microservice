import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RabbitmqService } from 'services/logger-rmq-service'; // import the RabbitMQ service

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  constructor(private readonly rabbitmqService: RabbitmqService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Capture request details
    const { method, url } = req;
    const userAgent = req.get('User-Agent');

    // Log request to the local log file (using the service created earlier)
    this.logger.log(
      `Incoming Request: ${method} ${url} - User Agent: ${userAgent}`,
    );

    // Send log to RabbitMQ microservice (log it in the queue)
    this.rabbitmqService.sendLogToQueue(
      `Request - ${method} ${url} - User Agent: ${userAgent}`,
    );

    res.on('finish', () => {
      // Log response details (status code and response time)
      const statusCode = res.statusCode;
      const responseTime = Date.now() - (req as any).startTime; // Cast req to any to access startTime

      // Log to local file
      this.logger.log(
        `Response: ${statusCode} - ${url} - Time: ${responseTime}ms`,
      );

      // Send response log to RabbitMQ
      this.rabbitmqService.sendLogToQueue(
        `Response - ${statusCode} ${url} - Time: ${responseTime}ms`,
      );
    });

    // Add start time to calculate response time
    (req as any).startTime = Date.now(); // Cast req to any

    next();
  }
}
