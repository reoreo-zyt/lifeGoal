import type { Skill, General, GeneralRarity } from "./types";

const LI_DE_LIN_QUOTES = {
  skill: ["掌笔裁策，以定天下。", "经国大略，运筹帷幄。", "文墨安邦，智衡时局。"],
  death: ["一生秉笔，尽事三朝，功名浮沉，皆为天命。"],
} as const;

const LI_DE_LIN_BASE = {
  id: 69,
  name: "李德林",
  rarity: "uncommon",
  attack: 47,
  attackGrowth: 0.81,
  defense: 59,
  defenseGrowth: 1.15,
  strategy: 97,
  strategyGrowth: 2.92,
  speed: 56,
  speedGrowth: 0.73,
  attackRange: 4,
  siege: 11,
  siegeGrowth: 0.55,
  level: 5,
  command: 91,
  commandGrowth: 2.43,
  leadership: 3.0,
  isDead: false,
  dynasty: "北齐",
  soldierType: "弓兵" as const,
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
  damageOutputReduction: 0,
  damageOutputReductionDuration: 0,
  damageOutputReductionSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createLiDeLinSkill = (): Skill => ({
  id: "hongbi-dinglve",
  name: "鸿笔定略",
  type: "active",
  description: "主动，发动概率48%，攻击范围4：对敌军随机2人造成155%策略伤害，降低目标15%伤害输出，持续2回合。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      const chance = 0.48;
      if (addReport) addReport(`【${general.name}】尝试发动【鸿笔定略】（48%）`);
      if (Math.random() >= chance) {
        if (addReport) addReport(`【${general.name}】的【鸿笔定略】未触发！`);
        return { triggered: false };
      }

      if (addReport) addReport(`【${general.name}】成功发动【鸿笔定略】！`);
      if (targets && targets.length > 0) {
        targets.slice(0, 2).forEach((target: General) => {
          const damage = Math.max(0, Math.floor(general.strategy * 1.55 - target.strategy / 2));
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) target.isDead = true;
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          target.skillEffects.damageOutputReduction = 0.15;
          target.skillEffects.damageOutputReductionDuration = 2;
          target.skillEffects.damageOutputReductionSource = `【${general.name}】的【鸿笔定略】`;
          if (addReport) addReport(`【${target.name}】受到${damage}点策略伤害，伤害输出降低15%！`);
        });
      }
      return { triggered: true };
    }

    // 回合开始时减少持续时间
    if (type === "turnStart") {
      if (general.skillEffects.damageOutputReductionDuration > 0) {
        general.skillEffects.damageOutputReductionDuration -= 1;
        if (general.skillEffects.damageOutputReductionDuration === 0) {
          if (addReport) addReport(`【${general.name}】的降攻效果结束！`);
          general.skillEffects.damageOutputReduction = 0;
        }
      }
    }

    // 攻击时应用降攻效果
    if (type === "attack" && event === "beforeAttack") {
      if (general.skillEffects.damageOutputReduction > 0) {
        return { damageIncrease: -general.skillEffects.damageOutputReduction };
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
    rarity: LI_DE_LIN_BASE.rarity as GeneralRarity,
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