import type { Skill, General, GeneralRarity } from "./types";

const PEI_XING_YAN_QUOTES = {
  skill: ["攻城略地，此其时也。", "箭楼云梯，唾手可得。", "敌军城池，终将陷落。"],
  death: ["城未破而身先死，恨哉..."],
} as const;

const PEI_XING_YAN_BASE = {
  id: 35,
  name: "裴行俨",
  rarity: "rare",
  attack: 78,
  attackGrowth: 2.28,
  defense: 82,
  defenseGrowth: 2.58,
  strategy: 62,
  strategyGrowth: 1.92,
  speed: 72,
  speedGrowth: 2.28,
  attackRange: 4,
  siege: 75,
  siegeGrowth: 2.38,
  level: 4,
  command: 78,
  commandGrowth: 2.28,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/pei_xing_yan.jpg",
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

// 裴行俨的自带战法【攻城略地】
export const createPeiXingYanSkill = (): Skill => {
  return {
    id: "gong-cheng-lue-di",
    name: "攻城略地",
    type: "passive",
    description: "被动：攻击大营目标额外伤害+138%",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport } = context;

      // 攻击大营目标时：额外伤害+138%，每场战斗首次攻击伤害+50%
      if (type === "attack" && event === "dealDamage") {
        // 通过 context 传入目标位置信息
        const targetPosition = context.targetPosition;
        if (targetPosition === "大营") {
          if (addReport) {
            addReport(`【${general.name}】的【攻城略地】对大营目标造成额外伤害！`);
          }
        }
        // 每场战斗首次攻击伤害+50%（通过 firstAttackDamageBonus 实现）
        if (addReport) {
          addReport(`【${general.name}】的【攻城略地】生效：攻击伤害+50%！`);
        }
        return { bonusDamageMultiplier: targetPosition === "大营" ? 1.38 : 0, firstAttackDamageBonus: 0.50 };
      }

      return null;
    },
  };
};

export const createPeiXingYan = (): General => {
  const troops = calculateTroops(PEI_XING_YAN_BASE.command);
  return {
    ...PEI_XING_YAN_BASE,
    troops,
    maxTroops: troops,
    skills: [createPeiXingYanSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: PEI_XING_YAN_QUOTES,
    rarity: PEI_XING_YAN_BASE.rarity as GeneralRarity,
  };
};

export const fetchPeiXingYanFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/35`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(PEI_XING_YAN_BASE.command);
    return {
      ...PEI_XING_YAN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createPeiXingYanSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: PEI_XING_YAN_QUOTES,
      rarity: PEI_XING_YAN_BASE.rarity as GeneralRarity,
    };
  } catch (error) {
    console.error('从数据库获取裴行俨信息失败:', error);
    return createPeiXingYan();
  }
};
