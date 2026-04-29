import type { Skill, General, GeneralRarity } from "./types";

const LU_YAN_SHI_QUOTES = {
  skill: ["整肃风纪，以正朝纲。", "敦礼明伦，修身匡世。"],
  death: ["正道难行，清节犹在，此生无愧名教。"],
} as const;

const LU_YAN_SHI_BASE = {
  id: 70,
  name: "陆彦师",
  rarity: "common" as GeneralRarity,
  attack: 52,
  attackGrowth: 1.58,
  defense: 52,
  defenseGrowth: 1.62,
  strategy: 52,
  strategyGrowth: 1.54,
  speed: 52,
  speedGrowth: 1.64,
  attackRange: 2,
  siege: 48,
  siegeGrowth: 1.38,
  level: 4,
  command: 52,
  commandGrowth: 1.58,
  leadership: 1.5,
  isDead: false,
  dynasty: "北周",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/lu_yan_shi.jpg",
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
  attributeBonus2: 0,
  attributeBonus2Source: "",
  isImmuneToSpeedReduction: false,
  isImmuneToSpeedReductionSource: "",
};

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 被动：全属性+10，免疫速度降低效果
export const createLuYanShiSkill = (): Skill => ({
  id: "zhongyong-zishou",
  name: "中庸自守",
  type: "passive",
  description: "被动：全属性+10，免疫速度降低效果",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport } = context;

    if (type === "battleStart" && event === "init") {
      general.skillEffects.attributeBonus = 10;
      general.skillEffects.attributeBonusSource = `【${general.name}】的【中庸自守】`;
      general.skillEffects.attributeBonus2 = 10;
      general.skillEffects.attributeBonus2Source = `【${general.name}】的【中庸自守】`;
      general.skillEffects.isImmuneToSpeedReduction = true;
      general.skillEffects.isImmuneToSpeedReductionSource = `【${general.name}】的【中庸自守】`;
      if (addReport) {
        addReport(`【${general.name}】的【中庸自守】生效：全属性+10，免疫速度降低效果！`);
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createLuYanShi = (): General => {
  const troops = calculateTroops(LU_YAN_SHI_BASE.command);
  return {
    ...LU_YAN_SHI_BASE,
    troops,
    maxTroops: troops,
    skills: [createLuYanShiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LU_YAN_SHI_QUOTES,
  };
};

export const fetchLuYanShiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/70`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(LU_YAN_SHI_BASE.command);
    return {
      ...LU_YAN_SHI_BASE,
      id: characterData.id ?? LU_YAN_SHI_BASE.id,
      name: characterData.name ?? LU_YAN_SHI_BASE.name,
      dynasty: characterData.dynasty ?? LU_YAN_SHI_BASE.dynasty,
      gender: characterData.gender ?? LU_YAN_SHI_BASE.gender,
      avatar: characterData.avatar || LU_YAN_SHI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createLuYanShiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LU_YAN_SHI_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取陆彦师信息失败:', error);
    return createLuYanShi();
  }
};
