import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Cookie parser — required for httpOnly JWT cookie support
  app.use(cookieParser());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000').split(',');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SISTEM QC BERKAS API')
    .setDescription('API documentation for SISTEM QC BERKAS application')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('APP_PORT', 3001);
  await app.listen(port);

  logger.log(`
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║    🚀 SISTEM QC BERKAS API Server is running!             ║
    ║                                                            ║
    ║    📍 Server: http://localhost:${port}                     ║
    ║    📚 Swagger: http://localhost:${port}/docs              ║
    ║    🔐 Auth: JWT Bearer Token                              ║
    ║                                                            ║
    ║    Environment: ${configService.get('NODE_ENV')}                            ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});
