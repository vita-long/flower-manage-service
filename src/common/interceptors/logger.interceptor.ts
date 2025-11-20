import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    // 记录请求信息
    const { method, originalUrl, ip, headers, body } = request;
    const userAgent = headers['user-agent'];
    
    // 准备请求日志数据，移除敏感信息
    const requestLog = {
      method,
      url: originalUrl,
      ip,
      userAgent,
      headers: {
        'content-type': headers['content-type'],
        'authorization': headers['authorization'] ? 'Bearer ****' : undefined,
      },
      // 对于文件上传等，不记录完整body；同时过滤掉密码等敏感信息
      body: this.shouldLogBody(method, headers['content-type']) ? this.sanitizeBody(body) : '[body omitted]',
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`Request: ${JSON.stringify(requestLog)}`);

    return next.handle().pipe(
      tap((data) => {
        // 记录响应信息
        const responseTime = Date.now() - now;
        const responseLog = {
          method,
          url: originalUrl,
          statusCode: response.statusCode,
          responseTime: `${responseTime}ms`,
          // 对于大响应，只记录基本信息
          responseData: this.shouldLogResponse(data) ? data : '[response data omitted]',
          timestamp: new Date().toISOString(),
        };

        this.logger.log(`Response: ${JSON.stringify(responseLog)}`);
      }),
    );
  }

  // 判断是否应该记录请求体
  private shouldLogBody(method: string, contentType?: string): boolean {
    // 对于GET请求，通常没有body
    if (method === 'GET') return false;
    // 对于multipart/form-data，通常是文件上传，不记录body
    if (contentType && contentType.includes('multipart/form-data')) return false;
    return true;
  }

  // 判断是否应该记录响应数据
  private shouldLogResponse(data: any): boolean {
    // 避免记录过大的响应数据
    if (!data) return false;
    try {
      const dataStr = JSON.stringify(data);
      // 限制响应日志大小，例如不超过10KB
      return dataStr.length < 10 * 1024;
    } catch (e) {
      return false;
    }
  }

  // 清理请求体中的敏感信息
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    
    // 深拷贝body，避免修改原始数据
    const sanitizedBody = { ...body };
    
    // 敏感字段列表，这些字段的值将被替换为掩码
    const sensitiveFields = ['password', 'password_confirmation', 'pwd', 'secret', 'token'];
    
    // 遍历敏感字段并替换
    sensitiveFields.forEach(field => {
      if (sanitizedBody.hasOwnProperty(field)) {
        sanitizedBody[field] = '******';
      }
    });
    
    return sanitizedBody;
  }
}