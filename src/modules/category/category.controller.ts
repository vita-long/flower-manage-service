import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '../../entities/category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 创建分类
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  // 获取所有分类
  @Get()
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }

  // 根据ID获取分类
  @Get(':id')
  async getCategoryById(@Param('id') id: number): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }

  // 更新分类
  @Put(':id')
  async updateCategory(@Param('id') id: number, @Body() updateData: Partial<CreateCategoryDto>): Promise<Category> {
    return this.categoryService.updateCategory(id, updateData);
  }

  // 删除分类
  @Delete(':id')
  async deleteCategory(@Param('id') id: number): Promise<{ success: boolean }> {
    const success = await this.categoryService.deleteCategory(id);
    return { success };
  }
}