import type { Skill, General } from "./types";

const YU_SHI_JI_QUOTES = {
  skill: [
    "陛下圣明，臣遵旨。",
    "顺天者昌，逆天者亡。",
    "谄媚逢迎，乃生存之道。"
  ],
  death: ["化及反贼，不得好死..."]
} as const;

// 虞世基的基础属性常量
const YU_SHI_JI_BASE = {
  id: 561,
  name: "虞世基",
  attack: 42,
  attackGrowth: 0.80,
  defense: 55,
  defenseGrowth: 1.00,
  strategy: 90,
  strategyGrowth: 2.40,
  speed: 28,
  speedGrowth: 0.50,
  attackRange: 3,
  siege: 9,
  siegeGrowth: 0.45,
  level: 5,
  command: 80,
  commandGrowth: 1.90,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/yu_shi_ji.jpg",
};

// 虞世基的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  isCharmed: false,
  charmSource: '',
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 虞世基的自带战法【媚上之策】
export const createYuShiJiSkill = (): Skill => {
  return {
    id: "meishang-zhice",
    name: "媚上之策",
    type: "active",
    description: "主动，发动概率55%，攻击范围3：使敌方统御最高者下回合有50%概率攻击友方；自身每回合回复4%兵力。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets, currentTroops, maxTroops } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        const triggerChance = 0.55;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【媚上之策】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }

        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(`【${general.name}】成功发动【媚上之策】！`);
          }

          // 使敌方统御最高者下回合有50%概率攻击友方
          if (targets && targets.length > 0) {
            // 找出统御最高的目标
            const highestCommandTarget = targets.reduce((prev: General, current: General) =>
              prev.command > current.command ? prev : current
            );

            if (!highestCommandTarget.skillEffects) {
              highestCommandTarget.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            highestCommandTarget.skillEffects.isCharmed = true;
            highestCommandTarget.skillEffects.charmSource = `【${general.name}】的【媚上之策】`;

            if (addReport) {
              addReport(`【${highestCommandTarget.name}】受到【媚上之策】影响，下回合有50%概率攻击友方！`);
            }
          }

          return { triggered: true };
        } else {
          if (addReport) {
            addReport(`【${general.name}】的【媚上之策】未触发！`);
          }
          return { triggered: false };
        }
      }

      // 回合开始时回复4%兵力
      if (type === "turnStart") {
        const recoveryAmount = Math.floor(maxTroops * 0.04);
        const actualRecovery = Math.min(recoveryAmount, maxTroops - currentTroops);
        if (actualRecovery > 0) {
          // 这里需要通过context或其他方式更新兵力，简化处理
          if (addReport) {
            addReport(`【${general.name}】的【媚上之策】使其回复${actualRecovery}点兵力！`);
          }
        }
      }

      // 回合开始时检查魅惑效果
      if (type === "turnStart") {
        if (general.skillEffects?.isCharmed) {
          const charmTriggerChance = 0.50;
          if (Math.random() < charmTriggerChance) {
            if (addReport) {
              addReport(`【${general.name}】受到魅惑影响，攻击友方！`);
            }
            general.skillEffects.isCharmed = false;
            return { attackAlly: true };
          } else {
            if (addReport) {
              addReport(`【${general.name}】抵抗了魅惑效果！`);
            }
            general.skillEffects.isCharmed = false;
          }
        }
      }

      return null;
    },
  };
};

// 创建虞世基武将数据
export const createYuShiJi = (): General => {
  const troops = calculateTroops(YU_SHI_JI_BASE.command);

  return {
    ...YU_SHI_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuShiJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_SHI_JI_QUOTES
  };
};

// 从数据库获取虞世基的详细信息
export const fetchYuShiJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/561`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(YU_SHI_JI_BASE.command);

    return {
      ...YU_SHI_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuShiJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_SHI_JI_QUOTES
    };
  } catch (error) {
    console.error('从数据库获取虞世基信息失败:', error);
    return createYuShiJi();
  }
};
