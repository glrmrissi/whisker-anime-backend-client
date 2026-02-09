import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import "reflect-metadata";
import { LogPerformanceInterceptor } from './interceptors/performance.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const logger = new Logger('Bootstrap');
  app.enableCors(
    {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    }
  );
  
  const config = new DocumentBuilder()
    .setTitle('Whisker Anime API')
    .setDescription('The Whisker Anime API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new LogPerformanceInterceptor)
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3001);

  await logger.debug(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
