import { registerAs } from '@nestjs/config';

export default registerAs('logging', () => ({
  isEnabled: process.env.LOGGING_ENABLED === 'true',
}));
