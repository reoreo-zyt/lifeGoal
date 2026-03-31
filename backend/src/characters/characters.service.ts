import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Character } from './entities/character.entity';
import { CharacterEvent } from './entities/character-event.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(CharacterEvent)
    private characterEventRepository: Repository<CharacterEvent>,
  ) {}

  // 获取所有人物
  async findAll(): Promise<Character[]> {
    return await this.characterRepository.find();
  }

  // 根据ID获取人物
  async findOne(id: number): Promise<Character | null> {
    return await this.characterRepository.findOne({ where: { id } });
  }

  // 创建人物
  async create(characterData: { name: string; gender: string; birthYear: number; birthPlace: string; background: string; personality: string; userId: number }): Promise<Character> {
    const character = this.characterRepository.create(characterData);
    return await this.characterRepository.save(character);
  }

  // 更新人物
  async update(id: number, characterData: { name?: string; gender?: string; birthYear?: number; birthPlace?: string; background?: string; personality?: string }): Promise<Character | null> {
    const character = await this.characterRepository.findOne({ where: { id } });
    if (!character) {
      return null;
    }
    
    Object.assign(character, characterData);
    return await this.characterRepository.save(character);
  }

  // 删除人物
  async remove(id: number): Promise<boolean> {
    const character = await this.characterRepository.findOne({ where: { id } });
    if (!character) {
      return false;
    }

    // 同时删除相关的时间线事件
    await this.characterEventRepository.delete({ characterId: id });
    await this.characterRepository.remove(character);
    return true;
  }

  // 获取人物的时间线
  async getTimeline(characterId: number): Promise<CharacterEvent[]> {
    return await this.characterEventRepository.find({
      where: { characterId },
      order: { year: 'ASC' }
    });
  }

  // 添加时间线事件
  async addTimelineEvent(characterId: number, eventData: {
    year: number;
    title: string;
    description: string;
    impact: string;
  }): Promise<CharacterEvent> {
    // 检查人物是否存在
    const character = await this.findOne(characterId);
    if (!character) {
      throw new Error('人物不存在');
    }

    const event = this.characterEventRepository.create({
      characterId,
      ...eventData,
    });

    return await this.characterEventRepository.save(event);
  }

  // 更新时间线事件
  async updateTimelineEvent(id: number, eventData: {
    year?: number;
    title?: string;
    description?: string;
    impact?: string;
  }): Promise<CharacterEvent | null> {
    const event = await this.characterEventRepository.findOne({ where: { id } });
    if (!event) {
      return null;
    }

    Object.assign(event, eventData);
    return await this.characterEventRepository.save(event);
  }

  // 删除时间线事件
  async removeTimelineEvent(id: number): Promise<boolean> {
    const event = await this.characterEventRepository.findOne({ where: { id } });
    if (!event) {
      return false;
    }

    await this.characterEventRepository.remove(event);
    return true;
  }

  // 批量添加时间线事件
  async batchAddTimelineEvents(characterId: number, eventsData: Array<{
    year: number;
    title: string;
    description: string;
    impact: string;
  }>): Promise<number> {
    // 检查人物是否存在
    const character = await this.findOne(characterId);
    if (!character) {
      throw new Error('人物不存在');
    }

    const createdEvents = eventsData.map(eventData => 
      this.characterEventRepository.create({
        characterId,
        ...eventData,
      })
    );

    await this.characterEventRepository.save(createdEvents);
    return createdEvents.length;
  }

  // AI 生成人物信息
  async generatePersonWithAi(name: string, aiToken: string, model: string): Promise<{ name: string; gender: string; birthYear: number; birthPlace: string; background: string; personality: string }> {
    try {
      // 检查 aiToken 是否为空
      if (!aiToken) {
        console.error('AI 生成失败: 未设置 API Token');
        return {
          name,
          gender: '未知',
          birthYear: 0,
          birthPlace: '未知',
          background: '未知',
          personality: '未知'
        };
      }
      
      // 调用真实的豆包API
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model,
        messages: [
          {
            role: 'user',
            content: `请识别历史人物 ${name}，并提供以下信息：
1. 性别
2. 出生年份（公元）
3. 出生地
4. 背景
5. 性格

请以JSON格式返回，例如：
{
  "name": "李世民",
  "gender": "男",
  "birthYear": 598,
  "birthPlace": "陇西成纪",
  "background": "唐高祖李渊次子",
  "personality": "英明果断，雄才大略"
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
        gender: '未知',
        birthYear: 0,
        birthPlace: '未知',
        background: '未知',
        personality: '未知'
      };
    }
  }

  // AI 生成事件
  async generateEventsWithAi(name: string, model: string, aiToken: string): Promise<Array<{
    year: number;
    title: string;
    description: string;
    impact: string;
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
            content: `请为历史人物 ${name} 生成详细的生平事件时间线，按照时间顺序排列。每个事件需要包含以下信息：
1. 公元年份
2. 事件标题
3. 事件描述
4. 事件影响

请以JSON数组格式返回，数组中每个元素包含year、title、description、impact字段。例如：
[
  {
    "year": 598,
    "title": "出生",
    "description": "李世民出生于陇西成纪",
    "impact": "未来的唐太宗诞生"
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