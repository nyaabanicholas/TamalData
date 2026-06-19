import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  url && token
    ? new Redis({ url, token })
    : (null as unknown as Redis);

export const CACHE_TTL = {
  BUNDLES: 300,   // 5 minutes
  NETWORK_STATUS: 60, // 1 minute
  BALANCE: 120,   // 2 minutes
} as const;
