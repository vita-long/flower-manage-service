import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  const configService = app.get(ConfigService);

  // 添加全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // 启用cookie-parser中间件
  app.use(cookieParser());

  // 启用静态文件服务，用于访问上传的文件
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // 启用CORS
  app.enableCors({
    // 当credentials为true时，origin不能使用通配符'*'，需要设置具体的源
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // 允许携带凭证（cookies）
    exposedHeaders: ['set-cookie'], // 允许前端访问set-cookie响应头
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');
  
  // 添加全局认证守卫
  app.useGlobalGuards(new JwtAuthGuard());
  
  // 添加全局日志拦截器
  app.useGlobalInterceptors(new LoggerInterceptor());
  // 添加全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // 添加全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 获取端口配置
  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  console.log(`Server running on http://${host}:${port}`);
}

bootstrap();
