import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqService } from './logger-rmq-service';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  /**
   * General log handler for all log levels
   */
  async handleLog(level: string, message: string, trace?: string, context?: string, serviceName?: string, metadata?: Record<string, any>) {
    const isEnabled = this.configService.get<boolean>('logging.isEnabled', true);
    const useRabbitMQ = this.configService.get<boolean>('rmq.isEnabled', false);

    if (!isEnabled) {
      return;
    }

    // Log locally using NestJS Logger
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

    // Send the log to RabbitMQ if enabled
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

        await this.rabbitmqService.sendLogToQueue(level, logPayload);
      } catch (error) {
        this.logger.error(`Failed to send log to RabbitMQ: [${level}] ${message}`, (error as Error).stack);
      }
    }
  }
}
