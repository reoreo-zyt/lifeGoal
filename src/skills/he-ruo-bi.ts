import type { Skill, General, GeneralRarity } from "./types";

const HE_RUO_BI_QUOTES = {
  skill: ["灭陈大业，某当先锋！", "建康城破，敌主将擒！", "先锋之任，必不辱命！"],
  death: ["平陈之功，付诸东流..."]
} as const;

const HE_RUO_BI_BASE = {
  id: 44,
  name: "贺若弼",
  rarity: "rare" as GeneralRarity,
  attack: 86,
  attackGrowth: 2.85,
  defense: 70,
  defenseGrowth: 2.18,
  strategy: 62,
  strategyGrowth: 1.92,
  speed: 84,
  speedGrowth: 2.78,
  attackRange: 2,
  siege: 68,
  siegeGrowth: 2.08,
  level: 5,
  command: 86,
  commandGrowth: 2.85,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/he_ruo_bi.jpg",
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
  pursuitChance: 0,
  pursuitChanceSource: "",
  pursuitDamage: 0,
  pursuitDamageSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 主动：连续攻击同一目标2次，每次90%物理伤害，伤害逐次+22%，追击 25%/追加80%
export const createHeRuoBiSkill = (): Skill => ({
  id: "mie-chen-shuangji",
  name: "灭陈双击",
  type: "active",
  distance: 4,
  probability: 0.42,
  description: "主动：连续攻击同一目标2次，每次90%物理伤害，伤害逐次+22%，追击 25%/追加80%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets, target } = context;

    if (type === "battleStart" && event === "init") {
      general.skillEffects.pursuitChance = 0.25;
      general.skillEffects.pursuitChanceSource = `【${general.name}】的【灭陈双击】`;
      general.skillEffects.pursuitDamage = 0.80;
      general.skillEffects.pursuitDamageSource = `【${general.name}】的【灭陈双击】`;
      if (addReport) {
        addReport(`【${general.name}】发动【灭陈双击】，追击效果激活：普攻后25%概率追加80%伤害！`);
      }
    }

    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【灭陈双击】！`);
      }
      if (targets && targets.length > 0) {
        const targetRef = targets[0];
        const baseMultiplier = 0.90;
        const increment = 0.22;

        for (let i = 0; i < 2; i++) {
          const multiplier = baseMultiplier + increment * i;
          const damage = Math.max(0, Math.floor(general.attack * multiplier - targetRef.defense / 2));
          targetRef.troops = Math.max(0, targetRef.troops - damage);
          if (addReport) {
            addReport(`【${general.name}】第${i + 1}次攻击对【${targetRef.name}】造成${damage}点物理伤害！`);
          }
          if (targetRef.troops <= 0) {
            targetRef.isDead = true;
            if (addReport) {
              addReport(`【${targetRef.name}】阵亡！`);
            }
            break;
          }
        }
      }
      return { triggered: true };
    }

    // 追击：普攻后25%概率追加80%伤害
    if (type === "normalAttack" && event === "afterDamage") {
      if (Math.random() < 0.25 && target) {
        const pursuitDamage = Math.max(0, Math.floor(general.attack * 0.80 - target.defense / 2));
        target.troops = Math.max(0, target.troops - pursuitDamage);
        if (target.troops <= 0) target.isDead = true;
        if (addReport) {
          addReport(`【${general.name}】触发【灭陈双击】追击！对【${target.name}】追加${pursuitDamage}点物理伤害！`);
        }
      }
    }

    return null;
  },
});

export const createHeRuoBi = (): General => {
  const troops = calculateTroops(HE_RUO_BI_BASE.command);
  return {
    ...HE_RUO_BI_BASE,
    troops,
    maxTroops: troops,
    skills: [createHeRuoBiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: HE_RUO_BI_QUOTES,
  };
};

export const fetchHeRuoBiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/44`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(HE_RUO_BI_BASE.command);
    return {
      ...HE_RUO_BI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createHeRuoBiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: HE_RUO_BI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取贺若弼信息失败:", error);
    return createHeRuoBi();
  }
};
