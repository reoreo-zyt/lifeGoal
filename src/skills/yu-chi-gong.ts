import type { Skill, General, GeneralRarity } from "./types";

const YU_CHI_GONG_QUOTES = {
  skill: [
    "玄武门前，谁敢放肆！",
    "铁骑踏处，敌阵瓦解！",
    "某家在此，谁敢来战！"
  ],
  death: ["主公...末将不能再护卫左右了..."]
} as const;

const YU_CHI_GONG_BASE = {
  id: 4,
  name: "尉迟恭",
  rarity: "rare" as GeneralRarity,
  attack: 96,
  attackGrowth: 3.00,
  defense: 78,
  defenseGrowth: 2.10,
  strategy: 54,
  strategyGrowth: 1.20,
  speed: 58,
  speedGrowth: 0.95,
  attackRange: 1,
  siege: 12,
  siegeGrowth: 0.60,
  level: 5,
  command: 92,
  commandGrowth: 2.50,
  leadership: 4.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yu_chi_gong.jpg",
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
  counterRate: 0,
  strongCounterAvailable: false,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

/**
 * 【玄武铁骑】指挥
 * - 战斗开始时：永久获得 65% 反击率（受到攻击时自动反击，造成 60% 攻击伤害）
 * - HP >= 50% 时：每场战斗首次反击为强力反击（120% 攻击伤害）
 * - 整体定位：高反击率 + 有条件强力反击，压制近战敌人
 */
export const createYuChiGongSkill = (): Skill => ({
  id: "xuanwu-tieqi",
  name: "玄武铁骑",
  type: "command",
  description:
    "指挥：战斗开始时永久获得 65% 反击率（受攻击时反击，60% 攻击）；HP ≥ 50% 时，每场战斗首次反击造成 120% 攻击的强力反击。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, attacker } = context;

    // 战斗开始 → 获得反击能力
    if (type === "battleStart") {
      general.skillEffects.counterRate = 65;
      general.skillEffects.strongCounterAvailable = true;
      if (addReport) {
        addReport(`【${general.name}】发动【玄武铁骑】，获得 65% 永久反击率！`);
      }
      return null;
    }

    // 受到攻击时 → 反击
    if (type === "attacked" && event === "beforeDamage") {
      if (!attacker) return null;
      const counterChance = general.skillEffects.counterRate / 100;
      if (Math.random() < counterChance) {
        let damage = Math.max(
          0,
          Math.floor(general.attack * 0.60 - attacker.defense / 4)
        );
        if (
          general.skillEffects.strongCounterAvailable &&
          general.troops >= general.maxTroops * 0.5
        ) {
          damage = Math.max(0, Math.floor(general.attack * 1.20 - attacker.defense / 4));
          general.skillEffects.strongCounterAvailable = false;
          if (addReport) {
            addReport(
              `【${general.name}】HP ≥ 50%，【玄武铁骑】触发强力反击！对【${attacker.name}】造成 ${damage} 点物理伤害！`
            );
          }
        } else {
          if (addReport) {
            addReport(
              `【${general.name}】发动【玄武铁骑】反击，对【${attacker.name}】造成 ${damage} 点物理伤害！`
            );
          }
        }
        attacker.troops = Math.max(0, attacker.troops - damage);
        if (attacker.troops <= 0) attacker.isDead = true;
      }
      return null;
    }

    return null;
  },
});

export const createYuChiGong = (): General => {
  const troops = calculateTroops(YU_CHI_GONG_BASE.command);
  return {
    ...YU_CHI_GONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuChiGongSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_CHI_GONG_QUOTES,
  };
};

export const fetchYuChiGongFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/4`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YU_CHI_GONG_BASE.command);
    return {
      ...YU_CHI_GONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuChiGongSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_CHI_GONG_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取尉迟恭信息失败:", error);
    return createYuChiGong();
  }
};
