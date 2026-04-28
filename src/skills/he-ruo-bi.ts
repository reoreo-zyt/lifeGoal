import type { Skill, General, GeneralRarity } from "./types";

const HE_RUO_BI_QUOTES = {
  skill: ["先锋之职，当破坚阵。", "建康城下，敌主授首。", "擒龙破阵，一击必杀。"],
  death: ["功高震主，古今同然..."],
} as const;

const HE_RUO_BI_BASE = {
  id: 44,
  name: "贺若弼",
  rarity: "rare" as GeneralRarity,
  attack: 96,
  attackGrowth: 2.70,
  defense: 78,
  defenseGrowth: 1.90,
  strategy: 58,
  strategyGrowth: 1.20,
  speed: 62,
  speedGrowth: 1.00,
  attackRange: 2,
  siege: 14,
  siegeGrowth: 0.70,
  level: 5,
  command: 91,
  commandGrowth: 2.30,
  leadership: 3.0,
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
  hasExtraAttack: false,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

/**
 * 【擒龙破阵】主动
 * - 发动概率 48%，攻击范围 2
 * - 对敌方单体造成 160% 物理伤害；若击杀目标，立即再次发动（每回合最多 1 次）
 * - 整体定位：高爆发单体物理伤害，收割型输出
 */
export const createHeRuoBiSkill = (): Skill => ({
  id: "qinlong-pozhen",
  name: "擒龙破阵",
  type: "active",
  description:
    "主动，发动概率 48%，攻击范围 2：对敌方单体造成 160% 物理伤害；若击杀目标，立即再次发动（每回合最多 1 次）。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      // 每回合最多额外攻击 1 次
      if (general.skillEffects.hasExtraAttack) {
        general.skillEffects.hasExtraAttack = false;
        return null;
      }

      const triggerChance = 0.48;
      if (addReport) {
        addReport(
          `【${general.name}】尝试发动【擒龙破阵】（发动概率：${(triggerChance * 100).toFixed(0)}%）`
        );
      }

      if (Math.random() < triggerChance) {
        if (addReport) {
          addReport(`【${general.name}】成功发动【擒龙破阵】！`);
        }

        let hasKilled = false;

        if (targets && targets.length > 0) {
          const target = targets[0];
          const damage = Math.max(
            0,
            Math.floor(general.attack * 1.60 - target.defense / 2)
          );
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) {
            target.isDead = true;
            hasKilled = true;
          }
          if (addReport) {
            addReport(
              `【${general.name}】对【${target.name}】造成 ${damage} 点物理伤害！`
            );
          }
        }

        // 若击杀目标，立即再次发动
        if (hasKilled) {
          if (addReport) {
            addReport(
              `【${general.name}】击杀目标，【擒龙破阵】再次发动！`
            );
          }
          general.skillEffects.hasExtraAttack = true;
        }

        return { triggered: true, extraAttack: hasKilled };
      } else {
        if (addReport) {
          addReport(`【${general.name}】的【擒龙破阵】未触发！`);
        }
        return { triggered: false };
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

export const fetchHeRuoBiFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
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
