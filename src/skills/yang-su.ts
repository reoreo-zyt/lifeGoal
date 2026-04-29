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
  attackGrowth: 3.00,
  defense: 80,
  defenseGrowth: 2.52,
  strategy: 68,
  strategyGrowth: 1.92,
  speed: 95,
  speedGrowth: 3.00,
  attackRange: 4,
  siege: 85,
  siegeGrowth: 2.72,
  level: 5,
  command: 92,
  commandGrowth: 3.00,
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
    type: "active",
    distance: 4,
    probability: 0.52,
    description: "主动：突击兵力最少目标造成260%物理伤害，距离4，概率52%，首回合我方前排攻击+35%",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies, enemies } = context;

      // 首回合战斗开始时，为我方前排施加攻击+35%
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;

        if (allies && allies.length > 0) {
          if (addReport) {
            addReport(`【${general.name}】发动【出塞破敌】，我方前排攻击+35%！`);
          }
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) {
              ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            ally.skillEffects.damageIncrease = (ally.skillEffects.damageIncrease || 0) + 0.35;
            ally.skillEffects.damageIncreaseSource = `【${general.name}】的【出塞破敌】首回合加成`;
          });
        }

        return { triggered: true };
      }

      // 主动战法触发：突击兵力最少目标，造成260%物理伤害
      if (type === "activeSkill" && event === "trigger") {
        if (enemies && enemies.length > 0) {
          const aliveEnemies = enemies.filter((e: General) => !e.isDead);
          if (aliveEnemies.length > 0) {
            // 找到兵力最少目标
            const lowestTroopsEnemy = aliveEnemies.reduce((min: General, cur: General) =>
              cur.troops < min.troops ? cur : min
            );
            if (addReport) {
              addReport(`【${general.name}】发动【出塞破敌】，突击【${lowestTroopsEnemy.name}】！`);
            }
            return { targetedEnemy: lowestTroopsEnemy, damageMultiplier: 2.60, damageType: "physical" };
          }
        }
      }

      if (type === "normalAttack" && event === "afterDamage") {
        if (Math.random() < 0.50) {
          if (enemies && enemies.length > 0) {
            const aliveEnemies = enemies.filter((e: General) => !e.isDead);
            if (aliveEnemies.length > 0) {
              const randomTarget = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
              const pursuitDamage = Math.max(0, Math.floor(general.attack * 1.00 - randomTarget.defense / 2));
              randomTarget.troops = Math.max(0, randomTarget.troops - pursuitDamage);
              if (randomTarget.troops <= 0) randomTarget.isDead = true;
              if (addReport) {
                addReport(`【${general.name}】触发【出塞破敌】追击！对【${randomTarget.name}】追加${pursuitDamage}点物理伤害！`);
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