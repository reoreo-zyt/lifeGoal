import type { Skill, General, GeneralRarity } from "./types";

const SHANG_GUAN_YI_QUOTES = {
  skill: ["铁骑纵横，谁与争锋。", "战马嘶鸣，敌将胆寒。"],
  death: ["铁骑已折，壮志未酬。"],
} as const;

const SHANG_GUAN_YI_BASE = {
  id: 516,
  name: "上官义",
  rarity: "uncommon" as GeneralRarity,
  attack: 72,
  attackGrowth: 2.52,
  defense: 62,
  defenseGrowth: 2.08,
  strategy: 44,
  strategyGrowth: 1.18,
  speed: 60,
  speedGrowth: 2.05,
  attackRange: 3,
  siege: 58,
  siegeGrowth: 1.78,
  level: 4,
  command: 72,
  commandGrowth: 2.52,
  leadership: 2.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/shang_guan_yi.webp",
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
  pursuitChance: 0,
  pursuitChanceSource: "",
  pursuitDamage: 0,
  pursuitDamageSource: "",
};

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 铁骑纵横 — 被动：骑兵单位伤害+24%，物理防御-10%，追击 35%/追加60%
export const createShangGuanYiSkill = (): Skill => ({
  id: "tieqi-zongheng",
  name: "铁骑纵横",
  type: "passive",
  description: "被动：骑兵单位伤害+24%，物理防御-10%，追击 35%/追加60%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, target } = context;

    if (type === "battleStart" && event === "init") {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      general.skillEffects.damageIncrease = (general.skillEffects.damageIncrease || 0) + 24;
      general.skillEffects.damageIncreaseSource = `【${general.name}】的【铁骑纵横】`;
      general.skillEffects.defensePenalty = (general.skillEffects.defensePenalty || 0) + 10;
      general.skillEffects.defensePenaltySource = `【${general.name}】的【铁骑纵横】`;
      general.skillEffects.pursuitChance = 0.35;
      general.skillEffects.pursuitChanceSource = `【${general.name}】的【铁骑纵横】`;
      general.skillEffects.pursuitDamage = 0.60;
      general.skillEffects.pursuitDamageSource = `【${general.name}】的【铁骑纵横】`;
      if (addReport) {
        addReport(`【${general.name}】发动【铁骑纵横】，骑兵伤害+24%，物防-10%，追击 35%/追加60%！`);
      }
      return { triggered: true };
    }

    // 追击：普攻后35%概率追加60%伤害
    if (type === "normalAttack" && event === "afterDamage") {
      if (Math.random() < 0.35 && target) {
        const pursuitDamage = Math.max(0, Math.floor(general.attack * 0.60 - target.defense / 2));
        target.troops = Math.max(0, target.troops - pursuitDamage);
        if (target.troops <= 0) target.isDead = true;
        if (addReport) {
          addReport(`【${general.name}】触发【铁骑纵横】追击！对【${target.name}】追加${pursuitDamage}点物理伤害！`);
        }
      }
    }

    return null;
  },
});

export const createShangGuanYi = (): General => {
  const troops = calculateTroops(SHANG_GUAN_YI_BASE.command);
  return {
    ...SHANG_GUAN_YI_BASE,
    troops,
    maxTroops: troops,
    skills: [createShangGuanYiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: SHANG_GUAN_YI_QUOTES,
  };
};

export const fetchShangGuanYiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/516`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(SHANG_GUAN_YI_BASE.command);
    return {
      ...SHANG_GUAN_YI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createShangGuanYiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: SHANG_GUAN_YI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取上官义信息失败:", error);
    return createShangGuanYi();
  }
};
