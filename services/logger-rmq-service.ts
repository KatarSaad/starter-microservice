import { Inject, Injectable } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  constructor(@Inject('LOGGER_SERVICE') private readonly client: ClientProxy) {}

  // Method to send logs to RabbitMQ
  async sendLogToQueue(message: string) {
    try {
      await this.client.emit('log-here', { level: 'string', message });
    } catch (error) {
      console.error('Error sending log to RabbitMQ:', error.message);
    }
  }
}
