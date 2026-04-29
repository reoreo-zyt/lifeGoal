import type { Skill, General, GeneralRarity } from "./types";

const YUAN_WEN_JING_QUOTES = {
  skill: ["疾风知劲草，兵贵神速。", "先发制人，胜券在握。"],
  death: ["天下武功，唯快不破..."],
} as const;

const YUAN_WEN_JING_BASE = {
  id: 524,
  name: "元文景",
  rarity: "uncommon" as GeneralRarity,
  attack: 58,
  attackGrowth: 1.85,
  defense: 52,
  defenseGrowth: 1.58,
  strategy: 62,
  strategyGrowth: 2.05,
  speed: 80,
  speedGrowth: 2.88,
  attackRange: 3,
  siege: 50,
  siegeGrowth: 1.48,
  level: 4,
  command: 58,
  commandGrowth: 1.85,
  leadership: 2.0,
  isDead: false,
  dynasty: "北魏",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuan_wen_jing.jpg",
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
  speedBonus: 0,
  speedBonusSource: "",
  alwaysFirst: false,
  alwaysFirstSource: "",
  firstActionDispel: false,
  firstActionDispelSource: "",
};

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 疾风先手 — 被动：速度+25%，必定先手，每回合首次行动前驱散自身1个debuff
export const createYuanWenJingSkill = (): Skill => ({
  id: "jifeng-xianshou",
  name: "疾风先手",
  type: "passive",
  description: "被动：速度+25%，必定先手，每回合首次行动前驱散自身1个debuff",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport } = context;

    if (type === "battleStart" && event === "init") {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      general.skillEffects.speedBonus = (general.skillEffects.speedBonus || 0) + 25;
      general.skillEffects.speedBonusSource = `【${general.name}】的【疾风先手】`;
      general.skillEffects.alwaysFirst = true;
      general.skillEffects.alwaysFirstSource = `【${general.name}】的【疾风先手】`;
      general.skillEffects.firstActionDispel = true;
      general.skillEffects.firstActionDispelSource = `【${general.name}】的【疾风先手】`;
      if (addReport) {
        addReport(`【${general.name}】发动【疾风先手】，速度+25%，本场战斗必定先手，每回合首次行动前驱散自身1个debuff！`);
      }
      return { triggered: true };
    }

    // 每回合首次行动前驱散自身1个debuff（通过turnStart实现）
    if (type === "turnStart") {
      const SE = general.skillEffects;
      let dispelled = false;
      if (SE.strategyVulnerabilityDuration > 0) {
        SE.strategyVulnerability = 0; SE.strategyVulnerabilityDuration = 0;
        dispelled = true;
      } else if (SE.attackDebuffDuration > 0) {
        SE.attackDebuff = 0; SE.attackDebuffDuration = 0;
        dispelled = true;
      } else if (SE.defenseDebuffDuration > 0) {
        SE.defenseDebuff = 0; SE.defenseDebuffDuration = 0;
        dispelled = true;
      } else if (SE.speedDebuffDuration > 0) {
        SE.speedDebuff = 0; SE.speedDebuffDuration = 0;
        dispelled = true;
      } else if (SE.isStunned) {
        SE.isStunned = false;
        dispelled = true;
      } else if (SE.cannotPhysicalAttack) {
        SE.cannotPhysicalAttack = false; SE.cannotPhysicalAttackDuration = 0;
        dispelled = true;
      }
      if (dispelled && addReport) {
        addReport(`【${general.name}】的【疾风先手】驱散了自身1个debuff！`);
      }
    }

    return null;
  },
});

export const createYuanWenJing = (): General => {
  const troops = calculateTroops(YUAN_WEN_JING_BASE.command);
  return {
    ...YUAN_WEN_JING_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuanWenJingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YUAN_WEN_JING_QUOTES,
    rarity: YUAN_WEN_JING_BASE.rarity,
  };
};

export const fetchYuanWenJingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/524`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YUAN_WEN_JING_BASE.command);
    return {
      ...YUAN_WEN_JING_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuanWenJingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YUAN_WEN_JING_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取元文景信息失败:", error);
    return createYuanWenJing();
  }
};
