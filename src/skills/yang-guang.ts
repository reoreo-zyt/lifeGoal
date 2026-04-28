import type { Skill, General, GeneralRarity } from "./types";

const YANG_GUANG_QUOTES = {
  skill: [
    "朕之江山，万里疆域。",
    "征辽东，开运河，功在千秋。",
    "大业千秋，万古流芳。"
  ],
  death: ["大好头颅，谁当斫之..."]
} as const;

const YANG_GUANG_BASE = {
  id: 22,
  name: "杨广",
  rarity: "rare" as GeneralRarity,
  attack: 76,
  attackGrowth: 2.00,
  defense: 80,
  defenseGrowth: 2.00,
  strategy: 90,
  strategyGrowth: 2.50,
  speed: 35,
  speedGrowth: 0.60,
  attackRange: 3,
  siege: 15,
  siegeGrowth: 0.75,
  level: 5,
  command: 93,
  commandGrowth: 2.40,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/yang_guang.jpg",
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
  attackStackCount: 0,
  maxAttackStack: 3,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

/**
 * 【大业征伐】主动
 * - 发动概率 40%，攻击范围 3
 * - 对敌方全体造成 85% 谋略伤害；每次发动后自身攻击 +8%，可叠加 3 层
 * - 整体定位：高谋略输出的 AOE 输出手，叠加攻击提升后续伤害
 */
export const createYangGuangSkill = (): Skill => ({
  id: "daye-zhengfa",
  name: "大业征伐",
  type: "active",
  description:
    "主动，发动概率 40%，攻击范围 3：对敌方全体造成 85% 谋略伤害；每次发动后自身攻击 +8%，可叠加 3 层。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      const triggerChance = 0.40;
      if (addReport) {
        addReport(
          `【${general.name}】尝试发动【大业征伐】（发动概率：${(triggerChance * 100).toFixed(0)}%）`
        );
      }

      if (Math.random() < triggerChance) {
        if (addReport) {
          addReport(`【${general.name}】成功发动【大业征伐】！大业千秋，征伐四海！`);
        }

        // 对敌方全体造成 85% 谋略伤害
        if (targets && targets.length > 0) {
          targets.forEach((target: General) => {
            const damage = Math.max(
              0,
              Math.floor(general.strategy * 0.85 - target.strategy / 2)
            );
            target.troops = Math.max(0, target.troops - damage);
            if (target.troops <= 0) target.isDead = true;
            if (addReport) {
              addReport(
                `【${general.name}】的【大业征伐】对【${target.name}】造成 ${damage} 点谋略伤害！`
              );
            }
          });
        }

        // 自身攻击 +8%，可叠加 3 层
        if (general.skillEffects.attackStackCount < general.skillEffects.maxAttackStack) {
          general.skillEffects.attackStackCount += 1;
          const attackBonus = Math.floor(general.attack * 0.08);
          general.attack += attackBonus;
          if (addReport) {
            addReport(
              `【${general.name}】的【大业征伐】使自身攻击提升 8%（当前层数：${general.skillEffects.attackStackCount}/3）！`
            );
          }
        }

        return { triggered: true };
      } else {
        if (addReport) {
          addReport(`【${general.name}】的【大业征伐】未触发！`);
        }
        return { triggered: false };
      }
    }

    return null;
  },
});

export const createYangGuang = (): General => {
  const troops = calculateTroops(YANG_GUANG_BASE.command);
  return {
    ...YANG_GUANG_BASE,
    troops,
    maxTroops: troops,
    skills: [createYangGuangSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YANG_GUANG_QUOTES,
  };
};

export const fetchYangGuangFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/22`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YANG_GUANG_BASE.command);
    return {
      ...YANG_GUANG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYangGuangSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YANG_GUANG_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取杨广信息失败:", error);
    return createYangGuang();
  }
};
