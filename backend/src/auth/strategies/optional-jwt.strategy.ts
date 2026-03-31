import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(Strategy, 'optional-jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    if (!payload) {
      return null;
    }
    
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) {
      return null;
    }
    return user;
  }
}
