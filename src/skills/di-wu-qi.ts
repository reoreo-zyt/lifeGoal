import type { Skill, General, GeneralRarity } from "./types";

const DI_XIAO_WEI_QUOTES = {
  skill: ["临阵不退，吾往矣！", "宁为百夫长，不为一书生！"],
  death: ["死战报国，马革裹尸！"],
} as const;

const DI_XIAO_WEI_BASE = {
  id: 74,
  name: "邸校尉",
  rarity: "common" as GeneralRarity,
  attack: 62,
  attackGrowth: 2.08,
  defense: 58,
  defenseGrowth: 1.85,
  strategy: 35,
  strategyGrowth: 0.88,
  speed: 42,
  speedGrowth: 1.22,
  attackRange: 2,
  siege: 68,
  siegeGrowth: 2.08,
  level: 4,
  command: 62,
  commandGrowth: 2.08,
  leadership: 1.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/di_xiao_wei.webp",
};

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

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 主动：消耗20%当前兵力对单体造成消耗量×3的物理伤害，距离2，概率40%
export const createDiXiaoWeiSkill = (): Skill => ({
  id: "fusi-tuji",
  name: "赴死突击",
  type: "active",
  distance: 2,
  probability: 0.40,
  description: "主动：消耗20%当前兵力对单体造成消耗量×3的物理伤害，距离2，概率40%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      if (targets && targets.length > 0) {
        const target = targets[0];
        const cost = Math.floor(general.troops * 0.20);
        general.troops = Math.max(1, general.troops - cost);
        const damage = cost * 3;
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) target.isDead = true;
        if (addReport) {
          addReport(`【${general.name}】发动【赴死突击】，消耗${cost}点兵力，对【${target.name}】造成${damage}点物理伤害！`);
        }
        return { triggered: true };
      }
    }

    return null;
  },
});

export const createDiXiaoWei = (): General => {
  const troops = calculateTroops(DI_XIAO_WEI_BASE.command);
  return {
    ...DI_XIAO_WEI_BASE,
    troops,
    maxTroops: troops,
    skills: [createDiXiaoWeiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: DI_XIAO_WEI_QUOTES,
  };
};

export const fetchDiXiaoWeiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/74`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(DI_XIAO_WEI_BASE.command);
    return {
      ...DI_XIAO_WEI_BASE,
      id: characterData.id ?? DI_XIAO_WEI_BASE.id,
      name: characterData.name ?? DI_XIAO_WEI_BASE.name,
      dynasty: characterData.dynasty ?? DI_XIAO_WEI_BASE.dynasty,
      gender: characterData.gender ?? DI_XIAO_WEI_BASE.gender,
      avatar: characterData.avatar || DI_XIAO_WEI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createDiXiaoWeiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: DI_XIAO_WEI_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取邸校尉信息失败:', error);
    return createDiXiaoWei();
  }
};
