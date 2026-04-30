/** 事件所属章节 */
export type EventChapter = 'sui' | 'chen' | 'tang' | 'tian' | 'zhen' | 'hun';

/** 效果类型 */
export type EffectType =
  | 'gold'
  | 'conscript'
  | 'attack'
  | 'defense'
  | 'speed'
  | 'strategy'
  | 'attributePercent'
  | 'moral'
  | 'specialBuff'
  | 'specialDebuff'
  | 'addGeneral';

/** 效果目标 */
export type EffectTarget = 'all' | 'general' | 'specific';

/** 单个效果 */
export interface Effect {
  type: EffectType;
  value: number;
  target?: EffectTarget;
  targetName?: string;
  duration?: number;
  buffId?: string;
}

/** 单个选项 */
export interface EventChoice {
  label: string;
  description: string;
  effects: Effect[];
  disablesEvents?: string[];
  enablesEvents?: string[];
  flags?: string[];
}

/** 完整事件 */
export interface MapEvent {
  id: string;
  title: string;
  narrative: string;
  narrativeSource: string;
  chapter: EventChapter;
  choiceA: EventChoice;
  choiceB: EventChoice;
  requiredGenerals: string[];
  weightBonus: Record<string, number>;
}
