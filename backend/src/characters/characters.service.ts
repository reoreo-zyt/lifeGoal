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

  // 获取所有人物（支持搜索和分页）
  async findAll(params: {
    name?: string;
    dynasty?: string;
    gender?: string;
    yearStart?: number;
    yearEnd?: number;
    page: number;
    pageSize: number;
  }): Promise<{ data: Character[]; total: number }> {
    const { name, dynasty, gender, yearStart, yearEnd, page, pageSize } = params;
    
    // 创建查询构建器
    const queryBuilder = this.characterRepository.createQueryBuilder('character');
    
    // 添加搜索条件
    if (name) {
      queryBuilder.andWhere('character.name LIKE :name', { name: `%${name}%` });
    }
    
    if (dynasty) {
      queryBuilder.andWhere('character.dynasty = :dynasty', { dynasty });
    }
    
    if (gender) {
      queryBuilder.andWhere('character.gender = :gender', { gender });
    }
    
    if (yearStart) {
      queryBuilder.andWhere('character.deathYear >= :yearStart OR character.deathYear IS NULL', { yearStart });
    }
    
    if (yearEnd) {
      queryBuilder.andWhere('character.birthYear <= :yearEnd', { yearEnd });
    }
    
    // 计算总数
    const total = await queryBuilder.getCount();
    
    // 添加分页
    const data = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    return { data, total };
  }

  // 根据ID获取人物
  async findOne(id: number): Promise<Character | null> {
    return await this.characterRepository.findOne({ where: { id } });
  }

  // 创建人物
  async create(characterData: { name: string; gender: string; birthYear: number; deathYear?: number; birthPlace: string; background: string; personality: string; dynasty: string; userId: number; avatar?: string }): Promise<Character> {
    // 根据性别设置默认头像路径
    const avatar = characterData.avatar || (characterData.gender === '女' ? '/images/ancient_character_women.webp' : '/images/ancient_character_men.webp');
    
    const character = this.characterRepository.create({
      ...characterData,
      avatar
    });
    return await this.characterRepository.save(character);
  }

  // 更新人物
  async update(id: number, characterData: { name?: string; gender?: string; birthYear?: number; deathYear?: number; birthPlace?: string; background?: string; personality?: string; dynasty?: string; avatar?: string }): Promise<Character | null> {
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
  async getTimeline(characterId: number): Promise<Array<{ id: number; year: string; age: string; reignYear: string; event: string; source: string; order: number }>> {
    const events = await this.characterEventRepository.find({
      where: { characterId },
      order: { order: 'ASC' }
    });
    
    return events.map(event => ({
      id: event.id,
      year: event.year,
      age: event.age,
      reignYear: event.impact,
      event: event.title,
      source: event.description,
      order: event.order
    }));
  }

  // 添加时间线事件
  async addTimelineEvent(characterId: number, eventData: {
    year: string;
    age: string;
    reignYear: string;
    event: string;
    source: string;
    order: number;
  }): Promise<CharacterEvent> {
    // 检查人物是否存在
    const character = await this.findOne(characterId);
    if (!character) {
      throw new Error('人物不存在');
    }

    const event = this.characterEventRepository.create({
      characterId,
      year: eventData.year,
      age: eventData.age,
      title: eventData.event,
      description: eventData.source,
      impact: eventData.reignYear,
      order: eventData.order
    });

    return await this.characterEventRepository.save(event);
  }

  // 更新时间线事件
  async updateTimelineEvent(id: number, eventData: {
    year?: string;
    age?: string;
    reignYear?: string;
    event?: string;
    source?: string;
    order?: number;
  }): Promise<CharacterEvent | null> {
    const event = await this.characterEventRepository.findOne({ where: { id } });
    if (!event) {
      return null;
    }

    if (eventData.year !== undefined) event.year = eventData.year;
    if (eventData.age !== undefined) event.age = eventData.age;
    if (eventData.reignYear !== undefined) event.impact = eventData.reignYear;
    if (eventData.event !== undefined) event.title = eventData.event;
    if (eventData.source !== undefined) event.description = eventData.source;
    if (eventData.order !== undefined) event.order = eventData.order;

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
    year: string;
    age: string;
    reignYear: string;
    event: string;
    source: string;
  }>): Promise<number> {
    // 检查人物是否存在
    const character = await this.findOne(characterId);
    if (!character) {
      throw new Error('人物不存在');
    }

    const createdEvents = eventsData.map((eventData, index) => 
      this.characterEventRepository.create({
        characterId,
        year: eventData.year,
        age: eventData.age,
        title: eventData.event,
        description: eventData.source,
        impact: eventData.reignYear,
        order: index
      })
    );

    await this.characterEventRepository.save(createdEvents);
    return createdEvents.length;
  }

  // AI 生成人物信息（流式）
  async generatePersonWithAi(name: string, aiToken: string, model: string, callback: (chunk: string) => void): Promise<{ name: string; gender: string; birthYear: number; deathYear?: number; birthPlace: string; background: string; personality: string; dynasty: string }> {
    console.log(name, aiToken, model)
    try {
      // 检查 aiToken 是否为空
      if (!aiToken) {
        console.error('AI 生成失败: 未设置 API Token');
        const defaultResult = {
          name,
          gender: '未知',
          birthYear: 0,
          deathYear: null,
          birthPlace: '未知',
          background: '未知',
          personality: '未知',
          dynasty: '未知'
        };
        callback(JSON.stringify(defaultResult));
        return defaultResult;
      }
      
      // 调用真实的豆包API（流式）
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model,
        messages: [
          {
            role: 'user',
            content: `请识别历史人物 ${name}，并提供以下信息：
1. 性别
2. 出生年份（公元）
3. 死亡年份（公元）
4. 出生地
5. 背景
6. 性格
7. 所属朝代

请以JSON格式返回，例如：（请注意birthYear和deathYear的格式，如果没有具体的就用 3000 表示，公元前则用负数表示）
{
  "name": "李世民",
  "gender": "男",
  "birthYear": 598,
  "deathYear": 649,
  "birthPlace": "陇西成纪",
  "background": "唐高祖李渊次子",
  "personality": "英明果断，雄才大略",
  "dynasty": "唐朝"
}`
          }
        ],
        temperature: 0.7,
        stream: true
      }, {
        headers: {
          'Authorization': `Bearer ${aiToken}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });
      
      let fullContent = '';
      
      for await (const chunk of response.data) {
        const chunkStr = chunk.toString();
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '[DONE]') {
              break;
            }
            
            try {
              const data = JSON.parse(dataStr);
              if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                fullContent += content;
                callback(content);
              }
            } catch (e) {
              console.error('解析流式数据失败:', e);
            }
          }
        }
      }
      
      try {
        // 清理 fullContent，移除可能的前缀或后缀文本
        // 查找 JSON 的开始和结束位置
        const jsonStart = fullContent.indexOf('{');
        const jsonEnd = fullContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = fullContent.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonString);
        } else {
          // 如果没有找到有效的 JSON，返回默认值
          throw new Error('无效的 JSON 格式');
        }
      } catch (parseError) {
        console.error('解析 JSON 失败:', parseError);
        const defaultResult = {
          name,
          gender: '未知',
          birthYear: 0,
          deathYear: null,
          birthPlace: '未知',
          background: '未知',
          personality: '未知',
          dynasty: '未知'
        };
        callback(JSON.stringify(defaultResult));
        return defaultResult;
      }
    } catch (error) {
      console.error('AI 生成失败:', error);
      // 如果API调用失败，返回默认值
      const defaultResult = {
        name,
        gender: '未知',
        birthYear: 0,
        deathYear: null,
        birthPlace: '未知',
        background: '未知',
        personality: '未知',
        dynasty: '未知'
      };
      callback(JSON.stringify(defaultResult));
      return defaultResult;
    }
  }

  // AI 生成事件（流式）
  async generateEventsWithAi(name: string, model: string, aiToken: string, callback: (chunk: string) => void): Promise<Array<{
    year: string;
    age: string;
    reignYear: string;
    event: string;
    source: string;
  }>> {
    console.log(name, model, aiToken)
    try {
      // 检查 aiToken 是否为空
      if (!aiToken) {
        console.error('AI 生成失败: 未设置 API Token');
        callback('[]');
        return [];
      }
      
      // 调用真实的豆包API（流式）
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model: model,
        messages: [
          {
            role: 'user',
            content: `请为历史人物 ${name} 生成详细的生平事件时间线，按照时间顺序排列。每个事件需要包含以下信息：
1. 公元年份（如果具体年份未知，可以使用时期，如"隋大业年间"、"武德年间"等）
2. 虚岁（如果具体年龄未知，可以使用阶段，如"1"、"青年"、"壮年"等）
3. 年号（如果具体年号未知，可以使用时期，如"隋朝晚期"、"唐初"等）
4. 核心正史事迹（简洁描述事件的核心内容）
5. 正史原文摘录（从正史中摘录的相关原文）

请以JSON数组格式返回，数组中每个元素包含year、age、reignYear、event、source字段。例如：
[
  {
    "year": "585",
    "age": "1",
    "reignYear": "隋开皇五年",
    "event": "生于京兆杜氏望族，自幼聪悟好学，喜研文史，性格沉毅有气度",
    "source": "《旧唐书》：如晦少聪悟，好谈文史，临事有决断。"
  },
  {
    "year": "隋大业年间",
    "age": "青年",
    "reignYear": "隋朝晚期",
    "event": "入仕隋廷，见朝政混乱，深知隋室将亡，弃官归隐观望时局",
    "source": "《新唐书》：大业中补官，见世乱，弃官不就。"
  }
]`
          }
        ],
        temperature: 0.7,
        stream: true
      }, {
        headers: {
          'Authorization': `Bearer ${aiToken}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });
      
      let fullContent = '';
      
      for await (const chunk of response.data) {
        const chunkStr = chunk.toString();
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '[DONE]') {
              break;
            }
            
            try {
              const data = JSON.parse(dataStr);
              if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                fullContent += content;
                callback(content);
              }
            } catch (e) {
              console.error('解析流式数据失败:', e);
            }
          }
        }
      }
      
      try {
        return JSON.parse(fullContent);
      } catch (parseError) {
        console.error('解析AI返回的JSON失败:', parseError);
        callback('[]');
        return [];
      }
    } catch (error) {
      console.error('AI 生成失败:', error);
      // 如果API调用失败，返回空数组
      callback('[]');
      return [];
    }
  }

  // 整合AI生成人物和事件的功能
  async generateCharacterWithEvents(name: string, model: string, volcengineToken: string, userId: number, callback: (chunk: string) => void): Promise<{
    character: Character;
    events: Array<CharacterEvent>;
  }> {
    try {
      // 1. 生成人物信息
      callback('正在生成人物基本信息...\n');
      const personData = await this.generatePersonWithAi(name, volcengineToken, model, callback);
      
      // 2. 保存人物信息到数据库
      callback('正在保存人物信息到数据库...\n');
      const character = await this.create({
        ...personData,
        userId
      });
      
      // 3. 生成事件信息
      callback('正在生成人物生平事件...\n');
      const eventsData = await this.generateEventsWithAi(name, model, volcengineToken, callback);
      
      // 4. 保存事件信息到数据库
      callback('正在保存事件信息到数据库...\n');
      const events = await Promise.all(
        eventsData.map((eventData, index) => 
          this.addTimelineEvent(character.id, {
            ...eventData,
            order: index
          })
        )
      );
      
      callback('生成完成！\n');
      return { character, events };
    } catch (error) {
      console.error('AI 生成人物和事件失败:', error);
      callback('生成失败: ' + (error instanceof Error ? error.message : '未知错误') + '\n');
      throw error;
    }
  }
}