import type { Skill, General } from "./types";

const LI_JING_QUOTES = {
  skill: ["兵贵神速，出其不意。", "以正合，以奇胜。", "卫公兵法，鬼神莫测。"],
  death: ["平生征战，无愧于心..."],
} as const;

// 李靖的基础属性常量
const LI_JING_BASE = {
  id: 29,
  name: "李靖",
  attack: 88,
  attackGrowth: 2.30,
  defense: 88,
  defenseGrowth: 2.30,
  strategy: 95,
  strategyGrowth: 2.60,
  speed: 50,
  speedGrowth: 0.75,
  attackRange: 3,
  siege: 16,
  siegeGrowth: 0.80,
  level: 5,
  command: 96,
  commandGrowth: 2.50,
  leadership: 3.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/li_jing.jpg",
};

// 李靖的skillEffects默认值
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
  divineStrategyActive: false,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 李靖的自带战法【卫公兵法】
export const createLiJingSkill = (): Skill => {
  return {
    id: "weigong-bingfa",
    name: "卫公兵法",
    type: "command",
    description: "指挥：战斗开始时，自身获得【神机】：每次攻击额外造成50%谋略伤害；每回合有30%概率使敌方随机1人陷入【震慑】（下回合无法行动）。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;
        general.skillEffects.divineStrategyActive = true;

        if (addReport) {
          addReport(`【${general.name}】发动【卫公兵法】，运筹帷幄，神机妙算！`);
        }

        return { triggered: true };
      }

      // 攻击时触发额外谋略伤害（【神机】效果）
      if (type === "attack" && event === "beforeAttack") {
        if (general.skillEffects.divineStrategyActive) {
          if (addReport) {
            addReport(`【${general.name}】触发【神机】，攻击附带谋略伤害！`);
          }
          return { strategyDamageBonus: 0.50 };
        }
      }

      // 回合开始时概率触发【震慑】
      if (type === "turnStart") {
        if (Math.random() < 0.30) {
          if (targets && targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            if (!randomTarget.skillEffects) {
              randomTarget.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            // 震慑效果：下回合无法行动
            randomTarget.skillEffects.isStunned = true;
            randomTarget.skillEffects.stunSource = `【${general.name}】的【卫公兵法】`;

            if (addReport) {
              addReport(`【${general.name}】的【卫公兵法】使【${randomTarget.name}】陷入【震慑】，下回合无法行动！`);
            }
          }
        }
      }

      // 回合开始时检查震慑效果
      if (type === "turnStart" && general.skillEffects?.isStunned) {
        if (addReport) {
          addReport(`【${general.name}】处于【震慑】状态，本回合无法行动！`);
        }
        // 清除震慑效果（已生效）
        general.skillEffects.isStunned = false;
        return { skipTurn: true };
      }

      return null;
    },
  };
};

// 创建李靖武将数据
export const createLiJing = (): General => {
  const troops = calculateTroops(LI_JING_BASE.command);

  return {
    ...LI_JING_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiJingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_JING_QUOTES,
  };
};

// 从数据库获取李靖的详细信息
export const fetchLiJingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/29`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(LI_JING_BASE.command);

    return {
      ...LI_JING_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiJingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LI_JING_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取李靖信息失败:', error);
    return createLiJing();
  }
};
