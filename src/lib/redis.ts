import Redis from 'ioredis';
import { env } from './config';

/**
 * A single, shared Redis client instance.
 * Used for:
 *  - Socket.IO Redis adapter
 *  - BullMQ queues
 *  - Caching translations
 */
export const redisClient = new Redis(env.REDIS_URL);

// log connection success / errors
redisClient.on('ready', () => {
  console.log('Connected to Redis');
});
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});
