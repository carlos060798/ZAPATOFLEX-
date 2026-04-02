import Redis from 'ioredis';

// Singleton instance for Redis caching
const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  // Si no hay redis configurado, devolvemos null y la aplicaciÃ³n
  // debe ser capaz de ignorar la cachÃ© grÃ¡cilmente
  return '';
};

const redisUrl = getRedisUrl();

export const redis = redisUrl ? new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
}) : null;

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error de CachÃ© Redis (GET):`, err);
    return null;
  }
};

export const setCachedData = async (key: string, data: any, ttlSeconds: number = 3600) => {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    console.error(`Error de CachÃ© Redis (SET):`, err);
  }
};
