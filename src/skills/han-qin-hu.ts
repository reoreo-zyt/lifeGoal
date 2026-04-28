import type { Skill, General, GeneralRarity } from "./types";

const HAN_QIN_HU_QUOTES = {
  skill: [
    "胡服骑射，天下无双！",
    "匈奴未灭，何以家为！",
    "铁骑纵横，扫荡胡尘！"
  ],
  death: ["马蹄所至，尽为汉土..."]
} as const;

const HAN_QIN_HU_BASE = {
  id: 12,
  name: "韩信虎",
  rarity: "rare" as GeneralRarity,
  attack: 88,
  attackGrowth: 2.40,
  defense: 82,
  defenseGrowth: 2.00,
  strategy: 60,
  strategyGrowth: 1.30,
  speed: 52,
  speedGrowth: 0.80,
  attackRange: 2,
  siege: 16,
  siegeGrowth: 0.80,
  level: 5,
  command: 90,
  commandGrowth: 2.30,
  leadership: 3.0,
  isDead: false,
  dynasty: "汉朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/han_qin_hu.jpg",
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
 * 【胡服骑射】被动
 * - 战斗开始时，永久获得 50% 反击率，自身受到攻击时反击
 * - HP < 60%：额外获得 18% 伤害增加（永久）
 * - 整体定位：稳定的反伤肉盾，高反击率压制敌人
 */
export const createHanQinHuSkill = (): Skill => ({
  id: "hufu-qishe",
  name: "胡服骑射",
  type: "passive",
  description:
    "被动：永久获得 50% 反击率，受到攻击时自动反击；HP 低于 60% 时，伤害增加 18%（永久）。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, attacker } = context;

    // 战斗开始 → 获得反击能力（标记在 skillEffects 中，后续被攻击时反击）
    if (type === "battleStart") {
      // 通过被动标志让战斗系统识别反击
      if (!general.skillEffects.attributeBonus) {
        general.skillEffects.attributeBonus = 50; // 复用字段存储反击率%
        general.skillEffects.attributeBonusSource = "hufu-qishe";
      }
      if (addReport) {
        addReport(`【${general.name}】发动【胡服骑射】，获得 50% 永久反击率！`);
      }
      return null;
    }

    // 受到攻击时 → 触发反击（复用 attacked 事件）
    if (type === "attacked" && event === "beforeDamage") {
      const counterChance = general.skillEffects.attributeBonus / 100;
      if (Math.random() < counterChance && attacker) {
        const counterDamage = Math.max(
          0,
          Math.floor(general.attack * 0.40 - attacker.defense / 4)
        );
        attacker.troops = Math.max(0, attacker.troops - counterDamage);
        if (addReport) {
          addReport(
            `【${general.name}】反击！对【${attacker.name}】造成 ${counterDamage} 点物理伤害！`
          );
        }
      }
      return null;
    }

    // 兵力低于 60% → 永久增伤 18%
    if (type === "turnStart") {
      const hpThreshold = 0.6;
      if (
        general.troops <= general.maxTroops * hpThreshold &&
        !general.skillEffects.damageIncrease
      ) {
        general.skillEffects.damageIncrease = 18;
        general.skillEffects.damageIncreaseSource = "hufu-qishe-lowhp";
        if (addReport) {
          addReport(
            `【${general.name}】HP 低于 60%，【胡服骑射】使伤害增加 18%（永久）！`
          );
        }
      }
      return null;
    }

    return null;
  },
});

export const createHanQinHu = (): General => {
  const troops = calculateTroops(HAN_QIN_HU_BASE.command);
  return {
    ...HAN_QIN_HU_BASE,
    troops,
    maxTroops: troops,
    skills: [createHanQinHuSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: HAN_QIN_HU_QUOTES,
  };
};

export const fetchHanQinHuFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/12`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(HAN_QIN_HU_BASE.command);
    return {
      ...HAN_QIN_HU_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createHanQinHuSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: HAN_QIN_HU_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取韩信虎信息失败:", error);
    return createHanQinHu();
  }
};
