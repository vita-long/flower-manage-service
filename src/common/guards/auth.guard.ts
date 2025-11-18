import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WHITE_LIST } from '../constants/white';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // 检查当前请求是否在白名单中
    const isInWhiteList = WHITE_LIST.some(path => 
      request.path.startsWith(path) || request.path === path
    );
    
    if (isInWhiteList) {
      return true; // 白名单路径跳过认证
    }
    
    // 非白名单路径执行JWT认证
    return super.canActivate(context);
  }
}