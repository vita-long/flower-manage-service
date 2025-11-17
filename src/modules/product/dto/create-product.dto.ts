import { IsNotEmpty, IsString, IsOptional, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '商品描述必须是字符串' })
  description?: string;

  @IsNotEmpty({ message: '商品价格不能为空' })
  @IsNumber({}, { message: '商品价格必须是数字' })
  @IsPositive({ message: '商品价格必须大于0' })
  price: number;

  @IsNotEmpty({ message: '商品库存不能为空' })
  @IsNumber({}, { message: '商品库存必须是数字' })
  @Min(0, { message: '商品库存不能小于0' })
  stock: number;

  @IsOptional()
  @IsString({ message: '商品图片必须是字符串' })
  image?: string;

  @IsNotEmpty({ message: '商品分类不能为空' })
  @IsNumber({}, { message: '商品分类ID必须是数字' })
  category: number;
}