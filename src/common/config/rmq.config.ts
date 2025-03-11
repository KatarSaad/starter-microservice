import { registerAs } from '@nestjs/config';

export default registerAs('rmq', () => ({
  isEnabled: process.env.RMQ_ENABLED || 'true', // Enable or disable RabbitMQ
  url: process.env.RMQ_URL || 'amqp://localhost:5672', // RabbitMQ URL
  defaultQueue: process.env.RMQ_QUEUE_NAME || 'default_queue', // Default queue
  LOGGER_QUEUE: process.env.LOGGER_QUEUE || 'logging_queue', // Logger-specific queue
  retryDelay: parseInt(process.env.RMQ_RETRY_DELAY || '5000', 10), // Retry delay in ms
  connectionTimeout: parseInt(process.env.RMQ_CONNECTION_TIMEOUT || '10000', 10), // Timeout in ms
  CURRENT_QUEUE: process.env.CURRENT_QUEUE || 'CURRENT_QUEUE',
  SERVICE_NAME: process.env.SERVICE_NAME || 'CURRENT_SERVICE',
}));
