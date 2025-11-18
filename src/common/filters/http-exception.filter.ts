import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ResponseBody } from '../interfaces/response-body.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    // 统一错误响应格式
    const errorResponse: ResponseBody<null> = {
      code: status,
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any)?.message || '服务器错误',
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}

// 全局异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // 默认500错误
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;
    
    const errorResponse: ResponseBody<null> = {
      code: status,
      message: exception.message || '服务器内部错误',
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}