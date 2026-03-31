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
  async create(personData: { name: string; dynasty: string }): Promise<Person> {
    const person: Person = {
      id: nextPersonId++,
      name: personData.name,
      dynasty: personData.dynasty,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    persons.push(person);
    return person;
  }

  // 更新人物
  async update(id: number, personData: { name?: string; dynasty?: string }): Promise<Person | null> {
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

  // 初始化人物数据
  async initializeData() {
    // 检查是否已有数据
    if (persons.length > 0) {
      return;
    }

    // 添加初始人物数据
    const initialPersons = [
      { name: '李密', dynasty: '隋末' },
      { name: '李渊', dynasty: '隋唐' },
      { name: '李世民', dynasty: '唐' },
      { name: '窦建德', dynasty: '隋末' },
    ];

    for (const personData of initialPersons) {
      await this.create(personData);
    }
  }
}