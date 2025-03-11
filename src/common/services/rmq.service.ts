import { Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { CircuitBreakerService } from './sercuit.breaker.service';
import { from } from 'rxjs';

@Injectable()
export class RMQHandlerService {
  private readonly logger = new Logger(RMQHandlerService.name);

  constructor(private readonly circuitBreakerService: CircuitBreakerService) {}

  async handleMessage<T>(context: RmqContext, processingFn: () => Promise<T>, retries = 5): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    const retryCount = (message.properties.headers['x-retry'] || 0) as number;

    try {
      this.logger.log(`🔄 Processing message: ${JSON.stringify(message.content.toString())}`);

      // Execute processing inside the circuit breaker
      await this.circuitBreakerService.execute(() => from(processingFn()));

      // If successful, acknowledge the message
      channel.ack(message);
      this.logger.log('✅ Message processed successfully');
    } catch (error) {
      this.logger.error(`❌ Message processing failed: ${(error as Error).message}`);

      if (retryCount >= retries) {
        this.logger.error('⚠️ Max retries reached. Sending to Dead Letter Queue');
        channel.nack(message, false, false); // Send to DLQ (permanent rejection)
      } else {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        this.logger.warn(`♻️ Retrying in ${delay / 1000} seconds (Retry ${retryCount + 1}/${retries})`);

        setTimeout(() => {
          channel.nack(message, false, true); // Requeue message for retry
        }, delay);
      }
    }
  }
}
