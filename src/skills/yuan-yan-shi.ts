import type { Skill, General, GeneralRarity } from "./types";

const YUAN_YAN_QUOTES = {
  skill: ["直谏辅政，忠义为先。", "直言不讳，方为臣道。"],
  death: ["吾虽身死，志节不渝。"]
} as const;

const YUAN_YAN_BASE = {
  id: 515,
  name: "元岩",
  rarity: "uncommon",
  attack: 37,
  attackGrowth: 0.65,
  defense: 56,
  defenseGrowth: 1.03,
  strategy: 87,
  strategyGrowth: 2.58,
  speed: 22,
  speedGrowth: 0.60,
  attackRange: 3,
  siege: 8,
  siegeGrowth: 0.42,
  level: 5,
  command: 84,
  commandGrowth: 1.90,
  leadership: 3.0,
  isDead: false,
  dynasty: "北魏",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuan_yan.jpg",
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

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createYuanYanSkill = (): Skill => ({
  id: "zhijian-guchao",
  name: "直谏固朝",
  type: "command",
  description: "指挥：每回合使全体友军回复3%兵力。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, addReport, allies } = context;

    if (type === "turnEnd" && allies && allies.length > 0) {
      allies.forEach((ally: General) => {
        if (ally.isDead) return;
        const recover = Math.floor(ally.maxTroops * 0.03);
        ally.troops = Math.min(ally.maxTroops, ally.troops + recover);
        if (addReport) addReport(`【${ally.name}】受【直谏固朝】回复${recover}点兵力！`);
      });
      const selfRecover = Math.floor(general.maxTroops * 0.03);
      general.troops = Math.min(general.maxTroops, general.troops + selfRecover);
      if (addReport) addReport(`【${general.name}】回复${selfRecover}点兵力！`);
      return { triggered: true };
    }
    return null;
  },
});

export const createYuanYan = (): General => {
  const troops = calculateTroops(YUAN_YAN_BASE.command);
  return {
    ...YUAN_YAN_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuanYanSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YUAN_YAN_QUOTES,
    rarity: "uncommon" as GeneralRarity,
  };
};

export const fetchYuanYanFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/515`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YUAN_YAN_BASE.command);
    return {
      ...YUAN_YAN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuanYanSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YUAN_YAN_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取元岩信息失败:", error);
    return createYuanYan();
  }
};