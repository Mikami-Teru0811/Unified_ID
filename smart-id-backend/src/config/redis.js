let redisClient = null;
let isConnected = false;

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || 6379;
  const password = process.env.REDIS_PASSWORD;
  
  if (password) {
    return `redis://:${password}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
};

export const connectRedis = async () => {
  const redisDisabled = String(process.env.REDIS_DISABLED || '').toLowerCase();
  
  if (redisDisabled === 'true' || redisDisabled === '1') {
    console.log('Redis is disabled via environment variable');
    isConnected = false;
    return null;
  }

  console.log('Redis connection skipped (no Redis server configured)');
  isConnected = false;
  return null;
};

export const getRedisClient = () => redisClient;

export const isRedisConnected = () => isConnected && redisClient !== null;

export const cacheGet = async (key) => {
  if (!isRedisConnected()) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (!isRedisConnected()) return false;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

export const cacheDel = async (key) => {
  if (!isRedisConnected()) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

export const cacheClear = async (pattern) => {
  if (!isRedisConnected()) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

export const rateLimitCheck = async (key, maxRequests, windowSeconds) => {
  if (!isRedisConnected()) return { allowed: true, remaining: maxRequests };
  
  try {
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, windowSeconds);
    }
    
    const remaining = Math.max(0, maxRequests - current);
    return {
      allowed: current <= maxRequests,
      remaining,
      resetIn: await redisClient.ttl(key)
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: maxRequests };
  }
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
  }
};

export default {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheClear,
  rateLimitCheck,
  closeRedis
};
