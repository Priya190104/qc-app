import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';

/**
 * Enhanced Prisma Service with query logging
 *
 * This service extends PrismaClient with:
 * - Connection lifecycle management
 * - Slow query logging (queries > 1 second)
 * - Error logging
 *
 * Features:
 * 1. Automatic connection on module init
 * 2. Graceful disconnection on module destroy
 * 3. Performance monitoring for slow queries
 */

@Injectable()
export class EnhancedPrismaService extends PrismaService {
  async onModuleInit() {
    await this.$connect();

    // Log slow queries (> 1 second)
    this.$use(async (params: any, next: (params: any) => Promise<any>) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      const duration = after - before;

      if (duration > 1000) {
        console.warn(
          `⚠️  Slow Query Detected (${duration}ms):`,
          `${params.model}.${params.action}`
        );
      }

      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Enable query logging for development
   * Add this to your main.ts or app.module.ts for debugging
   */
  enableQueryLogging() {
    this.$on('query' as never, (e: any) => {
      console.log('Query:', e.query);
      console.log('Duration:', e.duration + 'ms');
    });
  }
}
