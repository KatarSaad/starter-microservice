import { Injectable, Logger, NestMiddleware, OnModuleInit } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { RabbitmqService } from './logger-rmq-service';

@Injectable()
export class LoggingMiddleWare implements NestMiddleware, OnModuleInit {
  private readonly logger = new Logger(LoggingMiddleWare.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly rabbitmqService: RabbitmqService, // Inject RabbitMQ service
  ) {}

  async onModuleInit() {
    const isEnabled = this.configService.get<boolean>('logging.isEnabled', true);
    const useRabbitMQ = this.configService.get<boolean>('rmq.isEnabled', false);

    this.logger.log(`Logging Enabled: ${isEnabled}`);
    this.logger.log(`RabbitMQ Logging Enabled: ${useRabbitMQ}`);
  }

  /**
   * General log handler for all log levels
   */
  private async handleLog(level: string, message: string, trace?: string, context?: string, serviceName?: string, metadata?: Record<string, any>) {
    const isEnabled = this.configService.get<boolean>('logging.isEnabled', true);
    const useRabbitMQ = this.configService.get<boolean>('rmq.isEnabled', false);
    this.logger.warn('xxxxxxxxxxxxxxxxxxxxlevel');

    if (!isEnabled) return;

    // Log internally using NestJS Logger
    console.log(level);
    switch (level) {
      case 'log':
        this.logger.log(message, context);
        break;
      case 'error':
        this.logger.error(message, trace, context);
        break;
      case 'warn':
        this.logger.warn(message, context);
        break;
      case 'debug':
        this.logger.debug(message, context);
        break;
      default:
        this.logger.log(message, context);
    }

    // Send log to RabbitMQ if enabled
    if (useRabbitMQ) {
      try {
        const logPayload = {
          level,
          message,
          trace,
          context,
          timestamp: new Date().toISOString(),
          metadata: metadata || {},
          serviceName,
        };
        console.log(level);
        await this.rabbitmqService.sendLogToQueue(level, logPayload);
      } catch (error) {
        this.logger.error(`Failed to send log to RabbitMQ: [${level}] ${message}`, (error as Error).stack);
      }
    }
  }

  /**
   * Middleware function to handle incoming request logs
   */
  async use(req: Request, res: Response, next: NextFunction) {
    console.log('xxxxxxxxxxxxxxxxxxxxlevel');

    const isEnabled = this.configService.get<boolean>('logging.isEnabled', true);

    if (!isEnabled) {
      return next();
    }

    const { method, url, ip } = req;
    const startTime = Date.now();

    // Log incoming request details
    const requestMessage = `Incoming request: ${method} ${url} from ${ip}`;
    console.log(requestMessage);

    // Log response details after request is processed
    res.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;

      const responseMessage = `Request ${method} ${url} completed with status ${statusCode} in ${responseTime}ms`;
      console.log(responseMessage);
    });

    next();
  }
}
