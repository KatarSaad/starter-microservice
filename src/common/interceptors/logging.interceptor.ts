import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggingService } from '@app/common/services/logging.service';

@Injectable()
export class RmqLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const rmqContext = context.switchToRpc().getContext();
      const message = context.switchToRpc().getData();
      const pattern = rmqContext.getPattern();

      //   console.log('Interceptor Triggered');
      //   console.log('Context:', rmqContext);
      //   console.log('Message:', message);
      //   console.log('Pattern:', pattern);

      // Determine log details
      const level = 'info'; // Default log level
      const trace = message?.traceId || rmqContext?.getMessage()?.properties?.correlationId || 'unknown-trace';
      const logContext = `RabbitMQ:${pattern}`;
      const serviceName = this.configService.get<string>('rmq.SERVICE_NAME', 'unknown');
      // Log the incoming message
      const logMessage = `<-------Incoming RabbitMQ Message on Pattern [${pattern}]: ${JSON.stringify(message)}`;
      this.loggingService.handleLog(level, logMessage, trace, logContext, serviceName, {
        pattern,
        message,
      });

      return next.handle().pipe(
        tap(() => {
          const successMessage = `------->Successfully processed RabbitMQ message on Pattern [${pattern}]`;
          this.loggingService.handleLog('info', successMessage, trace, logContext, serviceName, {
            pattern,
            message,
          });
        }),
        catchError((err) => {
          const errorMessage = `------->Error processing RabbitMQ message on Pattern [${pattern}]: ${err.message}`;
          this.loggingService.handleLog('error', errorMessage, err.stack, logContext, serviceName, {
            pattern,
            message,
          });
          throw err;
        }),
      );
    } catch (error) {
      console.error('Interceptor Error:', error);
      throw error;
    }
  }
}
