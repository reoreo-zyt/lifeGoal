import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Download {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  bookId: string;

  @Column()
  bookTitle: string;

  @Column()
  format: string;

  @CreateDateColumn()
  createdAt: Date;
}
