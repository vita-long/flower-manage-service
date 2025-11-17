import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '../../entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 创建订单
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  // 获取所有订单
  @Get()
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<{ items: Order[]; total: number }> {
    return this.orderService.getAllOrders(page, pageSize);
  }

  // 根据ID获取订单
  @Get(':id')
  async getOrderById(@Param('id') id: number): Promise<Order> {
    return this.orderService.getOrderById(id);
  }

  // 根据订单号获取订单
  @Get('orderNo/:orderNo')
  async getOrderByOrderNo(@Param('orderNo') orderNo: string): Promise<Order> {
    return this.orderService.getOrderByOrderNo(orderNo);
  }

  // 更新订单状态
  @Put(':id/status')
  async updateOrderStatus(@Param('id') id: number, @Body('status') status: string): Promise<Order> {
    return this.orderService.updateOrderStatus(id, status);
  }

  // 删除订单
  @Delete(':id')
  async deleteOrder(@Param('id') id: number): Promise<{ success: boolean }> {
    const success = await this.orderService.deleteOrder(id);
    return { success };
  }
}