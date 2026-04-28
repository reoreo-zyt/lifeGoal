import type { Skill, General, GeneralRarity } from "./types";

const DU_RU_HUI_QUOTES = {
  skill: ["断则必行，行之必果。", "谋定而后动，动则必胜。", "当机立断，不容迟疑。"],
  death: ["天不假年，壮志未酬..."],
} as const;

const DU_RU_HUI_BASE = {
  id: 28,
  name: "杜如晦",
  rarity: "rare" as GeneralRarity,
  attack: 54,
  attackGrowth: 0.90,
  defense: 68,
  defenseGrowth: 1.40,
  strategy: 96,
  strategyGrowth: 2.70,
  speed: 44,
  speedGrowth: 0.70,
  attackRange: 3,
  siege: 10,
  siegeGrowth: 0.50,
  level: 5,
  command: 86,
  commandGrowth: 2.10,
  leadership: 3.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/du_ru_hui.jpg",
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

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

/**
 * 【当机立断】主动
 * - 发动概率 50%，攻击范围 3
 * - 驱散敌方随机 2 人所有增益效果；驱散成功后对目标造成 95% 谋略伤害
 * - 整体定位：驱散 + 伤害，高收益但依赖对方有增益效果
 */
export const createDuRuHuiSkill = (): Skill => ({
  id: "dangji-liduan",
  name: "当机立断",
  type: "active",
  description:
    "主动，发动概率 50%，攻击范围 3：驱散敌方随机 2 人所有增益效果；驱散成功后对目标造成 95% 谋略伤害。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      const triggerChance = 0.50;
      if (addReport) {
        addReport(
          `【${general.name}】尝试发动【当机立断】（发动概率：${(triggerChance * 100).toFixed(0)}%）`
        );
      }

      if (Math.random() < triggerChance) {
        if (addReport) {
          addReport(`【${general.name}】成功发动【当机立断】！断则必行，行之必果！`);
        }

        if (targets && targets.length > 0) {
          const selectedTargets = targets.slice(0, 2);
          selectedTargets.forEach((target: General) => {
            let dispelled = false;

            if (target.skillEffects) {
              // 清除所有增益效果
              if (target.skillEffects.damageReduction > 0) {
                target.skillEffects.damageReduction = 0;
                target.skillEffects.damageReductionSource = "";
                dispelled = true;
              }
              if (target.skillEffects.attributeBonus > 0) {
                target.skillEffects.attributeBonus = 0;
                target.skillEffects.attributeBonusSource = "";
                dispelled = true;
              }
              if (target.skillEffects.damageIncrease > 0) {
                target.skillEffects.damageIncrease = 0;
                target.skillEffects.damageIncreaseSource = "";
                dispelled = true;
              }
            }

            if (dispelled) {
              if (addReport) {
                addReport(`【${general.name}】驱散【${target.name}】的增益效果！`);
              }
            }

            // 驱散成功与否均造成谋略伤害
            const damage = Math.max(
              0,
              Math.floor(general.strategy * 0.95 - target.strategy / 2)
            );
            target.troops = Math.max(0, target.troops - damage);
            if (target.troops <= 0) target.isDead = true;
            if (addReport) {
              addReport(
                `【${general.name}】对【${target.name}】造成 ${damage} 点谋略伤害！`
              );
            }
          });
        }

        return { triggered: true };
      } else {
        if (addReport) {
          addReport(`【${general.name}】的【当机立断】未触发！`);
        }
        return { triggered: false };
      }
    }

    return null;
  },
});

export const createDuRuHui = (): General => {
  const troops = calculateTroops(DU_RU_HUI_BASE.command);
  return {
    ...DU_RU_HUI_BASE,
    troops,
    maxTroops: troops,
    skills: [createDuRuHuiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: DU_RU_HUI_QUOTES,
  };
};

export const fetchDuRuHuiFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/28`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(DU_RU_HUI_BASE.command);
    return {
      ...DU_RU_HUI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createDuRuHuiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: DU_RU_HUI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取杜如晦信息失败:", error);
    return createDuRuHui();
  }
};
