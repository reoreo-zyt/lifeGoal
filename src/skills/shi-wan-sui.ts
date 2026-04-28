import type { Skill, General, GeneralRarity } from "./types";

const SHI_WAN_SUI_QUOTES = {
  skill: ["将士们，随我冲杀！", "突厥小儿，吃我一刀！", "冲锋陷阵，所向披靡！"],
  death: ["素贼害我，文帝误我..."]
} as const;

const SHI_WAN_SUI_BASE = {
  id: 42,
  name: "史万岁",
  rarity: "rare" as GeneralRarity,
  attack: 98,
  attackGrowth: 2.75,
  defense: 76,
  defenseGrowth: 1.85,
  strategy: 48,
  strategyGrowth: 1.00,
  speed: 58,
  speedGrowth: 0.90,
  attackRange: 2,
  siege: 14,
  siegeGrowth: 0.70,
  level: 5,
  command: 89,
  commandGrowth: 2.20,
  leadership: 3.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/shi_wan_sui.jpg",
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
 * 【冲锋陷阵】主动
 * - 发动概率 42%，攻击范围 2
 * - 对敌方前排 2 人造成 135% 物理伤害；自身速度高于目标时，伤害额外增加 40%
 * - 整体定位：前排爆发物理输出手，利用高速度优势压制
 */
export const createShiWanSuiSkill = (): Skill => ({
  id: "chongfeng-xianzhen",
  name: "冲锋陷阵",
  type: "active",
  description:
    "主动，发动概率 42%，攻击范围 2：对敌方前排造成 135% 物理伤害；自身速度高于目标时，伤害额外增加 40%。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      const triggerChance = 0.42;
      if (addReport) {
        addReport(
          `【${general.name}】尝试发动【冲锋陷阵】（发动概率：${(triggerChance * 100).toFixed(0)}%）`
        );
      }

      if (Math.random() < triggerChance) {
        if (addReport) {
          addReport(`【${general.name}】成功发动【冲锋陷阵】！`);
        }

        if (targets && targets.length > 0) {
          const frontTargets = targets.slice(0, 2);
          frontTargets.forEach((target: General) => {
            let damage = Math.max(
              0,
              Math.floor(general.attack * 1.35 - target.defense / 2)
            );
            if (general.speed > target.speed) {
              const bonusDamage = Math.floor(damage * 0.40);
              damage += bonusDamage;
              if (addReport) {
                addReport(
                  `【${general.name}】速度压制【${target.name}】，伤害额外增加 40%！`
                );
              }
            }
            target.troops = Math.max(0, target.troops - damage);
            if (target.troops <= 0) target.isDead = true;
            if (addReport) {
              addReport(
                `【${general.name}】对【${target.name}】造成 ${damage} 点物理伤害！`
              );
            }
          });
        }

        return { triggered: true };
      } else {
        if (addReport) {
          addReport(`【${general.name}】的【冲锋陷阵】未触发！`);
        }
        return { triggered: false };
      }
    }

    return null;
  },
});

export const createShiWanSui = (): General => {
  const troops = calculateTroops(SHI_WAN_SUI_BASE.command);
  return {
    ...SHI_WAN_SUI_BASE,
    troops,
    maxTroops: troops,
    skills: [createShiWanSuiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: SHI_WAN_SUI_QUOTES,
  };
};

export const fetchShiWanSuiFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/42`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(SHI_WAN_SUI_BASE.command);
    return {
      ...SHI_WAN_SUI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createShiWanSuiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: SHI_WAN_SUI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取史万岁信息失败:", error);
    return createShiWanSui();
  }
};
