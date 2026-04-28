import type { Skill, General, GeneralRarity } from "./types";

const YU_SHI_JI_QUOTES = {
  skill: ["机衡之任，某当其责。", "朝堂博弈，进退有度。", "察言观色，方能立于不败。"],
  death: ["伴君如伴虎，此言不虚..."]
} as const;

const YU_SHI_JI_BASE = {
  id: 562,
  name: "虞世基",
  rarity: "rare" as GeneralRarity,
  attack: 65,
  attackGrowth: 2.08,
  defense: 62,
  defenseGrowth: 1.98,
  strategy: 78,
  strategyGrowth: 2.78,
  speed: 68,
  speedGrowth: 2.18,
  attackRange: 3,
  siege: 55,
  siegeGrowth: 1.62,
  level: 4,
  command: 65,
  commandGrowth: 2.08,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yu_shi_ji.jpg",
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

export const createYuShiJiSkill = (): Skill => ({
  id: "ji-heng-zhi-ren",
  name: "机衡之任",
  type: "passive",
  description: "被动：回合开始时使友军+10%物防和策防；第5回合对敌军全体150%策略攻击",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, addReport, allies, enemies, currentRound } = context;

    // 回合开始时使友军+10%物防和策防
    if (type === "turnStart") {
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (ally.isDead) return;
          if (!ally.skillEffects) ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          ally.skillEffects.defenseBonus = (ally.skillEffects.defenseBonus || 0) + 10;
          ally.skillEffects.defenseBonusSource = `【${general.name}】的【机衡之任】`;
          if (addReport) {
            addReport(`【${ally.name}】受【机衡之任】物防和策防+10%！`);
          }
        });
      }
    }

    // 第5回合对敌军全体150%策略攻击
    if (type === "turnStart" && currentRound === 5) {
      if (enemies && enemies.length > 0) {
        if (addReport) {
          addReport(`【${general.name}】发动【机衡之任】，第5回合对敌军全体发起策略攻击！`);
        }
        enemies.forEach((enemy: General) => {
          if (enemy.isDead) return;
          const damage = Math.max(0, Math.floor(general.strategy * 1.50 - enemy.strategy / 2));
          enemy.troops = Math.max(0, enemy.troops - damage);
          if (enemy.troops <= 0) enemy.isDead = true;
          if (addReport) {
            addReport(`【${general.name}】对【${enemy.name}】造成${damage}点策略伤害！`);
          }
        });
      }
    }

    return null;
  },
});

export const createYuShiJi = (): General => {
  const troops = calculateTroops(YU_SHI_JI_BASE.command);
  return {
    ...YU_SHI_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuShiJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_SHI_JI_QUOTES,
  };
};

export const fetchYuShiJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/562`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YU_SHI_JI_BASE.command);
    return {
      ...YU_SHI_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuShiJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_SHI_JI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取虞世基信息失败:", error);
    return createYuShiJi();
  }
};
