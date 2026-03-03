import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './config/prisma.module';
import { CacheConfigModule } from './config/cache.module';
import { RateLimitModule } from './config/rate-limit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { RoleModule } from './modules/roles/roles.module';
import { PetugasModule } from './modules/petugas/petugas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BerkasModule } from './modules/berkas/berkas.module';
import { BackupModule } from './modules/backup/backup.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CacheConfigModule, // In-memory cache (global, no Redis required)
    RateLimitModule,
    AuthModule,
    UserModule,
    RoleModule,
    PetugasModule,
    DashboardModule,
    BerkasModule,
    BackupModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
