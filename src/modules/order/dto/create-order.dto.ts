import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsNumber({}, { message: '商品ID必须是数字' })
  productId: number;

  @IsNotEmpty({ message: '商品数量不能为空' })
  @IsNumber({}, { message: '商品数量必须是数字' })
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: '客户姓名不能为空' })
  @IsString({ message: '客户姓名必须是字符串' })
  customerName: string;

  @IsNotEmpty({ message: '客户电话不能为空' })
  @IsString({ message: '客户电话必须是字符串' })
  customerPhone: string;

  @IsNotEmpty({ message: '收货地址不能为空' })
  @IsString({ message: '收货地址必须是字符串' })
  address: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;

  @IsNotEmpty({ message: '订单商品列表不能为空' })
  @IsArray({ message: '订单商品列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}