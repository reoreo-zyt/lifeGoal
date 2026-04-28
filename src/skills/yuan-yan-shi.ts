import type { Skill, General, GeneralRarity } from "./types";

const YUAN_YAN_SHI_QUOTES = {
  skill: ["洛阳固守，万夫莫开。", "城在人在，城破人亡。"],
  death: ["洛阳已失，吾死得其所。"],
} as const;

const YUAN_YAN_SHI_BASE = {
  id: 515,
  name: "元延嗣",
  rarity: "uncommon" as GeneralRarity,
  attack: 60,
  attackGrowth: 2.08,
  defense: 76,
  defenseGrowth: 2.58,
  strategy: 64,
  strategyGrowth: 2.08,
  speed: 42,
  speedGrowth: 1.28,
  attackRange: 3,
  siege: 65,
  siegeGrowth: 2.08,
  level: 4,
  command: 60,
  commandGrowth: 2.08,
  leadership: 2.0,
  isDead: false,
  dynasty: "北魏",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuan_yan.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: "",
  attributeBonus: 0,
  attributeBonusSource: "",
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: "",
  hasTriggeredRecovery: false,
};

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 固守洛阳 — 被动：物防+28%、治疗效果+20%，降低50点速度
export const createYuanYanSkill = (): Skill => ({
  id: "gushou-luoyang",
  name: "固守洛阳",
  type: "passive",
  description: "被动：物理防御+28%、治疗效果+20%，降低50点速度",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport } = context;

    if (type === "battleStart" && event === "init") {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      general.skillEffects.defenseBonus = (general.skillEffects.defenseBonus || 0) + 28;
      general.skillEffects.defenseBonusSource = `【${general.name}】的【固守洛阳】`;
      general.skillEffects.healingBonus = (general.skillEffects.healingBonus || 0) + 20;
      general.skillEffects.healingBonusSource = `【${general.name}】的【固守洛阳】`;
      // 降低50点速度（固定减值）
      general.skillEffects.speedPenaltyFlat = 50;
      general.skillEffects.speedPenaltyFlatSource = `【${general.name}】的【固守洛阳】`;
      if (addReport) {
        addReport(`【${general.name}】发动【固守洛阳】，物防+28%、治疗效果+20%，速度-50！`);
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createYuanYan = (): General => {
  const troops = calculateTroops(YUAN_YAN_SHI_BASE.command);
  return {
    ...YUAN_YAN_SHI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuanYanSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YUAN_YAN_SHI_QUOTES,
    rarity: YUAN_YAN_SHI_BASE.rarity,
  };
};

export const fetchYuanYanFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/515`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YUAN_YAN_SHI_BASE.command);
    return {
      ...YUAN_YAN_SHI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuanYanSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YUAN_YAN_SHI_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取元延嗣信息失败:", error);
    return createYuanYan();
  }
};
