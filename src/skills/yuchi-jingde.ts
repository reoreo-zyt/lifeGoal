import type { Skill, General, GeneralRarity } from "./types";

const YUCHI_JINGDE_QUOTES = {
  skill: [
    "单鞭夺槊，敌将难逃！",
    "门神显圣，护我大唐！",
    "玄武门前，挡我者死！"
  ],
  death: ["大唐盛世，某家先走一步..."]
} as const;

const YUCHI_JINGDE_BASE = {
  id: 32,
  name: "尉迟敬德",
  rarity: "rare" as GeneralRarity,
  attack: 90,
  attackGrowth: 2.85,
  defense: 88,
  defenseGrowth: 2.82,
  strategy: 48,
  strategyGrowth: 1.18,
  speed: 72,
  speedGrowth: 2.28,
  attackRange: 2,
  siege: 62,
  siegeGrowth: 1.92,
  level: 5,
  command: 90,
  commandGrowth: 2.85,
  leadership: 2.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuchi_jingde.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  physicalDamageReduction: 0,
  physicalDamageReductionSource: "",
  pursuitChance: 0,
  pursuitChanceSource: "",
  pursuitDamage: 0,
  pursuitDamageSource: "",
  isImmuneToSpeedReduction: false,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 尉迟敬德自带战法【单鞭夺槊】
export const createYuchiJingdeSkill = (): Skill => ({
  id: "dan-bian-duo-shuo",
  name: "单鞭夺槊",
  type: "passive",
  description: "被动：战斗开始永久获得35%物理减伤；追击：普攻后45%概率追加75%伤害；免疫速度降低效果",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, target } = context;

    // 战斗开始 → 永久物理减伤 + 免疫速度降低
    if (type === "battleStart" && event === "init") {
      general.skillEffects.physicalDamageReduction = 35;
      general.skillEffects.physicalDamageReductionSource = `【${general.name}】的【单鞭夺槊】`;
      general.skillEffects.pursuitChance = 0.45;
      general.skillEffects.pursuitChanceSource = `【${general.name}】的【单鞭夺槊】`;
      general.skillEffects.pursuitDamage = 0.75;
      general.skillEffects.pursuitDamageSource = `【${general.name}】的【单鞭夺槊】`;
      general.skillEffects.isImmuneToSpeedReduction = true;
      if (addReport) {
        addReport(`【${general.name}】发动【单鞭夺槊】！获得35%物理减伤，免疫速度降低！`);
      }
      return { triggered: true };
    }

    // 追击：普攻后45%概率追加75%伤害
    if (type === "normalAttack" && event === "afterDamage") {
      if (Math.random() < 0.45 && target) {
        const pursuitDamage = Math.max(
          0,
          Math.floor(general.attack * 0.75 - target.defense / 2)
        );
        target.troops = Math.max(0, target.troops - pursuitDamage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】普攻后触发【单鞭夺槊】追击！对【${target.name}】追加${pursuitDamage}点物理伤害！`);
        }
      }
    }

    return null;
  },
});

export const createYuchiJingde = (): General => {
  const troops = calculateTroops(YUCHI_JINGDE_BASE.command);
  return {
    ...YUCHI_JINGDE_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuchiJingdeSkill()],
    skillEffects: {
      ...DEFAULT_SKILL_EFFECTS,
      physicalDamageReduction: 35,
      physicalDamageReductionSource: `【${YUCHI_JINGDE_BASE.name}】的【单鞭夺槊】`,
      pursuitChance: 0.45,
      pursuitChanceSource: `【${YUCHI_JINGDE_BASE.name}】的【单鞭夺槊】`,
      pursuitDamage: 0.75,
      pursuitDamageSource: `【${YUCHI_JINGDE_BASE.name}】的【单鞭夺槊】`,
      isImmuneToSpeedReduction: true,
    },
    quotes: YUCHI_JINGDE_QUOTES,
  };
};

export const fetchYuchiJingdeFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/32`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YUCHI_JINGDE_BASE.command);
    return {
      ...YUCHI_JINGDE_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuchiJingdeSkill()],
      skillEffects: {
        ...DEFAULT_SKILL_EFFECTS,
        physicalDamageReduction: 35,
        physicalDamageReductionSource: `【${YUCHI_JINGDE_BASE.name}】的【单鞭夺槊】`,
        pursuitChance: 0.45,
        pursuitChanceSource: `【${YUCHI_JINGDE_BASE.name}】的【单鞭夺槊】`,
        pursuitDamage: 0.75,
        pursuitDamageSource: `【${YUCHI_JINGDE_BASE.name}】的【单鞭夺槊】`,
        isImmuneToSpeedReduction: true,
      },
      quotes: YUCHI_JINGDE_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取尉迟敬德信息失败:", error);
    return createYuchiJingde();
  }
};
