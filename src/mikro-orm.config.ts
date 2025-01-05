import { defineConfig } from '@mikro-orm/mysql'; // Correct import for MySQL driver
import * as dotenv from 'dotenv';
import { User } from './entities/user/User.entity';
dotenv.config(); // Load environment variables

// Use deèfineConfig to create your MikroORM configuration
export default defineConfig({
  entities: [User], // Add your entities here
  dbName: process.env.DB_NAME, // Use environment variable for DB name
  user: process.env.DB_USER, // Use environment variable for DB user
  password: process.env.DB_PASSWORD, // Use environment variable for DB password
  host: process.env.DB_HOST, // Use environment variable for DB host
  port: parseInt(process.env.DB_PORT, 10), // Use environment variable for DB port
  debug: true, // Set to false for production
});
