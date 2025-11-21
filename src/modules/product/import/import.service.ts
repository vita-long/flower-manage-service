import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../../entities/product.entity';
import { Category } from '../../../entities/category.entity';

interface ProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  categoryName: string;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Product) 
    private productRepository: Repository<Product>,
    @InjectRepository(Category) 
    private categoryRepository: Repository<Category>
  ) {}

  // 解析Excel文件
  async parseExcelFile(filePath: string): Promise<ProductData[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
      
      return this.transformToProductData(data);
    } catch (error) {
      this.logger.error(`解析Excel文件失败: ${error.message}`, error.stack);
      throw new BadRequestException('解析Excel文件失败');
    }
  }

  // 解析CSV文件
  async parseCsvFile(filePath: string): Promise<ProductData[]> {
    return new Promise((resolve, reject) => {
      const results: Record<string, any>[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          try {
            resolve(this.transformToProductData(results));
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          this.logger.error(`解析CSV文件失败: ${error.message}`, error.stack);
          reject(new BadRequestException('解析CSV文件失败'));
        });
    });
  }

  // 转换数据为商品格式
  private transformToProductData(data: Record<string, any>[]): ProductData[] {
    return data.map(row => {
      // 支持不同列名格式
      const name = row['name'] || row['商品名称'] || row['NAME'] || row['product_name'];
      const description = row['description'] || row['商品描述'] || row['DESCRIPTION'] || row['product_description'];
      const price = parseFloat(row['price'] || row['商品价格'] || row['PRICE'] || row['product_price']) || 0;
      const stock = parseInt(row['stock'] || row['商品库存'] || row['STOCK'] || row['product_stock']) || 0;
      const image = row['image'] || row['商品图片'] || row['IMAGE'] || row['product_image'] || row['image_url'] || row['图片链接'] || row['IMAGE_URL'];
      const categoryName = row['category'] || row['分类名称'] || row['CATEGORY'] || row['category_name'] || row['分类'];

      if (!name || !categoryName) {
        throw new BadRequestException(`商品名称和分类名称不能为空: ${JSON.stringify(row)}`);
      }

      return {
        name: String(name).trim(),
        description: description ? String(description).trim() : undefined,
        price: Number(price),
        stock: Number(stock),
        image: image ? String(image).trim() : undefined,
        categoryName: String(categoryName).trim()
      };
    });
  }

  // 导入商品数据
  async importProducts(productDataList: ProductData[]): Promise<{ imported: number; failed: number; errors: string[] }> {
    const imported: number[] = [];
    const errors: string[] = [];

    for (let i = 0; i < productDataList.length; i++) {
      const productData = productDataList[i];
      try {
        // 查找或创建分类
        let category = await this.categoryRepository.findOneBy({ 
          name: productData.categoryName 
        });

        if (!category) {
          // 创建新分类
          category = this.categoryRepository.create({
            name: productData.categoryName,
            description: '',
            isActive: true
          });
          category = await this.categoryRepository.save(category);
          this.logger.log(`创建新分类: ${productData.categoryName}`);
        }

        // 创建商品
        const product = this.productRepository.create({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          image: productData.image,
          category,
          status: true
        });

        const savedProduct = await this.productRepository.save(product);
        imported.push(savedProduct.id);
      } catch (error) {
        errors.push(`第 ${i + 1} 行数据导入失败: ${error.message}`);
        this.logger.error(`导入商品失败: ${error.message}`, error.stack);
      }
    }

    return {
      imported: imported.length,
      failed: errors.length,
      errors
    };
  }
}