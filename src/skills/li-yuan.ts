import type { Skill, General, GeneralRarity } from "./types";

const LI_YUAN_QUOTES = {
  skill: ["晋阳起兵，匡扶天下。", "李唐基业，始于今日。", "天下大乱，当取而代之。"],
  death: ["玄武门之事，朕之过矣..."]
} as const;

const LI_YUAN_BASE = {
  id: 1,
  name: "李渊",
  rarity: "uncommon",
  attack: 80,
  attackGrowth: 2.10,
  defense: 88,
  defenseGrowth: 2.30,
  strategy: 86,
  strategyGrowth: 2.20,
  speed: 36,
  speedGrowth: 0.60,
  attackRange: 2,
  siege: 14,
  siegeGrowth: 0.70,
  level: 5,
  command: 95,
  commandGrowth: 2.40,
  leadership: 3.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/li_yuan.jpg",
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

export const createLiYuanSkill = (): Skill => ({
  id: "longxing-jinyang",
  name: "龙兴晋阳",
  type: "command",
  description: "指挥：战斗开始时，使我军全体获得12%永久伤害减免；每回合结束，我军全体回复3%兵力。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, allies } = context;

    // 战斗开始时：全体友军获得12%永久伤害减免
    if (type === "battleStart" && event === "init") {
      if (addReport) addReport(`【${general.name}】发动【龙兴晋阳】，唐室基业，始于今日！`);
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (!ally.skillEffects) ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          ally.skillEffects.damageReduction = 0.12;
          ally.skillEffects.damageReductionSource = `【${general.name}】的【龙兴晋阳】`;
          if (addReport) addReport(`【${ally.name}】获得12%永久伤害减免！`);
        });
      }
      return { triggered: true };
    }

    // 每回合结束：我军全体回复3%兵力
    if (type === "turnEnd") {
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (ally.isDead) return;
          const recover = Math.floor(ally.maxTroops * 0.03);
          ally.troops = Math.min(ally.maxTroops, ally.troops + recover);
          if (addReport) addReport(`【${ally.name}】回复${recover}点兵力！`);
        });
        const selfRecover = Math.floor(general.maxTroops * 0.03);
        general.troops = Math.min(general.maxTroops, general.troops + selfRecover);
        if (addReport) addReport(`【${general.name}】回复${selfRecover}点兵力！`);
      }
    }

    return null;
  },
});

export const createLiYuan = (): General => {
  const troops = calculateTroops(LI_YUAN_BASE.command);
  return {
    ...LI_YUAN_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiYuanSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_YUAN_QUOTES,
    rarity: LI_YUAN_BASE.rarity as GeneralRarity,
  };
};

export const fetchLiYuanFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/1`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LI_YUAN_BASE.command);
    return {
      ...LI_YUAN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiYuanSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LI_YUAN_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取李渊信息失败:", error);
    return createLiYuan();
  }
};