import type { Skill, General, GeneralRarity } from "./types";

const YANG_SU_QUOTES = {
  skill: [
    "铁骑所至，皆为齑粉。",
    "破阵杀敌，如探囊取物。",
    "出塞千里，踏破贺兰山缺。"
  ],
  death: ["权倾一时，终归尘土..."]
} as const;

// 杨素的基础属性常量
const YANG_SU_BASE = {
  id: 25,
  name: "杨素",
  rarity: "legendary",
  attack: 92,
  attackGrowth: 2.50,
  defense: 85,
  defenseGrowth: 2.20,
  strategy: 80,
  strategyGrowth: 2.00,
  speed: 55,
  speedGrowth: 0.80,
  attackRange: 2,
  siege: 15,
  siegeGrowth: 0.75,
  level: 5,
  command: 94,
  commandGrowth: 2.40,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yang_su.jpg",
};

// 杨素的skillEffects默认值
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

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 杨素的自带战法【出塞破敌】
export const createYangSuSkill = (): Skill => {
  return {
    id: "chusai-podi",
    name: "出塞破敌",
    type: "command",
    description: "指挥：战斗开始时，为全体友军提供【铁骑】效果：普通攻击对敌方前排目标伤害+25%；自身每回合有40%概率对敌方最高防御目标施加【破甲】10%，持续2回合。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies, enemies } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;

        if (addReport) {
          addReport(`【${general.name}】发动【出塞破敌】，铁骑出塞！`);
        }

        // 为全体友军提供【铁骑】效果
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) {
              ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            ally.skillEffects.damageIncrease = (ally.skillEffects.damageIncrease || 0) + 0.25;
            ally.skillEffects.damageIncreaseSource = `【${general.name}】的【出塞破敌】`;
            if (addReport) {
              addReport(`【${ally.name}】获得【铁骑】效果，对前排目标伤害+25%！`);
            }
          });
        }

        return { triggered: true };
      }

      // 每回合开始时，有40%概率对敌方最高防御目标施加【破甲】
      if (type === "turnStart") {
        if (Math.random() < 0.40) {
          if (enemies && enemies.length > 0) {
            const aliveEnemies = enemies.filter((e: General) => !e.isDead);
            if (aliveEnemies.length > 0) {
              // 找到最高防御目标
              const highestDefEnemy = aliveEnemies.reduce((max: General, cur: General) =>
                cur.defense > max.defense ? cur : max
              );
              if (!highestDefEnemy.skillEffects) {
                highestDefEnemy.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
              }
              highestDefEnemy.skillEffects.defenseReduction = 0.10;
              highestDefEnemy.skillEffects.defenseReductionDuration = 2;
              highestDefEnemy.skillEffects.defenseReductionSource = `【${general.name}】的【出塞破敌】`;
              if (addReport) {
                addReport(`【${general.name}】对【${highestDefEnemy.name}】施加【破甲】，防御降低10%，持续2回合！`);
              }
            }
          }
        }
      }

      return null;
    },
  };
};

// 创建杨素武将数据
export const createYangSu = (): General => {
  const troops = calculateTroops(YANG_SU_BASE.command);

  return {
    ...YANG_SU_BASE,
    troops,
    maxTroops: troops,
    skills: [createYangSuSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YANG_SU_QUOTES,
    rarity: YANG_SU_BASE.rarity as GeneralRarity
  };
};

// 从数据库获取杨素的详细信息
export const fetchYangSuFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/25`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(YANG_SU_BASE.command);

    return {
      ...YANG_SU_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYangSuSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YANG_SU_QUOTES,
      rarity: YANG_SU_BASE.rarity as GeneralRarity
    };
  } catch (error) {
    console.error('从数据库获取杨素信息失败:', error);
    return createYangSu();
  }
};