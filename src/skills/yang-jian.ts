import type { Skill, General } from "./types";

const YANG_JIAN_QUOTES = {
  skill: [
    "开皇之治，天下归一。",
    "朕为天子，当抚四方。",
    "隋室基业，万世永昌。"
  ],
  death: ["太子不肖，隋室危矣..."]
} as const;

// 杨坚的基础属性常量
const YANG_JIAN_BASE = {
  id: 21,
  name: "杨坚",
  attack: 82,
  attackGrowth: 2.20,
  defense: 90,
  defenseGrowth: 2.30,
  strategy: 88,
  strategyGrowth: 2.30,
  speed: 35,
  speedGrowth: 0.60,
  attackRange: 2,
  siege: 14,
  siegeGrowth: 0.70,
  level: 5,
  command: 95,
  commandGrowth: 2.40,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yang_jian.jpg",
};

// 杨坚的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  strategyDamageReduction: 0,
  strategyDamageReductionSource: '',
  hasAppliedBuff: false,
  buffDuration: 3,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 杨坚的自带战法【开皇御极】
export const createYangJianSkill = (): Skill => {
  return {
    id: "kaihuang-yuji",
    name: "开皇御极",
    type: "command",
    description: "指挥：战斗开始时，全体友军攻击+12%、防御+12%，持续3回合；自身受到谋略伤害减免15%。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedBuff) {
        general.skillEffects.hasAppliedBuff = true;

        if (addReport) {
          addReport(`【${general.name}】发动【开皇御极】，号令天下！`);
        }

        // 为全体友军施加增益
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) {
              ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            // 攻击+12%
            ally.attack = Math.floor(ally.attack * 1.12);
            // 防御+12%
            ally.defense = Math.floor(ally.defense * 1.12);

            if (addReport) {
              addReport(`【${ally.name}】受到【开皇御极】加持，攻击、防御提升12%！`);
            }
          });
        }

        // 自身谋略伤害减免
        general.skillEffects.strategyDamageReduction = 0.15;
        general.skillEffects.strategyDamageReductionSource = `【${general.name}】的【开皇御极】`;

        return { triggered: true };
      }

      // 自身受到谋略伤害时减免
      if (type === "attacked" && event === "beforeDamage") {
        if (general.skillEffects.strategyDamageReduction > 0) {
          return { strategyDamageReduction: general.skillEffects.strategyDamageReduction };
        }
      }

      return null;
    },
  };
};

// 创建杨坚武将数据
export const createYangJian = (): General => {
  const troops = calculateTroops(YANG_JIAN_BASE.command);

  return {
    ...YANG_JIAN_BASE,
    troops,
    maxTroops: troops,
    skills: [createYangJianSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YANG_JIAN_QUOTES
  };
};

// 从数据库获取杨坚的详细信息
export const fetchYangJianFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/21`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(YANG_JIAN_BASE.command);

    return {
      ...YANG_JIAN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYangJianSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YANG_JIAN_QUOTES
    };
  } catch (error) {
    console.error('从数据库获取杨坚信息失败:', error);
    return createYangJian();
  }
};
