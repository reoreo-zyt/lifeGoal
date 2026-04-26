import type { Skill, General } from "./types";

const HAN_QIN_HU_BASE = {
  id: 43,
  name: "韩擒虎",
  attack: 94,
  attackGrowth: 2.68,
  defense: 86,
  defenseGrowth: 2.14,
  strategy: 56,
  strategyGrowth: 1.12,
  speed: 66,
  speedGrowth: 1.36,
  attackRange: 2,
  siege: 16,
  siegeGrowth: 0.82,
  level: 5,
  command: 93,
  commandGrowth: 2.35,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/han_qin_hu.webp",
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
  skillTriggerReduction: 0,
  skillTriggerReductionDuration: 0,
  skillTriggerReductionSource: "",
  defenseReduction: 0,
  defenseReductionDuration: 0,
  defenseReductionSource: "",
  cannotNormalAttack: false,
  cannotNormalAttackDuration: 0,
  cannotNormalAttackSource: "",
  passiveDamageTagValue: 0.3,
  passiveDamageTagLabel: "破阵",
  passiveDamageTagSource: "【先破建业】普攻前40%概率增伤30%",
  passiveDamageTagChance: 0.4,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createHanQinHuSkill = (): Skill => {
  return {
    id: "xianpo-jianye",
    name: "先破建业",
    type: "passive",
    description:
      "被动：普通攻击前有 40% 概率使本次伤害提升 30%；自身兵力低于 60% 时，额外获得 16% 减伤。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      const { type, event, currentTroops, maxTroops, addReport } = context;

      if (type === "attack" && event === "beforeAttack") {
        if (Math.random() < 0.4) {
          if (addReport) addReport(`【${general.name}】触发【先破建业】，本次伤害提升30%！`);
          return { damageIncrease: 0.3 };
        }
      }

      if (type === "attacked" && event === "beforeDamage") {
        const ratio = maxTroops > 0 ? currentTroops / maxTroops : 1;
        if (ratio < 0.6) {
          general.skillEffects.damageReduction = 0.16;
          general.skillEffects.damageReductionSource = `【${general.name}】的【先破建业】`;
          return { damageReduction: 0.16 };
        }
      }
      return null;
    },
  };
};

export const createHanQinHu = (): General => {
  const troops = calculateTroops(HAN_QIN_HU_BASE.command);
  return {
    ...HAN_QIN_HU_BASE,
    troops,
    maxTroops: troops,
    skills: [createHanQinHuSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: ["先登破阵，擒敌于前！", "一鼓而入，敌城可下！"],
      death: ["平陈之志，竟止于此。"],
    },
  };
};

export const fetchHanQinHuFromDatabase = async (
  API_BASE_URL: string,
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/43`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(HAN_QIN_HU_BASE.command);
    return {
      ...HAN_QIN_HU_BASE,
      id: characterData.id ?? HAN_QIN_HU_BASE.id,
      name: characterData.name ?? HAN_QIN_HU_BASE.name,
      dynasty: characterData.dynasty ?? HAN_QIN_HU_BASE.dynasty,
      gender: characterData.gender ?? HAN_QIN_HU_BASE.gender,
      avatar: characterData.avatar || HAN_QIN_HU_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createHanQinHuSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: ["先登破阵，擒敌于前！", "一鼓而入，敌城可下！"],
        death: ["平陈之志，竟止于此。"],
      },
    };
  } catch (error) {
    console.error("从数据库获取韩擒虎信息失败:", error);
    return createHanQinHu();
  }
};
