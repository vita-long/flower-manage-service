import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // 创建商品
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // 验证分类是否存在
    const category = await this.categoryRepository.findOneBy({ id: createProductDto.category });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });

    return this.productRepository.save(product);
  }

  // 获取所有商品（带分页）
  async getAllProducts(page: number = 1, pageSize: number = 10): Promise<{ items: Product[]; total: number }> {
    const [items, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  // 根据ID获取商品
  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  // 更新商品
  async updateProduct(id: number, updateData: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 构建更新对象
    const updateObject: any = { ...updateData };
    
    // 如果更新分类，需要验证分类是否存在
    if (updateData.category !== undefined) {
      const category = await this.categoryRepository.findOneBy({ id: updateData.category });
      if (!category) {
        throw new NotFoundException('分类不存在');
      }
      updateObject.category = category;
    }

    await this.productRepository.update(id, updateObject);
    return this.getProductById(id);
  }

  // 删除商品
  async deleteProduct(id: number): Promise<boolean> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    const result = await this.productRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  // 根据分类获取商品
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category'],
    });
  }

  // 搜索商品
  async searchProducts(keyword: string): Promise<Product[]> {
    return this.productRepository.createQueryBuilder('product')
      .where('product.name LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('product.description LIKE :keyword', { keyword: `%${keyword}%` })
      .leftJoinAndSelect('product.category', 'category')
      .getMany();
  }
}