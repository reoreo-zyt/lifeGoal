import type { Skill, General, GeneralRarity } from "./types";

const YU_SHI_JI_QUOTES = {
  skill: ["陛下圣明，臣遵旨。", "顺天者昌，逆天者亡。", "谄媚逢迎，乃生存之道。"],
  death: ["化及反贼，不得好死..."]
} as const;

const YU_SHI_JI_BASE = {
  id: 561,
  name: "虞世基",
  rarity: "uncommon",
  attack: 42,
  attackGrowth: 0.80,
  defense: 55,
  defenseGrowth: 1.00,
  strategy: 90,
  strategyGrowth: 2.40,
  speed: 28,
  speedGrowth: 0.50,
  attackRange: 3,
  siege: 9,
  siegeGrowth: 0.45,
  level: 5,
  command: 80,
  commandGrowth: 1.90,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/yu_shi_ji.jpg",
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
  isCharmed: false,
  charmSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createYuShiJiSkill = (): Skill => ({
  id: "meishang-zhice",
  name: "媚上之策",
  type: "active",
  description: "主动，发动概率52%，攻击范围3：使敌方统御最高者陷入魅惑，下回合有50%概率攻击友军；自身每回合额外回复5%兵力。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, targets, currentTroops, maxTroops } = context;

    // 主动战法触发
    if (type === "activeSkill" && event === "trigger") {
      const chance = 0.52;
      if (addReport) addReport(`【${general.name}】尝试发动【媚上之策】（52%）`);
      if (Math.random() >= chance) {
        if (addReport) addReport(`【${general.name}】的【媚上之策】未触发！`);
        return { triggered: false };
      }

      if (addReport) addReport(`【${general.name}】成功发动【媚上之策】！`);
      if (targets && targets.length > 0) {
        const target = targets.reduce((prev: General, cur: General) =>
          prev.command > cur.command ? prev : cur
        );
        if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        target.skillEffects.isCharmed = true;
        target.skillEffects.charmSource = `【${general.name}】的【媚上之策】`;
        if (addReport) addReport(`【${target.name}】陷入魅惑，下回合有50%概率攻击友军！`);
      }
      return { triggered: true };
    }

    // 自身每回合额外回复5%兵力
    if (type === "turnEnd") {
      const ratio = currentTroops / maxTroops;
      if (ratio < 1) {
        const recover = Math.floor(maxTroops * 0.05);
        general.troops = Math.min(maxTroops, general.troops + recover);
        if (addReport) addReport(`【${general.name}】受【媚上之策】回复${recover}点兵力！`);
      }
    }

    // 检查自身被魅惑
    if (type === "turnStart") {
      if (general.skillEffects.isCharmed) {
        if (Math.random() < 0.5) {
          if (addReport) addReport(`【${general.name}】受魅惑影响，攻击友军！`);
        } else {
          if (addReport) addReport(`【${general.name}】抵抗了魅惑效果！`);
        }
        general.skillEffects.isCharmed = false;
      }
    }

    return null;
  },
});

export const createYuShiJi = (): General => {
  const troops = calculateTroops(YU_SHI_JI_BASE.command);
  return {
    ...YU_SHI_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuShiJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_SHI_JI_QUOTES,
    rarity: YU_SHI_JI_BASE.rarity as GeneralRarity,
  };
};

export const fetchYuShiJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/561`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YU_SHI_JI_BASE.command);
    return {
      ...YU_SHI_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuShiJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_SHI_JI_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取虞世基信息失败:", error);
    return createYuShiJi();
  }
};