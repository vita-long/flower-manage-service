import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { ProductService } from '../product/product.service';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  providers: [InventoryService, ProductService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}