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
  async create(personData: { name: string; dynasty: string; birthYear: string; deathYear: string }): Promise<Person> {
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

  // 初始化人物数据
  async initializeData() {
    // 检查是否已有数据
    if (persons.length > 0) {
      return;
    }

    // 添加初始人物数据
    const initialPersons = [
      { name: '李密', dynasty: '隋末', birthYear: '', deathYear: '' },
      { name: '李渊', dynasty: '隋唐', birthYear: '', deathYear: '' },
      { name: '李世民', dynasty: '唐', birthYear: '', deathYear: '' },
      { name: '窦建德', dynasty: '隋末', birthYear: '', deathYear: '' },
    ];

    for (const personData of initialPersons) {
      await this.create(personData);
    }
  }

  // AI 生成人物信息
  async generatePersonWithAi(name: string): Promise<{ name: string; dynasty: string; birthYear: string; deathYear: string }> {
    try {
      // 这里使用模拟数据，实际项目中需要替换为真实的豆包API调用
      // const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      //   model: 'ep-20250721184613-99r2n',
      //   messages: [
      //     {
      //       role: 'user',
      //       content: `请识别历史人物 ${name}，并提供以下信息：
      //       1. 所属朝代
      //       2. 出生年份（公元）
      //       3. 死亡年份（公元）
      //       
      //       请以JSON格式返回，例如：
      //       {
      //         "name": "李世民",
      //         "dynasty": "唐",
      //         "birthYear": "598",
      //         "deathYear": "649"
      //       }`
      //     }
      //   ],
      //   temperature: 0.7
      // }, {
      //   headers: {
      //     'Authorization': 'Bearer YOUR_API_KEY',
      //     'Content-Type': 'application/json'
      //   }
      // });
      // 
      // const data = response.data.choices[0].message.content;
      // return JSON.parse(data);

      // 模拟数据
      const mockData: Record<string, { dynasty: string; birthYear: string; deathYear: string }> = {
        '杨坚': { dynasty: '隋', birthYear: '541', deathYear: '604' },
        '杨广': { dynasty: '隋', birthYear: '569', deathYear: '618' },
        '李渊': { dynasty: '隋唐', birthYear: '566', deathYear: '635' },
        '李世民': { dynasty: '唐', birthYear: '598', deathYear: '649' },
        '李治': { dynasty: '唐', birthYear: '628', deathYear: '683' },
        '武则天': { dynasty: '唐', birthYear: '624', deathYear: '705' },
        '李隆基': { dynasty: '唐', birthYear: '685', deathYear: '762' },
        '安禄山': { dynasty: '唐', birthYear: '703', deathYear: '757' },
        '史思明': { dynasty: '唐', birthYear: '703', deathYear: '761' },
        '李密': { dynasty: '隋末', birthYear: '582', deathYear: '619' },
        '窦建德': { dynasty: '隋末', birthYear: '573', deathYear: '621' },
        '王世充': { dynasty: '隋末', birthYear: '？', deathYear: '621' },
        '杜伏威': { dynasty: '隋末', birthYear: '598', deathYear: '624' },
        '辅公祏': { dynasty: '隋末', birthYear: '？', deathYear: '624' },
        '薛举': { dynasty: '隋末', birthYear: '？', deathYear: '618' },
        '李轨': { dynasty: '隋末', birthYear: '？', deathYear: '619' },
        '刘武周': { dynasty: '隋末', birthYear: '？', deathYear: '620' },
        '梁师都': { dynasty: '隋末', birthYear: '？', deathYear: '628' },
        '萧铣': { dynasty: '隋末', birthYear: '583', deathYear: '621' },
        '沈法兴': { dynasty: '隋末', birthYear: '？', deathYear: '621' },
        '李子通': { dynasty: '隋末', birthYear: '？', deathYear: '622' },
        '林士弘': { dynasty: '隋末', birthYear: '？', deathYear: '622' },
        '宇文化及': { dynasty: '隋末', birthYear: '？', deathYear: '619' },
        '魏征': { dynasty: '唐', birthYear: '580', deathYear: '643' },
        '房玄龄': { dynasty: '唐', birthYear: '579', deathYear: '648' },
        '杜如晦': { dynasty: '唐', birthYear: '585', deathYear: '630' },
        '长孙无忌': { dynasty: '唐', birthYear: '594', deathYear: '659' },
        '尉迟恭': { dynasty: '唐', birthYear: '585', deathYear: '658' },
        '秦琼': { dynasty: '唐', birthYear: '？', deathYear: '638' },
        '程咬金': { dynasty: '唐', birthYear: '589', deathYear: '665' },
        '李靖': { dynasty: '唐', birthYear: '571', deathYear: '649' },
        '李勣': { dynasty: '唐', birthYear: '594', deathYear: '669' },
        '苏定方': { dynasty: '唐', birthYear: '592', deathYear: '667' },
        '薛仁贵': { dynasty: '唐', birthYear: '614', deathYear: '683' },
        '高仙芝': { dynasty: '唐', birthYear: '？', deathYear: '756' },
        '封常清': { dynasty: '唐', birthYear: '？', deathYear: '756' },
        '郭子仪': { dynasty: '唐', birthYear: '697', deathYear: '781' },
        '李光弼': { dynasty: '唐', birthYear: '708', deathYear: '764' },
        '颜真卿': { dynasty: '唐', birthYear: '709', deathYear: '784' },
        '柳公权': { dynasty: '唐', birthYear: '778', deathYear: '865' },
        '白居易': { dynasty: '唐', birthYear: '772', deathYear: '846' },
        '李白': { dynasty: '唐', birthYear: '701', deathYear: '762' },
        '杜甫': { dynasty: '唐', birthYear: '712', deathYear: '770' },
        '王维': { dynasty: '唐', birthYear: '701', deathYear: '761' },
        '孟浩然': { dynasty: '唐', birthYear: '689', deathYear: '740' },
        '王昌龄': { dynasty: '唐', birthYear: '698', deathYear: '757' },
        '高适': { dynasty: '唐', birthYear: '704', deathYear: '765' },
        '岑参': { dynasty: '唐', birthYear: '715', deathYear: '770' },
        '韩愈': { dynasty: '唐', birthYear: '768', deathYear: '824' },
        '柳宗元': { dynasty: '唐', birthYear: '773', deathYear: '819' },
        '刘禹锡': { dynasty: '唐', birthYear: '772', deathYear: '842' },
        '李贺': { dynasty: '唐', birthYear: '790', deathYear: '816' },
        '杜牧': { dynasty: '唐', birthYear: '803', deathYear: '852' },
        '李商隐': { dynasty: '唐', birthYear: '813', deathYear: '858' }
      };

      if (mockData[name]) {
        return {
          name,
          dynasty: mockData[name].dynasty,
          birthYear: mockData[name].birthYear,
          deathYear: mockData[name].deathYear
        };
      } else {
        // 如果没有匹配的模拟数据，返回默认值
        return {
          name,
          dynasty: '未知',
          birthYear: '？',
          deathYear: '？'
        };
      }
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
}