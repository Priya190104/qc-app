import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

/**
 * Rate Limiting Module
 *
 * Installation:
 * npm install @nestjs/throttler
 *
 * This module provides rate limiting to protect the API from abuse.
 * Default configuration: 100 requests per 60 seconds per IP address
 *
 * To use different limits for specific routes, use @Throttle() decorator:
 * @Throttle(5, 60) // 5 requests per 60 seconds
 * @Post('login')
 * async login() { }
 */

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time to live in milliseconds (60 seconds)
        limit: 100, // Maximum number of requests within TTL
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitModule {}
