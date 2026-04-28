import type { Skill, General, GeneralRarity } from "./types";

const LIU_WEN_JING_QUOTES = {
  skill: ["晋阳起兵，大业可成。", "与秦王共谋，定天下之策。", "运筹帷幄，决胜千里。"],
  death: ["裴寂害我，死不瞑目..."]
} as const;

const LIU_WEN_JING_BASE = {
  id: 20,
  name: "刘文静",
  rarity: "uncommon",
  attack: 52,
  attackGrowth: 0.90,
  defense: 58,
  defenseGrowth: 1.10,
  strategy: 94,
  strategyGrowth: 2.60,
  speed: 45,
  speedGrowth: 0.70,
  attackRange: 3,
  siege: 10,
  siegeGrowth: 0.50,
  level: 5,
  command: 86,
  commandGrowth: 2.10,
  leadership: 3.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/liu_wen_jing.jpg",
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
  defenseReduction: 0,
  defenseReductionDuration: 0,
  defenseReductionSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createLiuWenJingSkill = (): Skill => ({
  id: "jinyang-zhimou",
  name: "晋阳之谋",
  type: "active",
  description: "主动，发动概率48%，攻击范围3：对敌军随机2人造成125%策略伤害，并使目标防御降低12%，持续1回合。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      const chance = 0.48;
      if (addReport) addReport(`【${general.name}】尝试发动【晋阳之谋】（48%）`);
      if (Math.random() >= chance) {
        if (addReport) addReport(`【${general.name}】的【晋阳之谋】未触发！`);
        return { triggered: false };
      }

      if (addReport) addReport(`【${general.name}】成功发动【晋阳之谋】！`);
      if (targets && targets.length > 0) {
        targets.slice(0, 2).forEach((target: General) => {
          const damage = Math.max(0, Math.floor(general.strategy * 1.25 - target.strategy / 2));
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) target.isDead = true;
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          target.skillEffects.defenseReduction = 0.12;
          target.skillEffects.defenseReductionDuration = 1;
          target.skillEffects.defenseReductionSource = `【${general.name}】的【晋阳之谋】`;
          if (addReport) addReport(`【${target.name}】受到${damage}点策略伤害，防御降低12%！`);
        });
      }
      return { triggered: true };
    }

    // 回合开始时减少持续时间
    if (type === "turnStart") {
      if (general.skillEffects.defenseReductionDuration > 0) {
        general.skillEffects.defenseReductionDuration -= 1;
        if (general.skillEffects.defenseReductionDuration === 0) {
          if (addReport) addReport(`【${general.name}】的防御降低效果结束！`);
          general.skillEffects.defenseReduction = 0;
        }
      }
    }

    return null;
  },
});

export const createLiuWenJing = (): General => {
  const troops = calculateTroops(LIU_WEN_JING_BASE.command);
  return {
    ...LIU_WEN_JING_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiuWenJingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LIU_WEN_JING_QUOTES,
    rarity: LIU_WEN_JING_BASE.rarity as GeneralRarity,
  };
};

export const fetchLiuWenJingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/20`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LIU_WEN_JING_BASE.command);
    return {
      ...LIU_WEN_JING_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiuWenJingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LIU_WEN_JING_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取刘文静信息失败:", error);
    return createLiuWenJing();
  }
};