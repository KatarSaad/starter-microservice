import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @MessagePattern('user.get')
  async receiveMessage(@Payload() data: any) {
    console.log('Received message from micro2:', data);
    await this.client.emit('order.get', data); // Pub lish to micro2_queue"

    return 'Message received in micro1';
  }
}
