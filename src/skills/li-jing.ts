import type { Skill, General, GeneralRarity } from "./types";

const LI_JING_QUOTES = {
  skill: ["兵贵神速，出其不意。", "以正合，以奇胜。", "卫公兵法，鬼神莫测。"],
  death: ["平生征战，无愧于心..."],
} as const;

// 李靖的基础属性常量
const LI_JING_BASE = {
  id: 29,
  name: "李靖",
  rarity: "legendary",
  attack: 88,
  attackGrowth: 2.82,
  defense: 92,
  defenseGrowth: 3.00,
  strategy: 95,
  strategyGrowth: 3.00,
  speed: 86,
  speedGrowth: 2.58,
  attackRange: 4,
  siege: 85,
  siegeGrowth: 2.72,
  level: 5,
  command: 88,
  commandGrowth: 2.82,
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
  damageReductionSource: "",
  attributeBonus: 0,
  attributeBonusSource: "",
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: "",
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
    description: "指挥：我方全体物防+24%，自身攻击附加55%策略伤害，每回合35%概率震慑随机敌方1回合",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies, enemies } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;
        general.skillEffects.divineStrategyActive = true;

        if (addReport) {
          addReport(`【${general.name}】发动【卫公兵法】，运筹帷幄！`);
        }

        // 全体友军物防+24%（通过 teamDefenseBonus 实现）
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.teamDefenseBonus) {
              ally.teamDefenseBonus = 0;
            }
            ally.teamDefenseBonus += 0.24;
            if (addReport) {
              addReport(`【${ally.name}】物防提升24%！`);
            }
          });
        }

        return { triggered: true };
      }

      // 攻击时触发【神机】效果，附加55%策略伤害
      if (type === "attack" && event === "beforeAttack") {
        if (general.skillEffects?.divineStrategyActive) {
          if (addReport) {
            addReport(`【${general.name}】触发【神机】，攻击附加策略伤害！`);
          }
          return { strategyDamageBonus: 0.55 };
        }
      }

      // 回合开始时，35%概率使敌方单体陷入【震慑】
      if (type === "turnStart") {
        if (Math.random() < 0.35) {
          if (enemies && enemies.length > 0) {
            const aliveEnemies = enemies.filter((e: General) => !e.isDead);
            if (aliveEnemies.length > 0) {
              const randomTarget = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
              if (!randomTarget.skillEffects) {
                randomTarget.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
              }
              randomTarget.skillEffects.isStunned = true;
              randomTarget.skillEffects.stunSource = `【${general.name}】的【卫公兵法】`;
              if (addReport) {
                addReport(`【${general.name}】的【卫公兵法】使【${randomTarget.name}】陷入【震慑】，下回合无法行动！`);
              }
            }
          }
        }

        // 处理自身被震慑的情况
        if (general.skillEffects?.isStunned) {
          if (addReport) {
            addReport(`【${general.name}】处于【震慑】状态，本回合无法行动！`);
          }
          general.skillEffects.isStunned = false;
          return { skipTurn: true };
        }
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
    rarity: LI_JING_BASE.rarity as GeneralRarity,
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
      rarity: LI_JING_BASE.rarity as GeneralRarity,
    };
  } catch (error) {
    console.error('从数据库获取李靖信息失败:', error);
    return createLiJing();
  }
};