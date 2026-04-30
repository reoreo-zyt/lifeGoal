// 遗物稀有度
export type RelicRarity = "common" | "rare" | "epic" | "legendary";

// 遗物效果分类
export type RelicCategory =
  | "teamBuff"    // 全军增益
  | "debuff"      // 全局给敌方施加减益
  | "resource"    // 资源获取、商店相关
  | "survival"    // 全队生存、续航、恢复
  | "explore"     // 探索辅助、地图可见性
  | "special";    // 特殊机制（Boss特攻、胜利加成等）

// 遗物效果描述
export interface RelicEffect {
  description: string;
  scope: "team" | "enemy" | "global" | "self";
}

// 套装奖励
export interface RelicSetBonus {
  pieces: 2 | 4;
  description: string;
}

// 遗物套装定义
export interface RelicSet {
  id: string;
  name: string;
  books: string[];       // 对应典籍名称
  description: string;   // 套装主题描述
  pieces: RelicSetBonus[];
}

// 遗物接口
export interface Relic {
  id: string;
  name: string;
  rarity: RelicRarity;
  setId: string | null;
  category: RelicCategory;
  tags: string[];
  icon: string;
  effect: RelicEffect;
  /** 数值型效果（旧版兼容，用于代码计算） */
  effects?: {
    defensePct?: number;
    debuffResistChance?: number;
    turnEndHealPct?: number;
    commandPct?: number;
    siegePct?: number;
    physicalDamagePct?: number;
    strategyPct?: number;
    activeSkillChancePct?: number;
    strategyDamagePct?: number;
    resourcePerTurn?: number;
    resourceEfficiencyPct?: number;
    cavalrySpeedPct?: number;
    cavalryDoubleStrikeChance?: number;
    strategyDamageReductionPct?: number;
    speedPct?: number;
    physicalDamageReductionPct?: number;
    lowTroopsDefenseBonusPct?: number;
    lowTroopsThreshold?: number;
    healEffectPct?: number;
    followUpChancePct?: number;
    followUpExtraDamagePct?: number;
    counterChancePct?: number;
    counterDamagePct?: number;
    shieldPct?: number;
    bossDamagePct?: number;
    firstStrikeChancePct?: number;
    extraRecruitTimes?: number;
    debuffStacking?: number;
    silenceChancePct?: number;
    burnDamagePct?: number;
    controlImmune?: boolean;
    refundSkillCard?: boolean;
    victoryStack?: number;
    lethalImmune?: boolean;
    controlReflect?: boolean;
    nearDeathHealPct?: number;
    // 探索类
    revealNodes?: boolean;
    guaranteedTreasure?: boolean;
    treasureAfterElite?: boolean;
    revealAllNodes?: boolean;
  };
  source: "treasure" | "elite" | "boss" | "event";
  /** 历史典籍背景描述（lore） */
  lore: string;
  /** 效果文本（用于UI展示） */
  effectText: string;
}

// 稀有度颜色配置
export const RARITY_COLORS: Record<RelicRarity, string> = {
  common: "#9e9e9e",
  rare: "#a855f7",    // 紫
  epic: "#a855f7",    // 紫（与rare同色，稀有度名称区分）
  legendary: "#ffd700",
};

// 稀有度中文名称
export const RARITY_NAMES: Record<RelicRarity, string> = {
  common: "普通",
  rare: "史诗",
  epic: "神话",
  legendary: "传说",
};
