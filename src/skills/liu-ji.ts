import type { Skill, General, GeneralRarity } from "./types";

const LIU_JI_QUOTES = {
  skill: [
    "河东世族，名门风范！",
    "家学渊源，为国效力！",
    "守正持重，不负所学！"
  ],
  death: ["世家风范，传承不绝..."]
} as const;

const LIU_JI_BASE = {
  id: 76,
  name: "柳机",
  rarity: "common" as GeneralRarity,
  attack: 48,
  attackGrowth: 1.42,
  defense: 52,
  defenseGrowth: 1.58,
  strategy: 55,
  strategyGrowth: 1.68,
  speed: 45,
  speedGrowth: 1.32,
  attackRange: 2,
  siege: 42,
  siegeGrowth: 1.22,
  level: 3,
  command: 48,
  commandGrowth: 1.42,
  leadership: 1.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/liu_ji.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  debuffDurationReduction: 0,
  debuffDurationReductionSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 柳机自带战法【河东名门】
export const createLiuJiSkill = (): Skill => ({
  id: "hedong-mingmen",
  name: "河东名门",
  type: "passive",
  description: "被动：自身受到的负面状态持续时间-1回合",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport } = context;

    // 战斗开始 → 负面状态持续时间-1回合
    if (type === "battleStart" && event === "init") {
      general.skillEffects.debuffDurationReduction = 1;
      general.skillEffects.debuffDurationReductionSource = `【${general.name}】的【河东名门】`;
      if (addReport) {
        addReport(`【${general.name}】发动【河东名门】！自身受到的负面状态持续时间-1回合！`);
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createLiuJi = (): General => {
  const troops = calculateTroops(LIU_JI_BASE.command);
  return {
    ...LIU_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiuJiSkill()],
    skillEffects: {
      ...DEFAULT_SKILL_EFFECTS,
      debuffDurationReduction: 1,
      debuffDurationReductionSource: `【${LIU_JI_BASE.name}】的【河东名门】`,
    },
    quotes: LIU_JI_QUOTES,
  };
};

export const fetchLiuJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/76`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LIU_JI_BASE.command);
    return {
      ...LIU_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiuJiSkill()],
      skillEffects: {
        ...DEFAULT_SKILL_EFFECTS,
        debuffDurationReduction: 1,
        debuffDurationReductionSource: `【${LIU_JI_BASE.name}】的【河东名门】`,
      },
      quotes: LIU_JI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取柳机信息失败:", error);
    return createLiuJi();
  }
};