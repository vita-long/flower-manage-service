import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // 创建分类
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  // 获取所有分类
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 根据ID获取分类
  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  // 更新分类
  async updateCategory(id: number, updateData: Partial<CreateCategoryDto>): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    await this.categoryRepository.update(id, updateData);
    return this.getCategoryById(id);
  }

  // 删除分类
  async deleteCategory(id: number): Promise<boolean> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有商品关联到此分类
    const hasProducts = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .where('category.id = :id', { id })
      .andWhere('product.id IS NOT NULL')
      .getExists();

    if (hasProducts) {
      throw new Error('该分类下还有商品，无法删除');
    }

    const result = await this.categoryRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }
}