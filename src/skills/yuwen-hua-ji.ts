import type { Skill, General, GeneralRarity } from "./types";

const YU_WEN_HUA_JI_QUOTES = {
  skill: ["江都之变，天命在我。", "杨广无道，当诛之。", "弑君夺位，舍我其谁。"],
  death: ["本想称帝，竟至于此..."]
} as const;

const YU_WEN_HUA_JI_BASE = {
  id: 26,
  name: "宇文化及",
  rarity: "uncommon",
  attack: 90,
  attackGrowth: 2.40,
  defense: 82,
  defenseGrowth: 2.00,
  strategy: 50,
  strategyGrowth: 1.10,
  speed: 38,
  speedGrowth: 0.60,
  attackRange: 2,
  siege: 12,
  siegeGrowth: 0.60,
  level: 5,
  command: 88,
  commandGrowth: 2.20,
  leadership: 3.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yu_wen_hua_ji.jpg",
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
  isFeared: false,
  fearSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createYuWenHuaJiSkill = (): Skill => ({
  id: "shijun-zhiren",
  name: "弑君之刃",
  type: "passive",
  description: "被动：普通攻击有35%概率使目标陷入【恐惧】（下回合无法行动）；自身兵力低于30%时，攻击伤害+42%。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, currentTroops, maxTroops, target } = context;

    if (type === "attack" && event === "beforeAttack") {
      // 35%概率使目标恐惧
      if (Math.random() < 0.35 && target) {
        if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        target.skillEffects.isFeared = true;
        target.skillEffects.fearSource = `【${general.name}】的【弑君之刃】`;
        if (addReport) addReport(`【${target.name}】陷入【恐惧】，下回合无法行动！`);
      }

      // 兵力低于30%时，伤害+42%
      const ratio = maxTroops > 0 ? currentTroops / maxTroops : 1;
      if (ratio < 0.30) {
        if (addReport) addReport(`【${general.name}】兵力危急，【弑君之刃】激发，伤害+42%！`);
        return { damageIncrease: 0.42 };
      }
    }

    if (type === "turnStart") {
      if (general.skillEffects.isFeared) {
        if (addReport) addReport(`【${general.name}】处于【恐惧】状态，本回合无法行动！`);
        general.skillEffects.isFeared = false;
        return { skipTurn: true };
      }
    }

    return null;
  },
});

export const createYuWenHuaJi = (): General => {
  const troops = calculateTroops(YU_WEN_HUA_JI_BASE.command);
  return {
    ...YU_WEN_HUA_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuWenHuaJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_WEN_HUA_JI_QUOTES,
    rarity: YU_WEN_HUA_JI_BASE.rarity as GeneralRarity,
  };
};

export const fetchYuWenHuaJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/26`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YU_WEN_HUA_JI_BASE.command);
    return {
      ...YU_WEN_HUA_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuWenHuaJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_WEN_HUA_JI_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取宇文化及信息失败:", error);
    return createYuWenHuaJi();
  }
};