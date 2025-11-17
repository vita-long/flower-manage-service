import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Product } from '../../entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // 生成订单号
  private generateOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD${timestamp}${random.toString().padStart(4, '0')}`;
  }

  // 创建订单（使用事务确保数据一致性）
  async createOrder(
    createOrderDto: CreateOrderDto
  ): Promise<Order> {
    // 使用默认仓库
    const orderRepo = this.orderRepository;
    const orderItemRepo = this.orderItemRepository;
    const productRepo = this.productRepository;

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    // 验证并处理每个订单项
    for (const item of createOrderDto.items) {
      const product = await productRepo.findOneBy({ id: item.productId });
      if (!product) {
        throw new NotFoundException(`商品ID ${item.productId} 不存在`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`商品 ${product.name} 库存不足`);
      }

      // 减少库存
      product.stock -= item.quantity;
      await productRepo.save(product);

      // 计算金额
      const itemAmount = product.price * item.quantity;
      totalAmount += itemAmount;

      // 创建订单项 - 使用正确的属性名称
      const orderItem: Partial<OrderItem> = {
        productId: item.productId,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemAmount,
      };
      orderItems.push(orderItem as OrderItem);
    }

    // 创建订单
    const order = orderRepo.create({
      orderNo: this.generateOrderNo(),
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      address: createOrderDto.address,
      remark: createOrderDto.remark,
      totalAmount,
      status: 'pending',
    });

    const savedOrder = await orderRepo.save(order);
    
    // 为订单项设置订单ID并保存
    for (const item of orderItems) {
      item.order = savedOrder;
      await orderItemRepo.save(item);
    }

    return savedOrder;
  }

  // 获取所有订单（带分页）
  async getAllOrders(page: number = 1, pageSize: number = 10): Promise<{ items: Order[]; total: number }> {
    const [items, total] = await this.orderRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  // 根据ID获取订单
  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  // 更新订单状态
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('无效的订单状态');
    }

    order.status = status;
    await this.orderRepository.save(order);
    return this.getOrderById(id);
  }

  // 删除订单
  async deleteOrder(id: number): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 先删除所有订单项
    await this.orderItemRepository.delete({ order: { id } });
    
    // 删除订单
    const result = await this.orderRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  // 根据订单号查询订单
  async getOrderByOrderNo(orderNo: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNo },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }
}