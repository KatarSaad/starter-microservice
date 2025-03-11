
import { Injectable, Logger,Controller} from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { PostService } from '../post.service';

@Controller()
export class PostEventHandler {
  private readonly logger = new Logger(PostEventHandler.name);

  constructor(private readonly postService: PostService) {}

  @MessagePattern('post.created')
  async handleCreatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'created' event: ${JSON.stringify(data)}`);
      await this.postService.create(data);

      this.acknowledgeMessage(context);
    } catch (error) {
      this.handleError(context, error, 'created');
    }
  }

  @MessagePattern('post.updated')
  async handleUpdatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'updated' event: ${JSON.stringify(data)}`);
      const { id, ...updateData } = data;
      await this.postService.update(id, updateData);

      this.acknowledgeMessage(context);
    } catch (error) {
      this.handleError(context, error, 'updated');
    }
  }

  @MessagePattern('post.deleted')
  async handleDeletedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'deleted' event: ${JSON.stringify(data)}`);
      const { id } = data;
      await this.postService.remove(id);

      this.acknowledgeMessage(context);
    } catch (error) {
      this.handleError(context, error, 'deleted');
    }
  }

  @MessagePattern('post.get') // Event for retrieving a single item by ID
  async handleGetEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'get' event: ${JSON.stringify(data)}`);
      const { id } = data;
      const result = await this.postService.findOne(id);

      this.logger.log(`Retrieved item: ${JSON.stringify(result)}`);
      this.acknowledgeMessage(context);
    } catch (error) {
      this.handleError(context, error, 'get');
    }
  }

  @MessagePattern('post.getAll') // Event for retrieving all items
  async handleGetAllEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'getAll' event`);
      const results = await this.postService.findAll();

      this.logger.log(`Retrieved items: ${JSON.stringify(results)}`);
      this.acknowledgeMessage(context);
    } catch (error) {
      this.handleError(context, error, 'getAll');
    }
  }

  private acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
    this.logger.log('Message acknowledged');
  }

  private handleError(context: RmqContext, error: any, event: string) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.nack(originalMessage, false, false);
    this.logger.error(`Failed to process '${event}' event: ${error.message}`, error.stack);
  }
}
