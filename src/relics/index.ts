// 类型导出
export type {
  Relic,
  RelicRarity,
  RelicCategory,
  RelicEffect,
  RelicSetBonus,
  RelicSet,
} from "./types";

// 常量导出
export {
  RELIC_POOL,
  RELIC_RARITY_WEIGHT,
  TREASURE_DROP_RELICS,
  ELITE_DROP_RELICS,
  BOSS_DROP_RELICS,
  SET_IDS,
} from "./data";

export { RELIC_SETS } from "./sets";

// 稀有度配置
export { RARITY_COLORS, RARITY_NAMES } from "./types";

// 工具函数导出
export {
  getRelicTooltip,
  pickRarityByWeight,
  pickRarityByLegacyWeight,
  pickWeightedRelics,
  findRelicById,
  getEnemyWaveRelic,
  sumRelicEffectValue,
  sumAllRelicEffects,
  hasRelicBooleanEffect,
} from "./utils";

// 套装工具导出
export {
  getSetById,
  countSetPieces,
  getActiveSetBonus,
  getAllActiveSetBonuses,
  getSetProgress,
} from "./sets";
