// src/lib/redis.ts
import { Redis } from '@upstash/redis'

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export const redis = REDIS_URL && REDIS_TOKEN
  ? new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    })
  : null

// Cache helpers
export async function cacheSet(key: string, value: string, ttl?: number) {
  if (!redis) return null
  if (ttl) {
    return redis.setex(key, ttl, value)
  }
  return redis.set(key, value)
}

export async function cacheGet(key: string) {
  if (!redis) return null
  return redis.get<string>(key)
}

export async function cacheDel(key: string) {
  if (!redis) return null
  return redis.del(key)
}

export async function cacheIncr(key: string) {
  if (!redis) return null
  return redis.incr(key)
}

// Cache product data for 1 hour
export async function getProductCache(id: string) {
  return cacheGet(`product:${id}`)
}

export async function setProductCache(id: string, data: string) {
  return cacheSet(`product:${id}`, data, 3600)
}

export async function clearProductCache(id: string) {
  return cacheDel(`product:${id}`)
}

// Cache product list for 5 minutes
export async function getProductListCache() {
  return cacheGet('products:list')
}

export async function setProductListCache(data: string) {
  return cacheSet('products:list', data, 300)
}
