import type { Skill, General, GeneralRarity } from "./types";

const LI_DE_LIN_QUOTES = {
  skill: ["典谟润色，以文辅政。", "经国大略，运筹帷幄。", "文墨安邦，智衡时局。"],
  death: ["一生秉笔，尽事三朝，功名浮沉，皆为天命。"],
} as const;

const LI_DE_LIN_BASE = {
  id: 69,
  name: "李德林",
  rarity: "uncommon" as GeneralRarity,
  attack: 55,
  attackGrowth: 1.78,
  defense: 58,
  defenseGrowth: 1.88,
  strategy: 72,
  strategyGrowth: 2.48,
  speed: 52,
  speedGrowth: 1.62,
  attackRange: 3,
  siege: 48,
  siegeGrowth: 1.32,
  level: 4,
  command: 55,
  commandGrowth: 1.78,
  leadership: 2.0,
  isDead: false,
  dynasty: "北齐",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/li_de_lin.jpg",
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
  strategyDamageReduction: 0,
  strategyDamageReductionSource: "",
  physicalDamageReduction: 0,
  physicalDamageReductionSource: "",
  dispelChance: 0,
  dispelChanceSource: "",
};

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 典谟润色 — 被动：自身受到谋略伤害-12%、物理伤害-18%，每回合有20%概率驱散自身一个debuff
export const createLiDeLinSkill = (): Skill => ({
  id: "dianmo-runse",
  name: "典谟润色",
  type: "passive",
  description: "被动：自身受到谋略伤害-12%、受到物理伤害-18%，每回合有20%概率驱散自身一个debuff",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport } = context;

    if (type === "battleStart" && event === "init") {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      general.skillEffects.strategyDamageReduction = (general.skillEffects.strategyDamageReduction || 0) + 12;
      general.skillEffects.strategyDamageReductionSource = `【${general.name}】的【典谟润色】`;
      general.skillEffects.physicalDamageReduction = (general.skillEffects.physicalDamageReduction || 0) + 18;
      general.skillEffects.physicalDamageReductionSource = `【${general.name}】的【典谟润色】`;
      general.skillEffects.dispelChance = 0.20;
      general.skillEffects.dispelChanceSource = `【${general.name}】的【典谟润色】`;
      if (addReport) {
        addReport(`【${general.name}】发动【典谟润色】，谋伤-12%、物伤-18%，每回合有20%概率驱散自身一个debuff！`);
      }
      return { triggered: true };
    }

    // 每回合有20%概率驱散自身一个debuff
    if (type === "turnStart") {
      if (Math.random() < 0.20) {
        // 简单驱散：重置常见的debuff效果
        if (general.skillEffects.strategyVulnerabilityDuration > 0) {
          general.skillEffects.strategyVulnerability = 0;
          general.skillEffects.strategyVulnerabilityDuration = 0;
          if (addReport) addReport(`【${general.name}】的【典谟润色】驱散了谋略降低效果！`);
          return null;
        }
        if (general.skillEffects.attackDebuffDuration > 0) {
          general.skillEffects.attackDebuff = 0;
          general.skillEffects.attackDebuffDuration = 0;
          if (addReport) addReport(`【${general.name}】的【典谟润色】驱散了攻击降低效果！`);
          return null;
        }
        if (general.skillEffects.defenseDebuffDuration > 0) {
          general.skillEffects.defenseDebuff = 0;
          general.skillEffects.defenseDebuffDuration = 0;
          if (addReport) addReport(`【${general.name}】的【典谟润色】驱散了防御降低效果！`);
          return null;
        }
        if (general.skillEffects.speedDebuffDuration > 0) {
          general.skillEffects.speedDebuff = 0;
          general.skillEffects.speedDebuffDuration = 0;
          if (addReport) addReport(`【${general.name}】的【典谟润色】驱散了速度降低效果！`);
          return null;
        }
        if (general.skillEffects.isStunned) {
          general.skillEffects.isStunned = false;
          if (addReport) addReport(`【${general.name}】的【典谟润色】驱散了【震慑】效果！`);
          return null;
        }
        if (general.skillEffects.cannotPhysicalAttack) {
          general.skillEffects.cannotPhysicalAttack = false;
          general.skillEffects.cannotPhysicalAttackDuration = 0;
          if (addReport) addReport(`【${general.name}】的【典谟润色】驱散了【怯战】效果！`);
          return null;
        }
      }
    }

    return null;
  },
});

export const createLiDeLin = (): General => {
  const troops = calculateTroops(LI_DE_LIN_BASE.command);
  return {
    ...LI_DE_LIN_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiDeLinSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_DE_LIN_QUOTES,
    rarity: LI_DE_LIN_BASE.rarity,
  };
};

export const fetchLiDeLinFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/69`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LI_DE_LIN_BASE.command);
    return {
      ...LI_DE_LIN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiDeLinSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LI_DE_LIN_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取李德林信息失败:", error);
    return createLiDeLin();
  }
};
