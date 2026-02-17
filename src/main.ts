import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import "reflect-metadata";
import cookieParser from 'cookie-parser';
import { LogPerformanceInterceptor } from './interceptors/performance.interceptor';
import { join } from 'path/win32';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new Logger('Bootstrap');

    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });

  app.enableCors(
    {
      origin: 'http://localhost:4200',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Accept, Authorization, x_access_token',
    }
  );

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Whisker Anime API')
    .setDescription('The Whisker Anime API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalInterceptors(new LogPerformanceInterceptor)
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3001);

  await logger.debug(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
