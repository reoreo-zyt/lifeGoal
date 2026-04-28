import type { Skill, General } from "./types";

const HE_RUO_BI_QUOTES = {
  skill: ["先锋之职，当破坚阵。", "建康城下，敌主授首。", "擒龙破阵，一击必杀。"],
  death: ["功高震主，古今同然..."],
} as const;

// 贺若弼的基础属性常量
const HE_RUO_BI_BASE = {
  id: 44,
  name: "贺若弼",
  attack: 96,
  attackGrowth: 2.70,
  defense: 78,
  defenseGrowth: 1.90,
  strategy: 58,
  strategyGrowth: 1.20,
  speed: 62,
  speedGrowth: 1.00,
  attackRange: 2,
  siege: 14,
  siegeGrowth: 0.70,
  level: 5,
  command: 91,
  commandGrowth: 2.30,
  leadership: 3.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/he_ruo_bi.jpg",
};

// 贺若弼的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  hasExtraAttack: false,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 贺若弼的自带战法【擒龙破阵】
export const createHeRuoBiSkill = (): Skill => {
  return {
    id: "qinlong-pozhen",
    name: "擒龙破阵",
    type: "active",
    description: "主动，发动概率45%，攻击范围2：对敌方单体造成155%物理伤害；若击杀目标，立即再次发动（每回合最多1次）。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        // 检查是否已经触发过额外攻击
        if (general.skillEffects.hasExtraAttack) {
          general.skillEffects.hasExtraAttack = false;
          return null;
        }

        const triggerChance = 0.45;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【擒龙破阵】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }

        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(`【${general.name}】成功发动【擒龙破阵】！`);
          }

          let hasKilled = false;

          // 对敌方单体造成155%物理伤害
          if (targets && targets.length > 0) {
            const target = targets[0];
            const damage = Math.max(0, Math.floor(general.attack * 1.55 - target.defense / 2));
            target.troops = Math.max(0, target.troops - damage);

            if (target.troops <= 0) {
              target.isDead = true;
              hasKilled = true;
            }

            if (addReport) {
              addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！`);
            }
          }

          // 若击杀目标，立即再次发动
          if (hasKilled) {
            if (addReport) {
              addReport(`【${general.name}】击杀目标，【擒龙破阵】再次发动！`);
            }
            general.skillEffects.hasExtraAttack = true;
          }

          return { triggered: true, extraAttack: hasKilled };
        } else {
          if (addReport) {
            addReport(`【${general.name}】的【擒龙破阵】未触发！`);
          }
          return { triggered: false };
        }
      }

      return null;
    },
  };
};

// 创建贺若弼武将数据
export const createHeRuoBi = (): General => {
  const troops = calculateTroops(HE_RUO_BI_BASE.command);

  return {
    ...HE_RUO_BI_BASE,
    troops,
    maxTroops: troops,
    skills: [createHeRuoBiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: HE_RUO_BI_QUOTES,
  };
};

// 从数据库获取贺若弼的详细信息
export const fetchHeRuoBiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/44`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(HE_RUO_BI_BASE.command);

    return {
      ...HE_RUO_BI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createHeRuoBiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: HE_RUO_BI_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取贺若弼信息失败:', error);
    return createHeRuoBi();
  }
};
