import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: '分类状态必须是布尔值' })
  isActiive?: boolean;
}