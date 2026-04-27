import type { Skill, General } from "./types";

// 宇文化及的基础属性常量
const YU_WEN_HUA_JI_BASE = {
  id: 26,
  name: "宇文化及",
  attack: 90,
  attackGrowth: 2.40,
  defense: 82,
  defenseGrowth: 2.00,
  strategy: 50,
  strategyGrowth: 1.10,
  speed: 38,
  speedGrowth: 0.60,
  attackRange: 2,
  siege: 12,
  siegeGrowth: 0.60,
  level: 5,
  command: 88,
  commandGrowth: 2.20,
  leadership: 3.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yu_wen_hua_ji.jpg",
};

// 宇文化及的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  isFeared: false,
  fearSource: '',
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 宇文化及的自带战法【弑君之刃】
export const createYuWenHuaJiSkill = (): Skill => {
  return {
    id: "shijun-zhiren",
    name: "弑君之刃",
    type: "passive",
    description: "被动：普通攻击有30%概率使目标陷入【恐惧】（下回合无法行动）；自身兵力低于30%时，攻击伤害增加40%。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, currentTroops, maxTroops, target } = context;

      // 普通攻击前触发恐惧效果
      if (type === "attack" && event === "beforeAttack") {
        if (Math.random() < 0.30) {
          if (target) {
            if (!target.skillEffects) {
              target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            target.skillEffects.isFeared = true;
            target.skillEffects.fearSource = `【${general.name}】的【弑君之刃】`;

            if (addReport) {
              addReport(`【${general.name}】的【弑君之刃】使【${target.name}】陷入【恐惧】，下回合无法行动！`);
            }
          }
        }
      }

      // 攻击时，自身兵力低于30%时伤害增加40%
      if (type === "attack" && event === "beforeAttack") {
        const troopRatio = currentTroops / maxTroops;
        if (troopRatio < 0.30) {
          if (addReport) {
            addReport(`【${general.name}】兵力危急，【弑君之刃】触发，攻击伤害大幅提升！`);
          }
          return { damageIncrease: 0.40 };
        }
      }

      // 回合开始时检查恐惧效果
      if (type === "turnStart") {
        if (general.skillEffects?.isFeared) {
          if (addReport) {
            addReport(`【${general.name}】处于【恐惧】状态，本回合无法行动！`);
          }
          general.skillEffects.isFeared = false;
          return { skipTurn: true };
        }
      }

      return null;
    },
  };
};

// 创建宇文化及武将数据
export const createYuWenHuaJi = (): General => {
  const troops = calculateTroops(YU_WEN_HUA_JI_BASE.command);

  return {
    ...YU_WEN_HUA_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuWenHuaJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: [
        "江都之变，天命在我。",
        "杨广无道，当诛之。",
        "弑君夺位，舍我其谁。"
      ],
      death: ["本想称帝，竟至于此..."]
    }
  };
};

// 从数据库获取宇文化及的详细信息
export const fetchYuWenHuaJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/26`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(YU_WEN_HUA_JI_BASE.command);

    return {
      ...YU_WEN_HUA_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuWenHuaJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "江都之变，天命在我。",
          "杨广无道，当诛之。",
          "弑君夺位，舍我其谁。"
        ],
        death: ["本想称帝，竟至于此..."]
      }
    };
  } catch (error) {
    console.error('从数据库获取宇文化及信息失败:', error);
    return createYuWenHuaJi();
  }
};
