import type { Skill, General, GeneralRarity } from "./types";

const GAO_JIONG_QUOTES = {
  skill: ["平陈之策，臣已熟虑。", "治国之道，在于任人。", "宰辅之责，安邦定国。"],
  death: ["臣事隋室，死而无憾..."],
} as const;

// 高颎的基础属性常量
const GAO_JIONG_BASE = {
  id: 24,
  name: "高颎",
  rarity: "legendary",
  attack: 82,
  attackGrowth: 2.58,
  defense: 88,
  defenseGrowth: 2.82,
  strategy: 96,
  strategyGrowth: 3.00,
  speed: 78,
  speedGrowth: 2.28,
  attackRange: 4,
  siege: 82,
  siegeGrowth: 2.62,
  level: 5,
  command: 82,
  commandGrowth: 2.58,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/gao_jiong.jpg",
};

// 高颎的skillEffects默认值
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

// 高颎的自带战法【宰辅之谋】
export const createGaoJiongSkill = (): Skill => {
  return {
    id: "zaifu-zhimou",
    name: "宰辅之谋",
    type: "command",
    description: "指挥：我方全体策略伤害+22%，敌方全体策防-18%全场",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies, enemies } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init") {
        if (addReport) {
          addReport(`【${general.name}】发动【宰辅之谋】，运筹庙堂！`);
        }

        // 全体友军策略伤害+22%（通过 teamStrategyDamageIncrease 实现）
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.teamStrategyDamageIncrease) {
              ally.teamStrategyDamageIncrease = 0;
            }
            ally.teamStrategyDamageIncrease += 0.22;
            if (addReport) {
              addReport(`【${ally.name}】策略伤害提升22%！`);
            }
          });
        }

        // 敌方全体策防-18%全场（通过 enemyStrategyVulnerability 实现，永久效果无duration）
        if (enemies && enemies.length > 0) {
          enemies.forEach((enemy: General) => {
            enemy.enemyStrategyVulnerability = 0.18;
            enemy.enemyStrategyVulnerabilityDuration = 999; // 近似全场永久
            enemy.enemyStrategyVulnerabilitySource = `【${general.name}】的【宰辅之谋】`;
            if (addReport) {
              addReport(`【${enemy.name}】策防降低18%！`);
            }
          });
        }

        return { triggered: true };
      }

      return null;
    },
  };
};

// 创建高颎武将数据
export const createGaoJiong = (): General => {
  const troops = calculateTroops(GAO_JIONG_BASE.command);

  return {
    ...GAO_JIONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createGaoJiongSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: GAO_JIONG_QUOTES,
    rarity: GAO_JIONG_BASE.rarity as GeneralRarity
  };
};

// 从数据库获取高颎的详细信息
export const fetchGaoJiongFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/24`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(GAO_JIONG_BASE.command);

    return {
      ...GAO_JIONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createGaoJiongSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: GAO_JIONG_QUOTES,
      rarity: GAO_JIONG_BASE.rarity as GeneralRarity
    };
  } catch (error) {
    console.error('从数据库获取高颎信息失败:', error);
    return createGaoJiong();
  }
};