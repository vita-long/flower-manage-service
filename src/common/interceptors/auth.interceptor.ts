import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WHITE_LIST } from '../constants/white';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // 检查当前请求是否在白名单中
    const isInWhiteList = WHITE_LIST.some(path => 
      request.path.startsWith(path) || request.path === path
    );
    
    if (!isInWhiteList) {
      // 这里可以添加一些预检查逻辑
      // 实际的JWT验证由JwtStrategy处理
    }
    
    return next.handle();
  }
}