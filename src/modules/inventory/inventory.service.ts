import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { join } from 'path';
import { Product } from '../../entities/product.entity';

@Injectable()
export class InventoryService {
  
  // 生成库存报表
  async generateInventoryReport(products: Product[]): Promise<string> {
    // 准备报表数据
    const reportData = products.map(product => ({
      '商品ID': product.id,
      '商品名称': product.name,
      '当前库存': product.stock,
      '库存状态': this.getStockStatusText(product.stock),
      '价格': product.price,
      '分类': product.category ? product.category.name : '未分类',
      '状态': product.status ? '上架' : '下架',
      '创建时间': product.createdAt ? product.createdAt.toLocaleString('zh-CN') : '',
    }));
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    
    // 设置列宽
    const columnWidths = [
      { wch: 10 }, // 商品ID
      { wch: 20 }, // 商品名称
      { wch: 10 }, // 当前库存
      { wch: 10 }, // 库存状态
      { wch: 10 }, // 价格
      { wch: 15 }, // 分类
      { wch: 8 },  // 状态
      { wch: 20 }, // 创建时间
    ];
    worksheet['!cols'] = columnWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '库存报表');
    
    // 生成文件路径
    const fileName = `inventory_report_${Date.now()}.xlsx`;
    const filePath = join(process.cwd(), 'uploads', 'reports', fileName);
    
    // 确保目录存在
    const fs = require('fs');
    const dirPath = join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 写入文件
    XLSX.writeFile(workbook, filePath);
    
    return filePath;
  }
  
  // 获取库存状态文本
  private getStockStatusText(stock: number): string {
    if (stock <= 0) {
      return '缺货';
    } else if (stock <= 10) {
      return '低库存';
    } else if (stock <= 50) {
      return '正常';
    }
    return '充足';
  }
}