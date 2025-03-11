import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  //this is the key
  port: parseInt(process.env.PORT, 10) || 3000, //this is the subkey
  environment: process.env.NODE_ENV || 'development',
}));
