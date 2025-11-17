import { Controller, Post, Get, Put, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '../../entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 创建商品
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  // 获取所有商品
  @Get()
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<{ items: Product[]; total: number }> {
    return this.productService.getAllProducts(page, pageSize);
  }

  // 根据ID获取商品
  @Get(':id')
  async getProductById(@Param('id') id: number): Promise<Product> {
    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    return product;
  }

  // 更新商品
  @Put(':id')
  async updateProduct(@Param('id') id: number, @Body() updateData: Partial<CreateProductDto>): Promise<Product> {
    return this.productService.updateProduct(id, updateData);
  }

  // 删除商品
  @Delete(':id')
  async deleteProduct(@Param('id') id: number): Promise<{ success: boolean }> {
    const success = await this.productService.deleteProduct(id);
    return { success };
  }

  // 根据分类获取商品
  @Get('category/:categoryId')
  async getProductsByCategory(@Param('categoryId') categoryId: number): Promise<Product[]> {
    return this.productService.getProductsByCategory(categoryId);
  }

  // 搜索商品
  @Get('search')
  async searchProducts(@Query('keyword') keyword: string): Promise<Product[]> {
    return this.productService.searchProducts(keyword);
  }
}