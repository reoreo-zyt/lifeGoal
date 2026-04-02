import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ default: 0 })
  readCount: number;

  @Column({ type: 'datetime', nullable: true })
  publishTime: Date;

  @Column({ nullable: true })
  author: string;

  @Column({ default: '今日头条' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}