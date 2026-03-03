/**
 * ========================================
 * IN-MEMORY CACHE MODULE
 * ========================================
 *
 * Uses @nestjs/cache-manager with the default in-memory store.
 * No Redis or external service required.
 *
 * To upgrade to Redis in production:
 * 1. npm install cache-manager-redis-yet
 * 2. Replace 'store: "memory"' with the Redis store configuration
 *
 * Default TTL: 30 seconds (suitable for dashboard and list data)
 */

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Available across all modules without re-importing
      ttl: 30000, // Default TTL: 30 seconds (in milliseconds)
      max: 500, // Max number of cached items
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
