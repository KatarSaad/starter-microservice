import { Injectable, Logger, Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { BlogService } from '../blog.service';
import { BlogEventNames } from '../enums/blog-event-names.enum';
import * as CircuitBreaker from 'opossum';

@Controller()
export class BlogEventHandler {
  private readonly logger = new Logger(BlogEventHandler.name);

  constructor(private readonly blogService: BlogService) {}

  private readonly circuitBreaker = new CircuitBreaker(
    async (fn, args) => fn(...args),
    {
      timeout: 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 1000,
    },
  );

  @MessagePattern(BlogEventNames.Created)
  async handleCreatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const result = await this.processEvent(
      'created',
      data,
      context,
      this.blogService.create.bind(this.blogService),
    );
    return result; // Return result after processing
  }

  @MessagePattern(BlogEventNames.Updated)
  async handleUpdatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const { id, ...updateData } = data;
    await this.processEvent(
      'updated',
      { id, updateData },
      context,
      this.blogService.update.bind(this.blogService),
    );
  }

  @MessagePattern(BlogEventNames.Deleted)
  async handleDeletedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    await this.processEvent(
      'deleted',
      data,
      context,
      this.blogService.delete.bind(this.blogService),
    );
  }

  @MessagePattern(BlogEventNames.GetAll)
  async handleGetAllEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const result = await this.processEvent(
      'getAll',
      data,
      context,
      this.blogService.findAll.bind(this.blogService),
    );
    return result; // Return result after processing
  }

  @MessagePattern(BlogEventNames.Get)
  async handleGetEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    const { id } = data;
    const result = await this.processEvent(
      'get',
      id,
      context,
      this.blogService.findOne.bind(this.blogService),
    );
    return result; // Return result after processing
  }

  private async processEvent(
    event: string,
    data: any,
    context: RmqContext,
    serviceMethod: (...args: any[]) => Promise<any>,
  ) {
    try {
      this.logger.log(`Processing '${event}' event: ${JSON.stringify(data)}`);
      const result = await this.circuitBreaker.fire(serviceMethod, [data]);
      this.acknowledgeMessage(context);
      return result; // Return result after processing event
    } catch (error) {
      this.handleError(context, error, event, data);
    }
  }

  private acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
    this.logger.log('Message acknowledged');
  }

  private handleError(
    context: RmqContext,
    error: any,
    event: string,
    data: any,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.nack(originalMessage, false, false);
    this.logger.error(
      `Failed to process '${event}' event for data: ${JSON.stringify(data)}`,
      error.stack,
    );

    throw new RpcException({
      statusCode: error?.error?.statusCode || 500,
      message: error.message || 'Internal server error',
      metadata: { event, data: error.error },
    });
  }
}
