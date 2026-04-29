import type { Skill, General, GeneralRarity } from "./types";

const YANG_GUANG_QUOTES = {
  skill: ["大业江山，朕当守之。", "仁寿宫内，朕意已决。", "运河千里，功在当代，利在千秋！"],
  death: ["大好头颅，谁当斫之..."]
} as const;

const YANG_GUANG_BASE = {
  id: 22,
  name: "杨广",
  rarity: "rare" as GeneralRarity,
  attack: 78,
  attackGrowth: 2.25,
  defense: 80,
  defenseGrowth: 2.52,
  strategy: 72,
  strategyGrowth: 2.28,
  speed: 65,
  speedGrowth: 1.88,
  attackRange: 2,
  siege: 78,
  siegeGrowth: 2.48,
  level: 5,
  command: 78,
  commandGrowth: 2.25,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yang_guang.jpg",
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

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createYangGuangSkill = (): Skill => ({
  id: "renshou-touzhi",
  name: "仁寿透支",
  type: "passive",
  description: "被动：每损失8%兵力，物攻+14%但策防-10%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, addReport } = context;

    if (type === "turnStart") {
      const hpLostPercent = (general.maxTroops - general.troops) / general.maxTroops;
      const bonusCount = Math.min(5, Math.floor(hpLostPercent / 0.08));
      const newDamageIncrease = bonusCount * 14;
      const newDamageReduction = bonusCount * 10;

      if (newDamageIncrease !== general.skillEffects.damageIncrease) {
        general.skillEffects.damageIncrease = newDamageIncrease;
        general.skillEffects.damageIncreaseSource = `【${general.name}】的【仁寿透支】`;
        general.skillEffects.damageReduction = newDamageReduction;
        general.skillEffects.damageReductionSource = `【${general.name}】的【仁寿透支】`;

        if (addReport && bonusCount > 0) {
          addReport(`【${general.name}】发动【仁寿透支】，损失${(hpLostPercent * 100).toFixed(0)}%兵力，物攻+${newDamageIncrease}%但策防-${newDamageReduction}%！`);
        }
      }
      return null;
    }

    return null;
  },
});

export const createYangGuang = (): General => {
  const troops = calculateTroops(YANG_GUANG_BASE.command);
  return {
    ...YANG_GUANG_BASE,
    troops,
    maxTroops: troops,
    skills: [createYangGuangSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YANG_GUANG_QUOTES,
  };
};

export const fetchYangGuangFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/22`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YANG_GUANG_BASE.command);
    return {
      ...YANG_GUANG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYangGuangSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YANG_GUANG_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取杨广信息失败:", error);
    return createYangGuang();
  }
};
