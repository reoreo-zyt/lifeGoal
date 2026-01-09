import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data,
          code: 0,
          msg: '请求成功',
        };
      }),
    );
  }
}
