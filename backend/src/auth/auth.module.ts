import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { ArticlesModule } from '../articles/articles.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OptionalJwtStrategy } from './strategies/optional-jwt.strategy';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => ArticlesModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, OptionalJwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule]
})
export class AuthModule {};
