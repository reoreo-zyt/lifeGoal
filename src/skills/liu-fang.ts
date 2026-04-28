import type { Skill, General, GeneralRarity } from "./types";

const LIU_FANG_QUOTES = {
  skill: ["挟天子以令诸侯。", "朝堂之上，尽在掌握。", "权柄在握，谁敢不从。"],
  death: ["权势如烟，散尽虚空..."],
} as const;

const LIU_FANG_BASE = {
  id: 37,
  name: "刘昉",
  rarity: "rare",
  attack: 68,
  attackGrowth: 2.08,
  defense: 62,
  defenseGrowth: 1.88,
  strategy: 84,
  strategyGrowth: 2.85,
  speed: 78,
  speedGrowth: 2.58,
  attackRange: 3,
  siege: 55,
  siegeGrowth: 1.62,
  level: 4,
  command: 68,
  commandGrowth: 2.08,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/liu_fang.jpg",
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

// 刘昉的自带战法【挟主擅权】
export const createLiuFangSkill = (): Skill => {
  return {
    id: "xie-zhu-shan-quan",
    name: "挟主擅权",
    type: "active",
    distance: 3,
    probability: 0.80,
    description: "主动：使我方攻击最高武将立即获得额外1次攻击，距离3，概率80%，自身速度-15%持续1回合",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies } = context;

      // 主动战法：使我方攻击最高武将立即获得额外1次攻击，自身速度-15%持续1回合
      if (type === "activeSkill" && event === "trigger") {
        if (allies && allies.length > 0) {
          const aliveAllies = allies.filter((a: General) => !a.isDead);
          if (aliveAllies.length > 0) {
            // 找到攻击最高的友军
            const highestAtkAlly = aliveAllies.reduce((max: General, cur: General) =>
              cur.attack > max.attack ? cur : max
            );
            if (addReport) {
              addReport(`【${general.name}】发动【挟主擅权】，操控${highestAtkAlly.name}发起额外攻击！`);
            }
            // 自身速度-15%持续1回合
            if (!general.skillEffects) {
              general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            general.skillEffects.speedPenalty = 0.15;
            general.skillEffects.speedPenaltySource = `【${general.name}】的【挟主擅权】`;
            general.skillEffects.speedPenaltyDuration = 1;
            if (addReport) {
              addReport(`【${general.name}】自身速度降低15%，持续1回合！`);
            }
            return {
              extraAttackTarget: highestAtkAlly,
              damageMultiplier: 0, // 由目标武将自身攻击属性决定
              damageType: "physical",
            };
          }
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

export const createLiuFang = (): General => {
  const troops = calculateTroops(LIU_FANG_BASE.command);
  return {
    ...LIU_FANG_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiuFangSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LIU_FANG_QUOTES,
    rarity: LIU_FANG_BASE.rarity as GeneralRarity,
  };
};

export const fetchLiuFangFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/37`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(LIU_FANG_BASE.command);
    return {
      ...LIU_FANG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiuFangSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LIU_FANG_QUOTES,
      rarity: LIU_FANG_BASE.rarity as GeneralRarity,
    };
  } catch (error) {
    console.error('从数据库获取刘昉信息失败:', error);
    return createLiuFang();
  }
};
