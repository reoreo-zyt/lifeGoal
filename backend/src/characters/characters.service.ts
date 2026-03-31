import { Injectable } from '@nestjs/common';
import axios from 'axios';

// 人物数据结构
export interface Person {
  id: number;
  name: string;
  dynasty: string;
  birthYear: string;
  deathYear: string;
  createdAt: Date;
  updatedAt: Date;
}

// 人物时间线数据结构
export interface TimelineEvent {
  id: number;
  personId: number;
  year: string;
  age: string;
  reignYear: string;
  event: string;
  source: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// 内存存储
let persons: Person[] = [];
let timelineEvents: TimelineEvent[] = [];
let nextPersonId = 1;
let nextEventId = 1;

@Injectable()
export class CharactersService {
  // 获取所有人物
  async findAll(): Promise<Person[]> {
    return persons;
  }

  // 根据ID获取人物
  async findOne(id: number): Promise<Person | null> {
    return persons.find(person => person.id === id) || null;
  }

  // 创建人物
  async create(personData: { name: string; dynasty: string; birthYear?: string; deathYear?: string }): Promise<Person> {
    const person: Person = {
      id: nextPersonId++,
      name: personData.name,
      dynasty: personData.dynasty,
      birthYear: personData.birthYear || '',
      deathYear: personData.deathYear || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    persons.push(person);
    return person;
  }

  // 更新人物
  async update(id: number, personData: { name?: string; dynasty?: string; birthYear?: string; deathYear?: string }): Promise<Person | null> {
    const index = persons.findIndex(person => person.id === id);
    if (index === -1) {
      return null;
    }

    persons[index] = {
      ...persons[index],
      ...personData,
      updatedAt: new Date(),
    };
    return persons[index];
  }

  // 删除人物
  async remove(id: number): Promise<boolean> {
    const index = persons.findIndex(person => person.id === id);
    if (index === -1) {
      return false;
    }

    // 同时删除相关的时间线事件
    timelineEvents = timelineEvents.filter(event => event.personId !== id);
    persons.splice(index, 1);
    return true;
  }

  // 获取人物的时间线
  async getTimeline(personId: number): Promise<TimelineEvent[]> {
    return timelineEvents
      .filter(event => event.personId === personId)
      .sort((a, b) => a.order - b.order);
  }

  // 添加时间线事件
  async addTimelineEvent(personId: number, eventData: {
    year: string;
    age: string;
    reignYear: string;
    event: string;
    source: string;
    order?: number;
  }): Promise<TimelineEvent> {
    // 检查人物是否存在
    const person = await this.findOne(personId);
    if (!person) {
      throw new Error('人物不存在');
    }

    // 计算默认顺序
    const maxOrder = Math.max(
      ...timelineEvents
        .filter(event => event.personId === personId)
        .map(event => event.order),
      -1
    );

    const timelineEvent: TimelineEvent = {
      id: nextEventId++,
      personId,
      year: eventData.year,
      age: eventData.age,
      reignYear: eventData.reignYear,
      event: eventData.event,
      source: eventData.source,
      order: eventData.order || maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    timelineEvents.push(timelineEvent);
    return timelineEvent;
  }

  // 更新时间线事件
  async updateTimelineEvent(id: number, eventData: {
    year?: string;
    age?: string;
    reignYear?: string;
    event?: string;
    source?: string;
    order?: number;
  }): Promise<TimelineEvent | null> {
    const index = timelineEvents.findIndex(event => event.id === id);
    if (index === -1) {
      return null;
    }

    timelineEvents[index] = {
      ...timelineEvents[index],
      ...eventData,
      updatedAt: new Date(),
    };
    return timelineEvents[index];
  }

  // 删除时间线事件
  async removeTimelineEvent(id: number): Promise<boolean> {
    const index = timelineEvents.findIndex(event => event.id === id);
    if (index === -1) {
      return false;
    }

    timelineEvents.splice(index, 1);
    return true;
  }

  // 重新排序时间线事件
  async reorderTimelineEvents(personId: number, eventOrders: { id: number; order: number }[]): Promise<void> {
    eventOrders.forEach(({ id, order }) => {
      const event = timelineEvents.find(e => e.id === id && e.personId === personId);
      if (event) {
        event.order = order;
        event.updatedAt = new Date();
      }
    });
  }

  // 批量添加时间线事件
  async batchAddTimelineEvents(personId: number, eventsData: Array<{
    year: string;
    age: string;
    reignYear: string;
    event: string;
    source: string;
    order?: number;
  }>): Promise<number> {
    // 检查人物是否存在
    const person = await this.findOne(personId);
    if (!person) {
      throw new Error('人物不存在');
    }

    // 计算默认顺序的起始值
    const maxOrder = Math.max(
      ...timelineEvents
        .filter(event => event.personId === personId)
        .map(event => event.order),
      -1
    );

    let currentOrder = maxOrder + 1;
    const createdEvents: TimelineEvent[] = [];

    for (const eventData of eventsData) {
      const timelineEvent: TimelineEvent = {
        id: nextEventId++,
        personId,
        year: eventData.year,
        age: eventData.age,
        reignYear: eventData.reignYear,
        event: eventData.event,
        source: eventData.source,
        order: eventData.order || currentOrder++,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      createdEvents.push(timelineEvent);
    }

    // 批量添加到存储
    timelineEvents.push(...createdEvents);
    return createdEvents.length;
  }

  // 初始化人物数据
  async initializeData() {
    // 检查是否已有数据
    if (persons.length > 0) {
      return;
    }

    // 添加初始人物数据
    const initialPersons = [
      // { name: '李密', dynasty: '隋末', birthYear: '', deathYear: '' },
      // { name: '李渊', dynasty: '隋唐', birthYear: '', deathYear: '' },
      // { name: '李世民', dynasty: '唐', birthYear: '', deathYear: '' },
      // { name: '窦建德', dynasty: '隋末', birthYear: '', deathYear: '' },
    ];

    for (const personData of initialPersons) {
      await this.create(personData);
    }
  }

  // AI 生成人物信息
  async generatePersonWithAi(name: string, aiToken: string, model: string): Promise<{ name: string; dynasty: string; birthYear: string; deathYear: string }> {
    try {
      // 检查 aiToken 是否为空
      if (!aiToken) {
        console.error('AI 生成失败: 未设置 API Token');
        return {
          name,
          dynasty: '未知',
          birthYear: '？',
          deathYear: '？'
        };
      }
      
      // 调用真实的豆包API
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model,
        messages: [
          {
            role: 'user',
            content: `请识别历史人物 ${name}，并提供以下信息：
1. 所属朝代
2. 出生年份（公元）
3. 死亡年份（公元）

请以JSON格式返回，例如：
{
  "name": "李世民",
  "dynasty": "唐",
  "birthYear": "598",
  "deathYear": "649"
}`
          }
        ],
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${aiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data.choices[0].message.content;
      return JSON.parse(data);
    } catch (error) {
      console.error('AI 生成失败:', error);
      // 如果API调用失败，返回默认值
      return {
        name,
        dynasty: '未知',
        birthYear: '？',
        deathYear: '？'
      };
    }
  }

  // AI 生成事件
  async generateEventsWithAi(name: string, dynasty: string, model: string, aiToken: string): Promise<Array<{
    year: string;
    age: string;
    reignYear: string;
    event: string;
    source: string;
  }>> {
    try {
      // 检查 aiToken 是否为空
      if (!aiToken) {
        console.error('AI 生成失败: 未设置 API Token');
        return [];
      }
      
      // 调用真实的豆包API
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model: model,
        messages: [
          {
            role: 'user',
            content: `请为历史人物 ${name}（${dynasty}）生成详细的生平事件时间线，按照时间顺序排列。每个事件需要包含以下信息：
1. 公元年份（如：580、隋末、贞观初年等）
2. 虚岁（如：1、青年、中年等）
3. 所用年号（如：北周大象二年、大业年间、贞观年间等）
4. 核心正史事迹（简要描述该事件）
5. 正史原文摘录（包含出处，如：《旧唐书》：xxx）

请以JSON数组格式返回，数组中每个元素包含year、age、reignYear、event、source字段。例如：
[
  {
    "year": "580",
    "age": "1",
    "reignYear": "北周大象二年",
    "event": "生于巨鹿魏氏，年少孤贫，胸怀大志，专心读书不喜谋生",
    "source": "《旧唐书》：征少孤贫，落拓有大志，不营生业。"
  }
]`
          }
        ],
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${aiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data.choices[0].message.content;
      return JSON.parse(data);
    } catch (error) {
      console.error('AI 生成失败:', error);
      // 如果API调用失败，返回空数组
      return [];
    }
  }
}