import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT认证装饰器
export function Auth() {
  return applyDecorators(UseGuards(AuthGuard('jwt')));
}

// 可选的权限装饰器，可以根据需要扩展
export function Roles(...roles: number[]) {
  // 这里可以实现基于角色的权限控制
  return applyDecorators(UseGuards(AuthGuard('jwt')));
}