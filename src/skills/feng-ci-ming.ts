import type { Skill, General, GeneralRarity } from "./types";

const FENG_DE_YI_QUOTES = {
  skill: ["疲敌之策，兵不血刃。", "以逸待劳，胜券在握。"],
  death: ["计穷援绝，唯死报国。"],
} as const;

const FENG_DE_YI_BASE = {
  id: 577,
  name: "封德彝",
  rarity: "common" as GeneralRarity,
  attack: 45,
  attackGrowth: 1.22,
  defense: 42,
  defenseGrowth: 1.15,
  strategy: 68,
  strategyGrowth: 2.52,
  speed: 58,
  speedGrowth: 1.88,
  attackRange: 2,
  siege: 38,
  siegeGrowth: 0.98,
  level: 4,
  command: 45,
  commandGrowth: 1.22,
  leadership: 1.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/feng_de_yi.jpg",
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

// 主动：使敌方单体速度-20%持续2回合，距离2，概率50%
export const createFengDeYiSkill = (): Skill => {
  return {
    id: "pi-di-zhi-ce",
    name: "疲敌之策",
    type: "active",
    distance: 2,
    probability: 0.50,
    description: "主动：使敌方单体速度-20%持续2回合，距离2，概率50%",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets } = context;

      if (type === "activeSkill" && event === "trigger") {
        if (targets && targets.length > 0) {
          const target = targets[0];
          if (!target.skillEffects) {
            target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          }
          target.skillEffects.speedPenalty = 0.20;
          target.skillEffects.speedPenaltySource = `【${general.name}】的【疲敌之策】`;
          target.skillEffects.speedPenaltyDuration = 2;
          if (addReport) {
            addReport(`【${general.name}】发动【疲敌之策】，使【${target.name}】速度降低20%，持续2回合！`);
          }
          return { triggered: true };
        }
      }

      // 速度惩罚持续时间递减
      if (type === "turnEnd" && general.skillEffects?.speedPenaltyDuration) {
        general.skillEffects.speedPenaltyDuration -= 1;
        if (general.skillEffects.speedPenaltyDuration <= 0) {
          general.skillEffects.speedPenalty = 0;
          general.skillEffects.speedPenaltySource = "";
          general.skillEffects.speedPenaltyDuration = 0;
        }
      }

      return null;
    },
  };
};

export const createFengDeYi = (): General => {
  const troops = calculateTroops(FENG_DE_YI_BASE.command);
  return {
    ...FENG_DE_YI_BASE,
    troops,
    maxTroops: troops,
    skills: [createFengDeYiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: FENG_DE_YI_QUOTES,
  };
};

export const fetchFengDeYiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/577`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(FENG_DE_YI_BASE.command);
    return {
      ...FENG_DE_YI_BASE,
      id: characterData.id ?? FENG_DE_YI_BASE.id,
      name: characterData.name ?? FENG_DE_YI_BASE.name,
      dynasty: characterData.dynasty ?? FENG_DE_YI_BASE.dynasty,
      gender: characterData.gender ?? FENG_DE_YI_BASE.gender,
      avatar: characterData.avatar || FENG_DE_YI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createFengDeYiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: FENG_DE_YI_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取封德彝信息失败:', error);
    return createFengDeYi();
  }
};
