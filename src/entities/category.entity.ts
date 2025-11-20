import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'categories', comment: '分类表' })
export class Category {
  @PrimaryGeneratedColumn({ comment: '分类ID' })
  id: number;

  @Column({ length: 50, comment: '分类名称' })
  name: string;

  @Column({ length: 255, nullable: true, comment: '分类描述' })
  description?: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[]; // 关联的商品列表

  @Column({ default: true, name: 'is_active', comment: '分类是否激活' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}