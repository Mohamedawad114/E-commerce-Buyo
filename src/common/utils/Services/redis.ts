import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URI as string, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
});
redis.on('connect', () => console.log('Redis connected'));
