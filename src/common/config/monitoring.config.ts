import { registerAs } from '@nestjs/config';

export default registerAs('monitoring', () => ({
  isEnabled: process.env.MONITORING_ENABLED === 'true',
}));
