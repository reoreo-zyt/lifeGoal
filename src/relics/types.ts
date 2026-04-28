// 遗物效果接口
export interface RelicEffects {
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
}

// 遗物接口
export interface Relic {
  id: string;
  name: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  history: string;
  effectText: string;
  effects: RelicEffects;
}

// 遗物稀有度
export type RelicRarity = "common" | "uncommon" | "rare" | "legendary";

// 遗物稀有度配置
export const RARITY_COLORS: Record<RelicRarity, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  legendary: "#ff9800",
};

export const RARITY_NAMES: Record<RelicRarity, string> = {
  common: "普通",
  uncommon: "稀有",
  rare: "史诗",
  legendary: "传说",
};
