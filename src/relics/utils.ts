import type { Relic, RelicRarity } from "./types";
import {
  RELIC_POOL,
  RELIC_RARITY_WEIGHT,
  TREASURE_DROP_RELICS,
  ELITE_DROP_RELICS,
  BOSS_DROP_RELICS,
} from "./data";

export type RelicSource = "treasure" | "elite" | "boss" | "event";

/**
 * 获取遗物 Tooltip 文本
 */
export function getRelicTooltip(relic: Relic | null): string {
  if (!relic) return "";
  const setInfo = relic.setId ? `\n【套装遗物】` : "";
  return `${relic.name} ${setInfo}\n${relic.lore}\n效果：${relic.effectText}`;
}

/**
 * 根据权重随机选择稀有度
 */
export function pickRarityByWeight(
  pool?: Relic[]
): RelicRarity {
  const sourcePool = pool ?? RELIC_POOL;
  const weights: Record<RelicRarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  for (const r of sourcePool) {
    weights[r.rarity] = (weights[r.rarity] ?? 0) + 1;
  }

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return "common";

  let roll = Math.random() * total;
  for (const rarity of ["common", "rare", "epic", "legendary"] as RelicRarity[]) {
    roll -= weights[rarity];
    if (roll <= 0) return rarity;
  }
  return "common";
}

/**
 * 根据稀有度权重表随机选择稀有度（旧版兼容）
 */
export function pickRarityByLegacyWeight(): RelicRarity {
  const total = Object.values(RELIC_RARITY_WEIGHT).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (const rarity of ["common", "rare", "epic", "legendary"] as RelicRarity[]) {
    const weight = RELIC_RARITY_WEIGHT[rarity] ?? 0;
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return "common";
}

/**
 * 按权重随机选择指定数量的遗物
 * @param count 选取数量
 * @param sourceFilter 可选，按来源过滤
 * @param ownedIds 排除已拥有的ID（可选）
 */
export function pickWeightedRelics(
  count: number,
  sourceFilter?: RelicSource,
  ownedIds: string[] = []
): Relic[] {
  let pool = [...RELIC_POOL];

  // 按来源过滤
  if (sourceFilter === "treasure") {
    pool = TREASURE_DROP_RELICS;
  } else if (sourceFilter === "elite") {
    pool = ELITE_DROP_RELICS;
  } else if (sourceFilter === "boss") {
    pool = BOSS_DROP_RELICS;
  }

  // 排除已拥有
  pool = pool.filter((r) => !ownedIds.includes(r.id));

  const picked: Relic[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const rarity = pickRarityByWeight(pool);
    const candidates = pool.filter((r) => r.rarity === rarity);

    if (candidates.length === 0) {
      // 没有该稀有度的候选，从所有剩余中随机选
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    } else {
      const idx = Math.floor(Math.random() * candidates.length);
      const selected = candidates[idx];
      picked.push(selected);
      const poolIdx = pool.findIndex((r) => r.id === selected.id);
      if (poolIdx >= 0) pool.splice(poolIdx, 1);
    }
  }

  return picked;
}

/**
 * 根据 ID 查找遗物
 */
export function findRelicById(id: string): Relic | null {
  return RELIC_POOL.find((r) => r.id === id) ?? null;
}

/**
 * 从敌方波次配置中获取遗物（旧版兼容）
 */
export function getEnemyWaveRelic(wave: number): Relic | null {
  const config: Record<number, string> = {
    3: "suidaibingfu",
    5: "kaihuanglvjian",
    8: "suitangfenghuotailingpai",
    12: "suidaikaijiacanpian",
  };
  const id = config[wave];
  return id ? (findRelicById(id) ?? null) : null;
}

// ═══════════════════════════════════════════════════════════
// 以下为战斗数值计算（旧版 effects 字段兼容）
// ═══════════════════════════════════════════════════════════

type RelicEffectKey = NonNullable<Relic["effects"]> extends infer E
  ? keyof E
  : never;

/**
 * 累加某方持有遗物的数值效果（旧版兼容）
 * @param relics 遗物列表
 * @param key 效果字段名
 */
export function sumRelicEffectValue(
  relics: Relic[],
  key: RelicEffectKey
): number {
  return relics.reduce((sum, relic) => {
    const val = relic.effects?.[key];
    return sum + (typeof val === "number" ? val : 0);
  }, 0);
}

/**
 * 累加所有遗物的数值效果（旧版兼容）
 */
export function sumAllRelicEffects(relics: Relic[]): Record<string, number> {
  const result: Record<string, number> = {};

  for (const relic of relics) {
    if (!relic.effects) continue;
    for (const [key, val] of Object.entries(relic.effects)) {
      if (typeof val === "number") {
        result[key] = (result[key] ?? 0) + val;
      }
    }
  }

  return result;
}

/**
 * 检查遗物是否提供某种布尔效果
 */
export function hasRelicBooleanEffect(
  relics: Relic[],
  key: RelicEffectKey
): boolean {
  return relics.some((r) => {
    const val = r.effects?.[key];
    return typeof val === "boolean" ? val : false;
  });
}
