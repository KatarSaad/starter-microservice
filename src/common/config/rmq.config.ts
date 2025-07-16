import { registerAs } from '@nestjs/config';

export default registerAs('rmq', () => ({
  url: process.env.RMQ_URL || 'amqp://rabbitmq:5672',
  API_GATEWAY_QUEUE: process.env.RMQ_QUEUE_API_GATEWAY || 'api_gateway',
  USER_QUEUE: process.env.RMQ_QUEUE_USER || 'user_queue',
  LOGGER_QUEUE: process.env.RMQ_QUEUE_LOGGER || 'logging_queue',
  AUTH_QUEUE: process.env.RMQ_QUEUE_AUTH || 'auth_queue',
  QUEUE_DURABLE: process.env.RMQ_QUEUE_DURABLE === 'true',
  frameMax: 8192,
}));
