import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '60s' },
    }),
    UsersModule,
  ],
  providers: [CharactersService],
  controllers: [CharactersController],
  exports: [CharactersService],
})
export class CharactersModule {};