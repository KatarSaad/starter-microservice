import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxyFactory, ClientProxy, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private client: ClientProxy | null = null;
  private isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // Dynamically enable/disable RabbitMQ integration via environment variable
    this.isEnabled = this.configService.get<boolean>('rmq.isEnabled', false);

    if (this.isEnabled) {
      this.initializeRabbitMQClient();
    }
  }

  /**
   * Initialize RabbitMQ client
   */
  private initializeRabbitMQClient() {
    try {
      const rmqUrl = this.configService.get<string>('rmq.url', 'amqp://localhost:5672');
      const rmqLoggerQueue = this.configService.get<string>('rmq.LOGGER_QUEUE', 'default_queue');

      this.client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: rmqLoggerQueue,
          queueOptions: { durable: true },
        },
      });

      this.logger.log(`RabbitMQ client initialized: Queue = ${rmqLoggerQueue}`);
    } catch (error) {
      this.isEnabled = false;
      this.logger.error('Failed to initialize RabbitMQ client:', (error as Error).message);
    }
  }

  /**
   * Send logs to RabbitMQ queue
   */
  async sendLogToQueue(
    level: string,
    logPayload: {
      message: any;
      trace?: string;
      context?: string;
      timestamp: string;
      metadata: Record<string, any>;
      serviceName: string;
    },
  ) {
    if (!this.isEnabled || !this.client) {
      this.logger.warn(`RabbitMQ is disabled or unavailable. Logging locally: ${JSON.stringify(logPayload)}`);
      return;
    }

    try {
      // Add service-specific information to the log payload
      const enrichedPayload = {
        ...logPayload,

        level,
      };

      // Emit the log to RabbitMQ
      await this.client.emit('log-here', enrichedPayload).toPromise();
      this.logger.log(`Log sent to RabbitMQ: ${JSON.stringify(enrichedPayload)}`);
    } catch (error) {
      this.logger.error(`Error sending log to RabbitMQ: ${JSON.stringify(logPayload)}`, (error as Error).stack);
    }
  }

  /**
   * Cleanup RabbitMQ client on shutdown
   */
  async onModuleDestroy() {
    if (this.client) {
      this.logger.log('Closing RabbitMQ client...');
      await this.client.close();
    }
  }

  async onModuleInit() {
    if (this.isEnabled && this.client) {
      this.logger.log('RabbitMQ service is enabled and ready.');
    } else {
      this.logger.warn('RabbitMQ service is disabled.');
    }
  }
}
