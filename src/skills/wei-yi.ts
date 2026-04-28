import type { Skill, General, GeneralRarity } from "./types";

const WEI_YI_QUOTES = {
  skill: ["边城既定，民心自安。", "戎马为国，亦当抚众。"],
  death: ["边烽未息，吾已至此。"],
} as const;

const WEI_YI_BASE = {
  id: 73,
  name: "韦艺",
  rarity: "common" as GeneralRarity,
  attack: 72,
  attackGrowth: 2.48,
  defense: 52,
  defenseGrowth: 1.82,
  strategy: 38,
  strategyGrowth: 0.98,
  speed: 62,
  speedGrowth: 2.05,
  attackRange: 2,
  siege: 58,
  siegeGrowth: 1.82,
  level: 4,
  command: 72,
  commandGrowth: 2.48,
  leadership: 1.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/wei_yi.webp",
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

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 主动：单体120%物攻，目标HP<50%时伤害+60%，距离2，概率45%
export const createWeiYiSkill = (): Skill => ({
  id: "gongma-xianshu",
  name: "弓马娴熟",
  type: "active",
  distance: 2,
  probability: 0.45,
  description: "主动：单体120%物攻，目标HP<50%时伤害+60%，距离2，概率45%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      if (targets && targets.length > 0) {
        const target = targets[0];
        const baseDamage = Math.max(0, Math.floor(general.attack * 1.20 - target.defense / 2));
        const bonusMultiplier = target.troops < target.maxTroops * 0.5 ? 1.60 : 1.0;
        const totalDamage = Math.floor(baseDamage * bonusMultiplier);
        target.troops = Math.max(0, target.troops - totalDamage);
        if (target.troops <= 0) target.isDead = true;
        if (addReport) {
          addReport(`【${general.name}】发动【弓马娴熟】，对【${target.name}】造成${totalDamage}点物理伤害！`);
        }
        return { triggered: true };
      }
    }

    return null;
  },
});

export const createWeiYi = (): General => {
  const troops = calculateTroops(WEI_YI_BASE.command);
  return {
    ...WEI_YI_BASE,
    troops,
    maxTroops: troops,
    skills: [createWeiYiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: WEI_YI_QUOTES,
  };
};

export const fetchWeiYiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/73`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(WEI_YI_BASE.command);
    return {
      ...WEI_YI_BASE,
      id: characterData.id ?? WEI_YI_BASE.id,
      name: characterData.name ?? WEI_YI_BASE.name,
      dynasty: characterData.dynasty ?? WEI_YI_BASE.dynasty,
      gender: characterData.gender ?? WEI_YI_BASE.gender,
      avatar: characterData.avatar || WEI_YI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createWeiYiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: WEI_YI_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取韦艺信息失败:', error);
    return createWeiYi();
  }
};
