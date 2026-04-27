import type { Relic, RelicEffects, RelicRarity } from "./types";
import { RELIC_POOL, RELIC_RARITY_WEIGHT } from "./data";

/**
 * 获取遗物 Tooltip 文本
 */
export const getRelicTooltip = (relic: Relic | null): string => {
  if (!relic) return "";
  return `${relic.name}\n${relic.history}\n效果：${relic.effectText}`;
};

/**
 * 根据权重随机选择稀有度
 */
export const pickRarityByWeight = (): RelicRarity => {
  const total = Object.values(RELIC_RARITY_WEIGHT).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (const rarity of ["common", "uncommon", "rare", "legendary"] as RelicRarity[]) {
    roll -= RELIC_RARITY_WEIGHT[rarity];
    if (roll <= 0) return rarity;
  }
  return "common";
};

/**
 * 按权重随机选择指定数量的遗物
 */
export const pickWeightedRelics = (count: number): Relic[] => {
  const available = [...RELIC_POOL];
  const picked: Relic[] = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const rarity = pickRarityByWeight();
    const candidates = available.filter((r) => r.rarity === rarity);

    if (candidates.length === 0) {
      // 如果没有该稀有度的候选，从所有可用中选择
      const idx = Math.floor(Math.random() * available.length);
      picked.push(available.splice(idx, 1)[0]);
    } else {
      const idx = Math.floor(Math.random() * candidates.length);
      const selected = candidates[idx];
      picked.push(selected);
      const availIdx = available.findIndex((r) => r.id === selected.id);
      if (availIdx >= 0) available.splice(availIdx, 1);
    }
  }

  return picked;
};

/**
 * 根据 ID 查找遗物
 */
export const findRelicById = (id: string): Relic | null => {
  return RELIC_POOL.find((r) => r.id === id) || null;
};

/**
 * 计算遗物效果总值
 */
export const getRelicEffectValue = (
  relics: Relic[],
  effectKey: keyof RelicEffects
): number => {
  return relics.reduce((sum, relic) => {
    const value = relic.effects[effectKey];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
};

/**
 * 计算所有遗物效果
 */
export const getAllRelicEffects = (relics: Relic[]): RelicEffects => {
  const result: RelicEffects = {};

  for (const relic of relics) {
    for (const [key, value] of Object.entries(relic.effects)) {
      if (typeof value === "number") {
        const effectKey = key as keyof RelicEffects;
        result[effectKey] = (result[effectKey] || 0) + value;
      }
    }
  }

  return result;
};
