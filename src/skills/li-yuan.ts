import type { Skill, General, GeneralRarity } from "./types";

const LI_YUAN_QUOTES = {
  skill: ["晋阳起兵，匡扶天下。", "李唐基业，始于今日。", "天下大乱，当取而代之。"],
  death: ["玄武门之事，朕之过矣..."],
} as const;

const LI_YUAN_BASE = {
  id: 1,
  name: "李渊",
  rarity: "uncommon" as GeneralRarity,
  attack: 65,
  attackGrowth: 2.28,
  defense: 60,
  defenseGrowth: 2.08,
  strategy: 52,
  strategyGrowth: 1.58,
  speed: 50,
  speedGrowth: 1.52,
  attackRange: 3,
  siege: 72,
  siegeGrowth: 2.28,
  level: 4,
  command: 65,
  commandGrowth: 2.28,
  leadership: 2.5,
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

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 晋阳起兵 — 指挥：前两回合我方全体防御+22%，同时自身攻击+18%
export const createLiYuanSkill = (): Skill => ({
  id: "jinyang-qibing",
  name: "晋阳起兵",
  type: "command",
  description: "指挥：前两回合我方全体防御+22%，同时自身攻击+18%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, allies } = context;

    // 战斗开始时：全体友军防御+22%，自身攻击+18%，首回合必定先手
    if (type === "battleStart" && event === "init") {
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (!ally.skillEffects) ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          ally.skillEffects.defenseBonus = (ally.skillEffects.defenseBonus || 0) + 22;
          ally.skillEffects.defenseBonusSource = `【${general.name}】的【晋阳起兵】`;
          ally.skillEffects.defenseBonusDuration = 2;
          if (addReport) addReport(`【${ally.name}】受【晋阳起兵】防御+22%！`);
        });
      }
      general.skillEffects.attackBonus = (general.skillEffects.attackBonus || 0) + 18;
      general.skillEffects.attackBonusSource = `【${general.name}】的【晋阳起兵】`;
      general.skillEffects.attackBonusDuration = 2;
      general.skillEffects.alwaysFirst = true;
      general.skillEffects.alwaysFirstSource = `【${general.name}】的【晋阳起兵】`;
      if (addReport) {
        addReport(`【${general.name}】发动【晋阳起兵】，唐室基业，始于今日！自身攻击+18%，首回合必定先手！`);
      }
      return { triggered: true };
    }

    // 回合结束减少持续时间
    if (type === "turnEnd") {
      if (general.skillEffects?.defenseBonusDuration) {
        general.skillEffects.defenseBonusDuration -= 1;
        if (general.skillEffects.defenseBonusDuration <= 0) {
          general.skillEffects.defenseBonus = 0;
          general.skillEffects.defenseBonusSource = "";
          general.skillEffects.defenseBonusDuration = 0;
        }
      }
      if (general.skillEffects?.attackBonusDuration) {
        general.skillEffects.attackBonusDuration -= 1;
        if (general.skillEffects.attackBonusDuration <= 0) {
          general.skillEffects.attackBonus = 0;
          general.skillEffects.attackBonusSource = "";
          general.skillEffects.attackBonusDuration = 0;
        }
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
    rarity: LI_YUAN_BASE.rarity,
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
