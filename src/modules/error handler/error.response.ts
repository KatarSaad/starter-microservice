import { RpcException } from '@nestjs/microservices';
import { AsyncLocalStorage } from 'async_hooks';

export interface ErrorResponse {
  statusCode: number;
  errorType: string; // e.g., VALIDATION_ERROR, DATABASE_ERROR
  message: string;
  service: string; // Service where error originated
  timestamp: string;
  path: string; // API endpoint path
  correlationId: string; // Unique ID for tracing
  details?: any; // Additional error context
  trace: string;
}
export class MicroserviceError extends RpcException {
  constructor(
    public readonly statusCode: number,
    public readonly errorType: string,
    message: string,
    public readonly service: string,
    public readonly path: string,
    public readonly details?: any,
    public readonly trace?: string,
  ) {
    super({ message, trace, details, statusCode, errorType, service, path });
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): ErrorResponse {
    return {
      statusCode: this.statusCode,
      errorType: this.errorType,
      message: this.message,
      service: this.service,
      timestamp: new Date().toISOString(),
      correlationId: this.getCorrelationId(),
      details: this.details,
      path: this.path,
      trace: this.trace,
    };
  }

  private getCorrelationId(): string {
    // Implement correlation ID retrieval (e.g., from async context)
    const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();
    return asyncLocalStorage.getStore()?.get('correlationId') || 'unknown';
  }
}
import { v4 as uuidv4 } from 'uuid';

export class CustomRpcException extends RpcException {
  public readonly traceId: string; // Unique ID for tracing
  public readonly timestamp: string; // When the error occurred
  public readonly combinedStack: string; // Combined stack traces

  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly details: Record<string, any> = {}, // Structured details
    public readonly stack?: string, // Stack trace from previous service
  ) {
    super({
      statusCode,
      message,
      details,
      traceId: uuidv4(),
      timestamp: new Date().toISOString(),
      stack,
    });
  }

  private buildCombinedStack(previousStack?: string): string {
    console.log('previousStack', previousStack);
    const currentStack = new Error().stack; // Get the current stack trace
    return previousStack
      ? `${previousStack}\n-------------------------------------------------------------------------------------------------------------------------- Propagated from previous service ---\n${currentStack}`
      : currentStack;
  }

  toJSON() {
    return {
      traceId: this.traceId,
      timestamp: this.timestamp,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
      stack: this.combinedStack, // Include the combined stack trace
    };
  }
}
