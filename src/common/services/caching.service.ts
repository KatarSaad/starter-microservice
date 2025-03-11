import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class CachingService implements OnModuleDestroy {
  private readonly logger = new Logger(CachingService.name);
  private client: Redis | null = null;
  private isEnabled: boolean;
  private defaultTTL: number;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('cache.isEnabled', false);
    this.defaultTTL = this.configService.get<number>('cache.defaultTTL', 60); // Default TTL: 60 seconds
    if (this.isEnabled) {
      this.initializeRedisClient();
    }
  }

  private initializeRedisClient(): void {
    console.log(this.client);
    try {
      const host = this.configService.get<string>('cache.host', 'localhost');
      const port = this.configService.get<number>('cache.port', 6379);
      const password = this.configService.get<string>('cache.password', null); // Fetch password

      this.client = new Redis({
        host,
        port,
        password, // Use the password
        retryStrategy: (times) => {
          this.logger.warn(`Redis retry attempt #${times}`);
          return Math.min(times * 100, 2000); // Retry every 100ms, up to 2 seconds
        },
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis client error:', error.message);
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', (error as Error).message);
      this.isEnabled = false; // Disable caching if Redis fails to connect
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isEnabled || !this.client) return;
    try {
      const data = JSON.stringify(value);
      ttl = ttl || this.defaultTTL;
      await this.client.set(key, data, 'EX', ttl); // Set with expiration
      this.logger.log(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Error setting cache for key "${key}":`, (error as Error).message);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client) return null;
    try {
      const data = await this.client.get(key);
      if (data) {
        this.logger.log(`Cache hit: ${key}`);
        return JSON.parse(data) as T;
      }
      this.logger.log(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting cache for key "${key}":`, (error as Error).message);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isEnabled || !this.client) return;
    try {
      await this.client.del(key);
      this.logger.log(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache for key "${key}":`, (error as Error).message);
    }
  }

  async flushAll(): Promise<void> {
    if (!this.isEnabled || !this.client) return;
    try {
      await this.client.flushall();
      this.logger.log('All cache flushed');
    } catch (error) {
      this.logger.error('Error flushing cache:', (error as Error).message);
    }
  }

  async ping(): Promise<string | null> {
    if (!this.isEnabled || !this.client) return null;
    try {
      const response = await this.client.ping();
      this.logger.log('Redis ping successful');
      return response; // Should return 'PONG'
    } catch (error) {
      this.logger.error('Error pinging Redis:', (error as Error).message);
      return null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client connection closed');
    }
  }
}
