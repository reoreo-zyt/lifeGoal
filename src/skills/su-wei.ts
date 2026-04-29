import type { Skill, General, GeneralRarity } from "./types";

const SU_WEI_QUOTES = {
  skill: [
    "开皇盛世，某有微功。",
    "辅佐圣主，共创太平！",
    "为国操劳，鞠躬尽瘁！"
  ],
  death: ["为国一生，无愧于心..."]
} as const;

const SU_WEI_BASE = {
  id: 70,
  name: "苏威",
  rarity: "uncommon" as GeneralRarity,
  attack: 55,
  attackGrowth: 1.72,
  defense: 58,
  defenseGrowth: 1.82,
  strategy: 72,
  strategyGrowth: 2.52,
  speed: 48,
  speedGrowth: 1.42,
  attackRange: 3,
  siege: 45,
  siegeGrowth: 1.28,
  level: 4,
  command: 55,
  commandGrowth: 1.72,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/su_wei.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  strategyDefenseBonus: 0,
  strategyDefenseSource: "",
  strategyReduction: 0,
  strategyReductionSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 苏威自带战法【开皇四贵】
export const createSuWeiSkill = (): Skill => ({
  id: "kaihuang-sigui",
  name: "开皇四贵",
  type: "passive",
  description: "被动：自身策略防御+25%，每回合使随机一名敌方谋略-8%持续2回合",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, enemies } = context;

    // 战斗开始 → 策略防御+25%
    if (type === "battleStart" && event === "init") {
      general.skillEffects.strategyDefenseBonus = 25;
      general.skillEffects.strategyDefenseSource = `【${general.name}】的【开皇四贵】`;
      if (addReport) {
        addReport(`【${general.name}】发动【开皇四贵】！策略防御+25%！`);
      }
      return { triggered: true };
    }

    // 每回合使随机一名敌方谋略-8%持续2回合
    if (type === "turnStart" && event === "init") {
      if (enemies && enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        if (!randomEnemy.skillEffects) randomEnemy.skillEffects = {};
        randomEnemy.skillEffects.strategyReduction = 0.08;
        randomEnemy.skillEffects.strategyReductionDuration = 2;
        randomEnemy.skillEffects.strategyReductionSource = `【${general.name}】的【开皇四贵】`;
        if (addReport) {
          addReport(`【${general.name}】的【开皇四贵】生效！敌方【${randomEnemy.name}】谋略-8%，持续2回合！`);
        }
      }
    }

    return null;
  },
});

export const createSuWei = (): General => {
  const troops = calculateTroops(SU_WEI_BASE.command);
  return {
    ...SU_WEI_BASE,
    troops,
    maxTroops: troops,
    skills: [createSuWeiSkill()],
    skillEffects: {
      ...DEFAULT_SKILL_EFFECTS,
      strategyDefenseBonus: 25,
      strategyDefenseSource: `【${SU_WEI_BASE.name}】的【开皇四贵】`,
    },
    quotes: SU_WEI_QUOTES,
  };
};

export const fetchSuWeiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/70`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(SU_WEI_BASE.command);
    return {
      ...SU_WEI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createSuWeiSkill()],
      skillEffects: {
        ...DEFAULT_SKILL_EFFECTS,
        strategyDefenseBonus: 25,
        strategyDefenseSource: `【${SU_WEI_BASE.name}】的【开皇四贵】`,
      },
      quotes: SU_WEI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取苏威信息失败:", error);
    return createSuWei();
  }
};