import type { Skill, General, GeneralRarity } from "./types";

const YANG_WEN_SI_QUOTES = {
  skill: ["宽政安民，方可久治。", "为政在简，惠及黎庶。"],
  death: ["政道未竟，抱憾而终。"],
} as const;

const YANG_WEN_SI_BASE = {
  id: 66,
  name: "杨文思",
  rarity: "common" as GeneralRarity,
  attack: 50,
  attackGrowth: 1.52,
  defense: 48,
  defenseGrowth: 1.48,
  strategy: 50,
  strategyGrowth: 1.56,
  speed: 48,
  speedGrowth: 1.32,
  attackRange: 2,
  siege: 42,
  siegeGrowth: 1.18,
  level: 4,
  command: 50,
  commandGrowth: 1.52,
  leadership: 1.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yang_wen_si.webp",
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

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 被动：治疗效果+22%
export const createYangWenSiSkill = (): Skill => ({
  id: "qinglian-fenggong",
  name: "清廉奉公",
  type: "passive",
  description: "被动：治疗效果+22%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, addReport } = context;

    if (type === "passive") {
      general.skillEffects.recoveryBonus = 0.22;
      general.skillEffects.recoveryBonusSource = `【${general.name}】的【清廉奉公】`;
      if (addReport) {
        addReport(`【${general.name}】的【清廉奉公】生效：治疗效果+22%！`);
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createYangWenSi = (): General => {
  const troops = calculateTroops(YANG_WEN_SI_BASE.command);
  return {
    ...YANG_WEN_SI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYangWenSiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YANG_WEN_SI_QUOTES,
  };
};

export const fetchYangWenSiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/66`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(YANG_WEN_SI_BASE.command);
    return {
      ...YANG_WEN_SI_BASE,
      id: characterData.id ?? YANG_WEN_SI_BASE.id,
      name: characterData.name ?? YANG_WEN_SI_BASE.name,
      dynasty: characterData.dynasty ?? YANG_WEN_SI_BASE.dynasty,
      gender: characterData.gender ?? YANG_WEN_SI_BASE.gender,
      avatar: characterData.avatar || YANG_WEN_SI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createYangWenSiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YANG_WEN_SI_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取杨文思信息失败:', error);
    return createYangWenSi();
  }
};
