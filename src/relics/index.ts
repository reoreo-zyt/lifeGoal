// 类型导出
export type { Relic, RelicEffects, RelicRarity } from "./types";

// 常量导出
export { RELIC_POOL, RELIC_RARITY_WEIGHT, ENEMY_WAVE_RELIC_CONFIG } from "./data";
export { RARITY_COLORS, RARITY_NAMES } from "./types";

// 工具函数导出
export {
  getRelicTooltip,
  pickRarityByWeight,
  pickWeightedRelics,
  findRelicById,
  getRelicEffectValue,
  getAllRelicEffects,
} from "./utils";
