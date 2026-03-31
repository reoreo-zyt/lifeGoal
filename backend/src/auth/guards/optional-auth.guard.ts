import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('optional-jwt') {
  handleRequest(err, user, info) {
    // 允许未认证的请求通过，只是将user设置为null
    return user || null;
  }
}
