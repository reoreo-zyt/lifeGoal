import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { UsersModule } from '../users/users.module';
import { Character } from './entities/character.entity';
import { CharacterEvent } from './entities/character-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, CharacterEvent]),
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