import { Logger, Controller, UseInterceptors } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { UserService } from '../user.service';
import { RmqLoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import { CircuitBreakerService } from '@app/common/services/sercuit.breaker.service';
import { from } from 'rxjs';
import { CustomRpcException } from 'src/modules/error handler/error.response';

@UseInterceptors(RmqLoggingInterceptor) // Applies to all routes in this controller
@Controller()
export class UserEventHandler {
  private readonly logger = new Logger(UserEventHandler.name);

  constructor(
    private readonly userService: UserService,
    private readonly circuitBrakerService: CircuitBreakerService,
  ) {}

  @MessagePattern('user.created')
  async handleCreatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'created' event: ${JSON.stringify(data)}`);
      const user = await this.userService.create(data);

      this.acknowledgeMessage(context);
      return user;
    } catch (error) {
      this.handleError(context, error, 'created');
      return null;
    }
  }

  @MessagePattern('user.updated')
  async handleUpdatedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'updated' event: ${JSON.stringify(data)}`);
      const { id, ...updateData } = data;
      await this.userService.update(id, updateData);

      this.acknowledgeMessage(context);
    } catch (error) {
      this.handleError(context, error, 'updated');
    }
  }

  @MessagePattern('user.deleted')
  async handleDeletedEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'deleted' event: ${JSON.stringify(data)}`);
      const { id } = data;
      await this.userService.remove(id);

      this.acknowledgeMessage(context);
    } catch (error) {
      this.handleError(context, error, 'deleted');
    }
  }

  @MessagePattern('user.get')
  async handleGetEvent(@Payload() data: { id: number }, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'get' event: ${JSON.stringify(data)}`);
      const { id } = data;
      // Use the circuit breaker service to wrap the call.
      const result = await this.circuitBrakerService.execute(() => {
        // Wrap the Promise returned by userService.findOne in an Observable.
        const res = from(this.userService.findOne(id));
        console.log('the data ', res);
        return res;
      });
      this.logger.log(`Retrieved item: ${JSON.stringify(result)}`);
      this.acknowledgeMessage(context);
      return result;
    } catch (error) {
      this.handleError(context, error, 'get');
      return null;
    }
  }

  @MessagePattern('user.getAll')
  async handleGetAllEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Processing 'getAll' event`);
      const results = await this.userService.findAll();

      this.logger.log(`Retrieved items: ${JSON.stringify(results)}`);

      // Acknowledge only after successful retrieval of data
      this.acknowledgeMessage(context);
      return results;
    } catch (error) {
      return this.handleError(context, error, 'getAll');
    }
  }

  acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    if (message) {
      channel.ack(message);
    }
  }

  handleError(context: RmqContext, error: any, event: string) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    this.logger.error(`Error processing '${event}' event:`, error);

    // Nack the message to avoid retry loops
    if (message) {
      channel.nack(message, false, false); // Requeue: false
    }
    console.log('eeeeerror', error.stack);

    throw new CustomRpcException(
      404,
      error.message,
      {
        resource: 'user',
        id: '123',
      },
      error.stack,
    );
  }
  @MessagePattern('user.find_user_by_username')
  async receiveMessage(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('data', data);
    try {
      const result = await this.userService.findByUserName(data.user_name);
      this.acknowledgeMessage(context);
      return result;
    } catch (error) {
      return this.handleError(context, error, 'find_user_by_username');
    }
  }
}
