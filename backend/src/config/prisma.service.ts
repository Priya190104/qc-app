import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const SLOW_QUERY_THRESHOLD_MS = 1000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Connection pool configuration:
      // - connection_limit: max open connections (default is too low)
      // - pool_timeout: seconds to wait for a connection from pool
      // These can also be configured via DATABASE_URL query params:
      // ?connection_limit=20&pool_timeout=20
      log:
        process.env.NODE_ENV === 'development'
          ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.setupQueryMonitoring();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Logs slow queries (> 1 second) to help identify bottlenecks.
   * Only active in development mode to avoid overhead in production.
   */
  private setupQueryMonitoring() {
    if (process.env.NODE_ENV !== 'development') return;

    // Log slow queries
    this.$on('query' as never, (event: any) => {
      if (event.duration >= SLOW_QUERY_THRESHOLD_MS) {
        this.logger.warn(`Slow Query (${event.duration}ms): ${event.query.substring(0, 200)}`);
      }
    });
  }
}
