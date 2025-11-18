import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseBody } from '../interfaces/response-body.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseBody<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseBody<T>> {
    return next.handle().pipe(
      map(data => ({
        code: 200,
        message: 'success',
        data: data || null,
      })),
    );
  }
}