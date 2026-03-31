import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Character } from './character.entity';

@Entity()
export class CharacterEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  characterId: number;

  @Column()
  year: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  impact: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Character, character => character.events)
  character: Character;
}