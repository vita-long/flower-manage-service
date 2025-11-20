import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity({ name: 'order_items', comment: '订单商品明细表' })
export class OrderItem {
  @PrimaryGeneratedColumn({ comment: '订单商品明细ID' })
  id: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order; // 关联订单

  @Column({ comment: '商品ID' })
  productId: number;

  @Column({ length: 100, comment: '商品名称' })
  productName: string;

  @Column({ length: 255, nullable: true, comment: '商品图片URL' })
  productImage?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品单价' })
  price: number;

  @Column({ comment: '购买数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品小计金额' })
  subtotal: number;
}