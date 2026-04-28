import type { Skill, General } from "./types";

const LI_MI_QUOTES = {
  skill: ["瓦岗英雄，唯我独尊。", "问鼎中原，舍我其谁。", "天下大势，尽在掌握。"],
  death: ["熊耳山下，李密休矣..."],
} as const;

// 李密的基础属性常量
const LI_MI_BASE = {
  id: 570,
  name: "李密",
  attack: 62,
  attackGrowth: 1.30,
  defense: 72,
  defenseGrowth: 1.60,
  strategy: 92,
  strategyGrowth: 2.50,
  speed: 40,
  speedGrowth: 0.65,
  attackRange: 3,
  siege: 13,
  siegeGrowth: 0.65,
  level: 5,
  command: 92,
  commandGrowth: 2.30,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/li_mi.jpg",
};

// 李密的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  physicalDamageReduction: 0,
  physicalDamageReductionSource: '',
  hasAppliedCommand: false,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 李密的自带战法【瓦岗雄图】
export const createLiMiSkill = (): Skill => {
  return {
    id: "wagang-xiongtu",
    name: "瓦岗雄图",
    type: "command",
    description: "指挥：战斗开始时，全体友军首次攻击伤害+25%；自身受到物理伤害减免12%。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;

        if (addReport) {
          addReport(`【${general.name}】发动【瓦岗雄图】，号令瓦岗群雄！`);
        }

        // 为全体友军施加首次攻击伤害加成
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) {
              ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            // 首次攻击伤害+25%
            ally.skillEffects.firstAttackBonus = 0.25;

            if (addReport) {
              addReport(`【${ally.name}】获得【瓦岗雄图】加持，首次攻击伤害+25%！`);
            }
          });
        }

        // 自身物理伤害减免
        general.skillEffects.physicalDamageReduction = 0.12;
        general.skillEffects.physicalDamageReductionSource = `【${general.name}】的【瓦岗雄图】`;

        return { triggered: true };
      }

      // 自身受到物理伤害时减免
      if (type === "attacked" && event === "beforeDamage") {
        if (general.skillEffects.physicalDamageReduction > 0) {
          return { physicalDamageReduction: general.skillEffects.physicalDamageReduction };
        }
      }

      return null;
    },
  };
};

// 创建李密武将数据
export const createLiMi = (): General => {
  const troops = calculateTroops(LI_MI_BASE.command);

  return {
    ...LI_MI_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiMiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_MI_QUOTES,
  };
};

// 从数据库获取李密的详细信息
export const fetchLiMiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/570`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(LI_MI_BASE.command);

    return {
      ...LI_MI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiMiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LI_MI_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取李密信息失败:', error);
    return createLiMi();
  }
};
