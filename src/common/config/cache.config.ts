import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  isEnabled: process.env.CACHE_ENABLED === 'true',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || 'my-password',
}));
