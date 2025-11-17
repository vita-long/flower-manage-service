import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', '127.0.0.1'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_NAME', 'flower_manage'),
  entities: [join(__dirname, '..', 'entities', '*.entity{.ts,.js}')],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
  logging: configService.get<boolean>('DB_LOGGING', false),
  retryAttempts: 3,
  retryDelay: 1000,
  autoLoadEntities: true,
});