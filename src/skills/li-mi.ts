import type { Skill, General, GeneralRarity } from "./types";

const LI_MI_QUOTES = {
  skill: ["瓦岗英雄，唯我独尊。", "问鼎中原，舍我其谁。", "天下大势，尽在掌握。"],
  death: ["熊耳山下，李密休矣..."],
} as const;

const LI_MI_BASE = {
  id: 570,
  name: "李密",
  rarity: "uncommon" as GeneralRarity,
  attack: 48,
  attackGrowth: 1.48,
  defense: 45,
  defenseGrowth: 1.38,
  strategy: 78,
  strategyGrowth: 2.85,
  speed: 58,
  speedGrowth: 2.08,
  attackRange: 3,
  siege: 52,
  siegeGrowth: 1.58,
  level: 4,
  command: 48,
  commandGrowth: 1.48,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/li_mi.jpg",
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

// 瓦岗锦囊 — 指挥：友军策略伤害+18%，自身被攻击35%反击
export const createLiMiSkill = (): Skill => ({
  id: "wagang-jinnang",
  name: "瓦岗锦囊",
  type: "command",
  description: "指挥：我方全体策略伤害+18%，自身被攻击时35%概率反击",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, allies, attacker } = context;

    // 指挥：战斗开始时友军策略伤害+18%
    if (type === "battleStart" && event === "init") {
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (!ally.skillEffects) ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          ally.skillEffects.strategyDamageBonus = (ally.skillEffects.strategyDamageBonus || 0) + 18;
          ally.skillEffects.strategyDamageBonusSource = `【${general.name}】的【瓦岗锦囊】`;
          if (addReport) addReport(`【${ally.name}】受【瓦岗锦囊】策略伤害+18%！`);
        });
      }
      if (addReport) addReport(`【${general.name}】发动【瓦岗锦囊】！`);
      return { triggered: true };
    }

    // 自身被攻击时35%概率反击
    if (type === "attacked" && event === "afterDamage" && attacker) {
      if (Math.random() < 0.35) {
        if (addReport) addReport(`【${general.name}】受击，触发【瓦岗锦囊】反击！`);
        const counterDamage = Math.max(0, Math.floor(general.attack * 0.8 - attacker.defense / 4));
        attacker.troops = Math.max(0, attacker.troops - counterDamage);
        if (attacker.troops <= 0) attacker.isDead = true;
        if (addReport) addReport(`【${general.name}】对【${attacker.name}】发动反击，造成${counterDamage}点物理伤害！`);
      }
    }

    return null;
  },
});

export const createLiMi = (): General => {
  const troops = calculateTroops(LI_MI_BASE.command);
  return {
    ...LI_MI_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiMiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_MI_QUOTES,
    rarity: LI_MI_BASE.rarity,
  };
};

export const fetchLiMiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/570`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LI_MI_BASE.command);
    return {
      ...LI_MI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiMiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LI_MI_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取李密信息失败:", error);
    return createLiMi();
  }
};
