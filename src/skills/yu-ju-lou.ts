import type { Skill, General, GeneralRarity } from "./types";

const YU_JU_LOU_QUOTES = {
  skill: ["獠刀一出，人马俱碎。", "刀光闪过，生死已定。", "百战余生，刀下亡魂无数。"],
  death: ["这一刀……终究慢了一瞬..."],
} as const;

const YU_JU_LOU_BASE = {
  id: 34,
  name: "鱼俱罗",
  rarity: "rare",
  attack: 82,
  attackGrowth: 2.58,
  defense: 85,
  defenseGrowth: 2.62,
  strategy: 58,
  strategyGrowth: 1.52,
  speed: 82,
  speedGrowth: 2.55,
  attackRange: 4,
  siege: 78,
  siegeGrowth: 2.42,
  level: 4,
  command: 82,
  commandGrowth: 2.58,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yu_ju_lou.jpg",
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

// 鱼俱罗的自带战法【獠刀复起】
export const createYuJuLouSkill = (): Skill => {
  return {
    id: "liao-dao-fu-qi",
    name: "獠刀复起",
    type: "active",
    distance: 4,
    probability: 0.42,
    description: "主动：对前排造成140%物理伤害，距离4，概率42%，目标防御-18%持续2回合",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, enemies } = context;

      // 主动战法：对前排造成140%物理伤害，使目标防御-18%持续2回合
      if (type === "activeSkill" && event === "trigger") {
        if (enemies && enemies.length > 0) {
          const aliveEnemies = enemies.filter((e: General): boolean => !e.isDead);
          if (aliveEnemies.length > 0) {
            // 前排目标：大营或前锋
            const frontRowEnemies = aliveEnemies.slice(0, 2);
            if (addReport) {
              const names = frontRowEnemies.map((e: General) => `【${e.name}】`).join("和");
              addReport(`【${general.name}】发动【獠刀复起】，挥刀横斩${names}！`);
            }
            // 施加防御降低效果
            frontRowEnemies.forEach((target: General) => {
              if (!target.skillEffects) {
                target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
              }
              target.skillEffects.defenseReduction = 0.18;
              target.skillEffects.defenseReductionSource = `【${general.name}】的【獠刀复起】`;
              target.skillEffects.defenseReductionDuration = 2;
              if (addReport) {
                addReport(`【${target.name}】防御降低18%，持续2回合！`);
              }
            });
            return {
              multiTarget: frontRowEnemies,
              damageMultiplier: 1.40,
              damageType: "physical",
            };
          }
        }
      }

      // 被动：若技能效果已过期，清除防御降低标记
      if (type === "turnEnd" && general.skillEffects?.defenseReductionDuration) {
        general.skillEffects.defenseReductionDuration -= 1;
        if (general.skillEffects.defenseReductionDuration <= 0) {
          general.skillEffects.defenseReduction = 0;
          general.skillEffects.defenseReductionDuration = 0;
          general.skillEffects.defenseReductionSource = "";
        }
      }

      return null;
    },
  };
};

export const createYuJuLou = (): General => {
  const troops = calculateTroops(YU_JU_LOU_BASE.command);
  return {
    ...YU_JU_LOU_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuJuLouSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_JU_LOU_QUOTES,
    rarity: YU_JU_LOU_BASE.rarity as GeneralRarity,
  };
};

export const fetchYuJuLouFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/34`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(YU_JU_LOU_BASE.command);
    return {
      ...YU_JU_LOU_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuJuLouSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_JU_LOU_QUOTES,
      rarity: YU_JU_LOU_BASE.rarity as GeneralRarity,
    };
  } catch (error) {
    console.error('从数据库获取鱼俱罗信息失败:', error);
    return createYuJuLou();
  }
};
