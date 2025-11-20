import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity({ name: 'orders', comment: '订单表' })
export class Order {
  @PrimaryGeneratedColumn({ comment: '订单ID' })
  id: number;

  @Column({ length: 50, comment: '订单编号' })
  orderNo: string;

  @Column({ length: 50, comment: '客户姓名' })
  customerName: string;

  @Column({ length: 20, comment: '客户手机号' })
  customerPhone: string;

  @Column({ length: 255, comment: '收货地址' })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '订单总金额' })
  totalAmount: number;

  @Column({ default: 'pending', comment: '订单状态：pending待处理，processing处理中，shipped已发货，delivered已送达，cancelled已取消' })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '订单备注' })
  remark?: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  items: OrderItem[]; // 订单商品列表

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}