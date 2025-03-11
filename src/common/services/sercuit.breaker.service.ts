import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuitBreaker: CircuitBreaker;

  constructor() {
    // Extended opossum options
    const options = {
      // Basic options
      timeout: 5000, // Maximum time (in ms) for the function to execute.
      errorThresholdPercentage: 50, // Open if 50% of calls fail.
      resetTimeout: 10000, // Time (in ms) to wait before attempting to close the circuit.
      // Statistical options
      rollingCountTimeout: 10000, // Duration (in ms) of the rolling statistical window.
      rollingCountBuckets: 10, // Number of buckets the rolling window is divided into.
      // Concurrency and caching options
      capacity: 10, // Maximum number of concurrent requests allowed.
      cache: true, // Cache the first successful result.
      cacheTTL: 60000, // Cache time-to-live in ms (60 seconds).
      // Error filtering: for example, ignore errors with status 400 (bad request)
      errorFilter: (error: any) => {
        if (error && error.response && error.response.status === 400) {
          return true; // error is filtered out (ignored)
        }
        return false;
      },
      // Warm-up and volume threshold options
      allowWarmUp: true, // Allow failures during a warm-up period.
      volumeThreshold: 5, // Minimum number of calls before error percentage is checked.
      // Abort controller options (to cancel long-running operations)
      abortController: new AbortController(),
      autoRenewAbortController: true,
      // Coalescing options (to combine concurrent calls with same parameters)
      coalesce: true,
      coalesceTTL: 5000, // Time-to-live for coalescing cache in ms.
      coalesceResetOn: ['error', 'timeout'], // Reset coalescing cache on these events.
    };

    // Define a generic wrapper that converts an Observable to a Promise
    const breakerFunction = async (fn: () => Observable<any>): Promise<any> => {
      return await firstValueFrom(fn());
    };

    // Create the circuit breaker instance with our wrapper and extended options.
    this.circuitBreaker = new CircuitBreaker(breakerFunction, options);

    // Log various circuit breaker events for visibility.
    this.circuitBreaker.on('open', () =>
      this.logger.warn('⚠️ Circuit Breaker OPEN - Blocking requests'),
    );
    this.circuitBreaker.on('halfOpen', () =>
      this.logger.warn('🔄 Circuit Breaker HALF-OPEN - Testing...'),
    );
    this.circuitBreaker.on('close', () =>
      this.logger.log('✅ Circuit Breaker CLOSED - Normal operation resumed'),
    );
    this.circuitBreaker.on('timeout', (err, latency) =>
      this.logger.error(
        `⏱ Circuit timed out after ${latency}ms: ${err.message}`,
      ),
    );
    this.circuitBreaker.on('reject', (err) =>
      this.logger.error(`🚫 Request rejected: ${err.message}`),
    );
    this.circuitBreaker.on('fallback', (result, err) =>
      this.logger.warn(
        `🤝 Fallback executed with result: ${result}. Error: ${err?.message}`,
      ),
    );
    this.circuitBreaker.on('success', (result) =>
      this.logger.log(
        `✅ Circuit executed successfully with result: ${result}`,
      ),
    );
  }

  /**
   * Executes the provided function through the circuit breaker.
   * The function should return an Observable.
   *
   * @param fn - A function that returns an Observable<T>
   * @returns A Promise resolving with the function's result or fallback if configured.
   */
  async execute<T>(fn: () => Observable<T>): Promise<T> {
    console.log('fn', fn);
    return this.circuitBreaker.fire(fn);
  }
}
