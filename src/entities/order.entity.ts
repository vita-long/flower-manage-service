import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  orderNo: string;

  @Column({ length: 50 })
  customerName: string;

  @Column({ length: 20 })
  customerPhone: string;

  @Column({ length: 255 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: 'pending' })
  status: string; // pending, processing, shipped, delivered, cancelled

  @Column({ type: 'text', nullable: true })
  remark?: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}