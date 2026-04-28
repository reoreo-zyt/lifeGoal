import type { Skill, General } from "./types";

const LI_YUAN_QUOTES = {
  skill: ["晋阳起兵，匡扶天下。", "李唐基业，始于今日。", "天下大乱，当取而代之。"],
  death: ["玄武门之事，朕之过矣..."]
} as const;

// 李渊的基础属性常量
const LI_YUAN_BASE = {
  id: 1,
  name: "李渊",
  attack: 80,
  attackGrowth: 2.10,
  defense: 88,
  defenseGrowth: 2.30,
  strategy: 86,
  strategyGrowth: 2.20,
  speed: 36,
  speedGrowth: 0.60,
  attackRange: 2,
  siege: 14,
  siegeGrowth: 0.70,
  level: 5,
  command: 95,
  commandGrowth: 2.40,
  leadership: 3.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/li_yuan.jpg",
};

// 李渊的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  hasAppliedCommand: false,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 李渊的自带战法【龙兴晋阳】
export const createLiYuanSkill = (): Skill => {
  return {
    id: "longxing-jinyang",
    name: "龙兴晋阳",
    type: "command",
    description: "指挥：战斗开始时，全体友军受到伤害降低10%，持续3回合；每回合结束时，回复全体友军2%兵力。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies, currentTroops, maxTroops } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;

        if (addReport) {
          addReport(`【${general.name}】发动【龙兴晋阳】，唐室基业，始于今日！`);
        }

        // 为全体友军施加伤害减免
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) {
              ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            ally.skillEffects.damageReduction = 0.10;
            ally.skillEffects.damageReductionSource = `【${general.name}】的【龙兴晋阳】`;

            if (addReport) {
              addReport(`【${ally.name}】获得【龙兴晋阳】加持，受到伤害降低10%，持续3回合！`);
            }
          });
        }

        return { triggered: true };
      }

      // 回合结束时回复全体友军2%兵力
      if (type === "turnEnd") {
        if (addReport) {
          addReport(`【${general.name}】的【龙兴晋阳】触发，回复全体友军兵力！`);
        }

        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            const recoveryAmount = Math.floor(ally.maxTroops * 0.02);
            const actualRecovery = Math.min(recoveryAmount, ally.maxTroops - ally.troops);
            if (actualRecovery > 0) {
              ally.troops += actualRecovery;
              if (addReport) {
                addReport(`【${ally.name}】回复${actualRecovery}点兵力！`);
              }
            }
          });
        }

        // 自身也回复
        const selfRecovery = Math.floor(maxTroops * 0.02);
        const actualSelfRecovery = Math.min(selfRecovery, maxTroops - currentTroops);
        if (actualSelfRecovery > 0 && addReport) {
          addReport(`【${general.name}】回复${actualSelfRecovery}点兵力！`);
        }
      }

      // 自身受到攻击时应用伤害减免
      if (type === "attacked" && event === "beforeDamage") {
        if (general.skillEffects.damageReduction > 0) {
          return { damageReduction: general.skillEffects.damageReduction };
        }
      }

      return null;
    },
  };
};

// 创建李渊武将数据
export const createLiYuan = (): General => {
  const troops = calculateTroops(LI_YUAN_BASE.command);

  return {
    ...LI_YUAN_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiYuanSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_YUAN_QUOTES,
  };
};

// 从数据库获取李渊的详细信息
export const fetchLiYuanFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/1`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(LI_YUAN_BASE.command);

    return {
      ...LI_YUAN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiYuanSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "晋阳起兵，匡扶天下。",
          "李唐基业，始于今日。",
          "天下大乱，当取而代之。"
        ],
        death: ["玄武门之事，朕之过矣..."]
      }
    };
  } catch (error) {
    console.error('从数据库获取李渊信息失败:', error);
    return createLiYuan();
  }
};
