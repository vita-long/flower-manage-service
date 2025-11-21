import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity({ name: 'products', comment: '商品表' })
export class Product {
  @PrimaryGeneratedColumn({ comment: '商品ID' })
  id: number;

  @Column({ length: 100, comment: '商品名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品价格' })
  price: number;

  @Column({ default: 0, comment: '商品库存' })
  stock: number;

  @Column({ length: 255, nullable: true, comment: '商品图片URL' })
  image?: string;

  @ManyToOne(() => Category, category => category.products)
  category: Category; // 关联的分类

  @Column({ default: true, comment: '商品状态：true为上架，false为下架' })
  status: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}