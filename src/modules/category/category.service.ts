import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // 创建分类
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`开始创建分类: ${JSON.stringify(createCategoryDto)}`);
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      const result = await this.categoryRepository.save(category);
      this.logger.log(`成功创建分类，ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`创建分类失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 获取所有分类 - 添加分页功能
  async getAllCategories(page: number = 1, pageSize: number = 10): Promise<{ list: Category[]; total: number }> {
    this.logger.log(`查询所有分类，页码: ${page}，每页数量: ${pageSize}`);
    try {
      // 计算偏移量
      const skip = (page - 1) * pageSize;
      
      // 使用findAndCount方法进行分页查询
      const [categories, total] = await this.categoryRepository.findAndCount({
        skip,
        take: pageSize,
        order: { createdAt: 'DESC' },
      });
      
      this.logger.log(`查询分类完成，共找到 ${total} 条记录`);
      return {
        list: categories,
        total,
      };
    } catch (error) {
      this.logger.error(`查询分类失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 根据ID获取分类
  async getCategoryById(id: number): Promise<Category> {
    this.logger.log(`根据ID查询分类: ${id}`);
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        this.logger.warn(`未找到ID为 ${id} 的分类`);
        throw new NotFoundException('分类不存在');
      }
      this.logger.log(`成功找到分类: ${category.name}`);
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`查询分类失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 根据分类名称查询分类 - 优化并添加分页功能
  async searchCategoryByName(
    name: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ list: Category[]; total: number }> {
    this.logger.log(`根据名称搜索分类: ${name}，页码: ${page}，每页数量: ${pageSize}`);
    try {
      // 参数验证
      if (!name || typeof name !== 'string' || name.trim() === '') {
        this.logger.warn('搜索参数无效，返回空结果');
        return { list: [], total: 0 };
      }
      
      // 计算偏移量
      const skip = (page - 1) * pageSize;
      const validPage = Math.max(1, Number(page) || 1);
      const validPageSize = Math.max(1, Math.min(100, Number(pageSize) || 10));
      
      // 使用findAndCount方法进行分页搜索
      const [categories, total] = await this.categoryRepository.findAndCount({
        where: { name: Like(`%${name.trim()}%`) },
        skip,
        take: validPageSize,
        order: { createdAt: 'DESC' },
      });
      
      this.logger.log(`搜索完成，关键词: ${name.trim()}，找到 ${total} 条记录`);
      return {
        list: categories,
        total,
      };
    } catch (error) {
      this.logger.error(`搜索分类失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 更新分类
  async updateCategory(id: number, updateData: Partial<CreateCategoryDto>): Promise<Category> {
    this.logger.log(`更新分类，ID: ${id}，更新数据: ${JSON.stringify(updateData)}`);
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        this.logger.warn(`未找到ID为 ${id} 的分类，无法更新`);
        throw new NotFoundException('分类不存在');
      }

      await this.categoryRepository.update(id, updateData);
      const updatedCategory = await this.getCategoryById(id);
      this.logger.log(`成功更新分类，ID: ${id}`);
      return updatedCategory;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`更新分类失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 删除分类
  async deleteCategory(id: number): Promise<boolean> {
    this.logger.log(`删除分类，ID: ${id}`);
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        this.logger.warn(`未找到ID为 ${id} 的分类，无法删除`);
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
        this.logger.warn(`分类ID ${id} 下还有商品，无法删除`);
        throw new Error('该分类下还有商品，无法删除');
      }

      const result = await this.categoryRepository.delete(id);
      const success = result.affected !== null && result.affected !== undefined && result.affected > 0;
      
      if (success) {
        this.logger.log(`成功删除分类，ID: ${id}`);
      } else {
        this.logger.warn(`删除分类失败，ID: ${id}，未受影响`);
      }
      
      return success;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`删除分类失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}