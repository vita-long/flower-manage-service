import { Controller, Get, Query, Res } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ProductService } from '../product/product.service';
import { InventoryService } from './inventory.service';
import type { Response } from 'express';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly productService: ProductService,
    private readonly inventoryService: InventoryService
  ) {}

  // 导出库存报表
  @Get('export')
  async exportInventoryReport(
    @Res() res: Response,
    @Query('keyword') keyword?: string,
    @Query('stockStatus') stockStatus?: string
  ) {
    // 获取商品数据
    let products = await this.productService.getProductsForExport(keyword, stockStatus);
    
    // 生成Excel文件
    const filePath = await this.inventoryService.generateInventoryReport(products);
    
    // 设置响应头
    res.set({
      'Content-Disposition': `attachment; filename=inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    // 创建可读流并管道到响应
    const file = createReadStream(filePath);
    file.pipe(res);
  }
}