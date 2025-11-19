import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '../../entities/category.entity';

@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);
  
  constructor(private readonly categoryService: CategoryService) {}

  // 创建分类
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`接收创建分类请求，数据: ${JSON.stringify(createCategoryDto)}`);
    try {
      const result = await this.categoryService.createCategory(createCategoryDto);
      this.logger.log(`创建分类请求处理完成`);
      return result;
    } catch (error) {
      this.logger.error(`创建分类请求处理失败: ${error.message}`);
      throw error;
    }
  }

  // 获取所有分类 - 支持分页
  @Get()
  async getAllCategories(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<{ list: Category[]; total: number }> {
    this.logger.log(`接收获取分类列表请求，页码: ${page}，每页数量: ${pageSize}`);
    try {
      const validPage = Math.max(1, Number(page) || 1);
      const validPageSize = Math.max(1, Math.min(100, Number(pageSize) || 10));
      
      const result = await this.categoryService.getAllCategories(validPage, validPageSize);
      this.logger.log(`获取分类列表请求处理完成`);
      return result;
    } catch (error) {
      this.logger.error(`获取分类列表请求处理失败: ${error.message}`);
      throw error;
    }
  }

  // 根据分类名称查询分类
  @Get('search')
  async searchCategoryByName(
    @Query('name') name: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<{ list: Category[]; total: number }> {
    this.logger.log(`接收搜索分类请求，关键词: ${name}，页码: ${page}，每页数量: ${pageSize}`);
    try {
      const validPage = Math.max(1, Number(page) || 1);
      const validPageSize = Math.max(1, Math.min(100, Number(pageSize) || 10));
      
      const result = await this.categoryService.searchCategoryByName(name, validPage, validPageSize);
      this.logger.log(`搜索分类请求处理完成`);
      return result;
    } catch (error) {
      this.logger.error(`搜索分类请求处理失败: ${error.message}`);
      throw error;
    }
  }

  // 根据ID获取分类
  @Get(':id')
  async getCategoryById(@Param('id') id: number): Promise<Category> {
    this.logger.log(`接收根据ID获取分类请求，ID: ${id}`);
    try {
      const result = await this.categoryService.getCategoryById(id);
      this.logger.log(`根据ID获取分类请求处理完成`);
      return result;
    } catch (error) {
      this.logger.error(`根据ID获取分类请求处理失败: ${error.message}`);
      throw error;
    }
  }

  // 更新分类
  @Put(':id')
  async updateCategory(@Param('id') id: number, @Body() updateData: Partial<CreateCategoryDto>): Promise<Category> {
    this.logger.log(`接收更新分类请求，ID: ${id}，更新数据: ${JSON.stringify(updateData)}`);
    try {
      const result = await this.categoryService.updateCategory(id, updateData);
      this.logger.log(`更新分类请求处理完成`);
      return result;
    } catch (error) {
      this.logger.error(`更新分类请求处理失败: ${error.message}`);
      throw error;
    }
  }

  // 删除分类
  @Delete(':id')
  async deleteCategory(@Param('id') id: number): Promise<{ success: boolean }> {
    this.logger.log(`接收删除分类请求，ID: ${id}`);
    try {
      const success = await this.categoryService.deleteCategory(id);
      this.logger.log(`删除分类请求处理完成，结果: ${success}`);
      return { success };
    } catch (error) {
      this.logger.error(`删除分类请求处理失败: ${error.message}`);
      throw error;
    }
  }
}