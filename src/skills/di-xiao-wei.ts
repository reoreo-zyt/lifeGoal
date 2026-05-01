import type { Skill, General, GeneralRarity } from "./types";

const DI_XIAO_WEI_QUOTES = {
  skill: ["赴死突击，不胜无归！", "以血肉之躯，换敌军覆灭！"],
  death: ["马革裹尸，此生无憾。"],
} as const;

const DI_XIAO_WEI_BASE = {
  id: 74,
  name: "赵才",
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
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/di_xiao_wei.jpg",
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
export const createDiXiaoWeiSkill = (): Skill => {
  return {
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
          // 消耗20%当前兵力
          const cost = Math.floor(general.troops * 0.20);
          general.troops = Math.max(1, general.troops - cost);
          // 造成消耗量×3的物理伤害
          const damage = cost * 3 + Math.floor(general.attack - target.defense / 2);
          const finalDamage = Math.max(0, damage);
          target.troops = Math.max(0, target.troops - finalDamage);
          if (target.troops <= 0) target.isDead = true;
          if (addReport) {
            addReport(`【${general.name}】发动【赴死突击】，消耗${cost}点兵力，对【${target.name}】造成${finalDamage}点物理伤害！`);
          }
          return { triggered: true };
        }
      }

      return null;
    },
  };
};

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
    console.error('从数据库获取赵才信息失败:', error);
    return createDiXiaoWei();
  }
};
