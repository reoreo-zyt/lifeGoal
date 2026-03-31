import { Injectable } from '@nestjs/common';

// 人物数据结构
interface Person {
  id: number;
  name: string;
  dynasty: string;
  createdAt: Date;
  updatedAt: Date;
}

// 人物时间线数据结构
interface TimelineEvent {
  id: number;
  personId: number;
  year: string;
  age: string;
  reignYear: string;
  event: string;
  source: string;
  order: number;
  createdAt: Date;
  updatedAt: