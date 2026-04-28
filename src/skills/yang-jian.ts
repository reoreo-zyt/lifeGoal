import type { Skill, General, GeneralRarity } from "./types";

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
  rarity: "legendary",
  attack: 96,
  attackGrowth: 3.00,
  defense: 90,
  defenseGrowth: 2.85,
  strategy: 65,
  strategyGrowth: 1.88,
  speed: 86,
  speedGrowth: 2.58,
  attackRange: 4,
  siege: 88,
  siegeGrowth: 2.88,
  level: 5,
  command: 96,
  commandGrowth: 3.00,
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
  damageReductionSource: "",
  attributeBonus: 0,
  attributeBonusSource: "",
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: "",
  hasTriggeredRecovery: false,
  strategyDamageReduction: 0,
  strategyDamageReductionSource: "",
  hasAppliedBuff: false,
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
    description: "指挥：我方全体攻/防/谋/速+20%，自身承受我方全体30%策略伤害",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies } = context;

      // 战斗开始时触发指挥战法（全属性增益，无持续时间限制）
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedBuff) {
        general.skillEffects.hasAppliedBuff = true;

        if (addReport) {
          addReport(`【${general.name}】发动【开皇御极】，号令天下！`);
        }

        // 为全体友军施加全属性+20%增益（攻击、防御、谋略、速度）
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) {
              ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            ally.attack = Math.floor(ally.attack * 1.20);
            ally.defense = Math.floor(ally.defense * 1.20);
            ally.strategy = Math.floor(ally.strategy * 1.20);
            ally.speed = Math.floor(ally.speed * 1.20);

            if (addReport) {
              addReport(`【${ally.name}】受到【开皇御极】加持，攻击、防御、谋略、速度各提升20%！`);
            }
          });
        }

        return { triggered: true };
      }

      // 自身承受我方全体30%策略伤害（被策略攻击时，友军也会承受部分伤害）
      if (type === "attacked" && event === "strategyDamage" && allies && allies.length > 0) {
        if (addReport) {
          addReport(`【${general.name}】承受我方全体30%策略伤害！`);
        }
        return { allyStrategyDamageReflect: 0.30 };
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
    quotes: YANG_JIAN_QUOTES,
    rarity: YANG_JIAN_BASE.rarity as GeneralRarity
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
      quotes: YANG_JIAN_QUOTES,
      rarity: YANG_JIAN_BASE.rarity as GeneralRarity
    };
  } catch (error) {
    console.error('从数据库获取杨坚信息失败:', error);
    return createYangJian();
  }
};