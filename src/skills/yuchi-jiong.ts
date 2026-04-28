import type { Skill, General, GeneralRarity } from "./types";

const YUCHI_JIONG_QUOTES = {
  skill: [
    "临危授命，以安宗社。",
    "举义勤王，诛篡逆之贼。",
    "城存人存，城亡人亡！"
  ],
  death: ["周室既倾，吾身殉国，无憾矣。"]
} as const;

const YUCHI_JIONG_BASE = {
  id: 633,
  name: "尉迟迥",
  rarity: "rare" as GeneralRarity,
  attack: 96,
  attackGrowth: 2.72,
  defense: 102,
  defenseGrowth: 2.35,
  strategy: 42,
  strategyGrowth: 0.7,
  speed: 38,
  speedGrowth: 0.52,
  attackRange: 2,
  siege: 18,
  siegeGrowth: 0.85,
  level: 5,
  command: 92,
  commandGrowth: 2.2,
  leadership: 3.5,
  isDead: false,
  dynasty: "北周",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuchi_jiong.jpg",
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
  attrStackCount: 0,
  maxAttrStack: 4,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

/**
 * 【危壁霸临】指挥
 * - 战斗开始时：永久获得 28% 物理伤害减伤
 * - 回合结束时：若自身兵力 < 70%，全属性 +8%，最多叠加 4 层
 * - HP < 50%：伤害增加 22%（永久）
 * - 首次兵力跌破 30%：净化自身所有负面效果并回复 15% 兵力（单局一次）
 * - 整体定位：高防御型前排，兵力越低越强
 */
export const createYuchiJiongSkill = (): Skill => ({
  id: "weibi-baling",
  name: "危壁霸临",
  type: "command",
  description:
    "指挥：战斗开始时永久获得 28% 物理伤害减伤；回合结束兵力 < 70% 时全属性 +8%（最多 4 层）；HP < 50% 伤害永久 +22%；首次兵力跌破 30% 净化并回复 15% 兵力（单局一次）。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, currentTroops, maxTroops, addReport } = context;

    // 战斗开始 → 获得永久减伤
    if (type === "battleStart") {
      general.skillEffects.damageReduction = 28;
      general.skillEffects.damageReductionSource = "weibi-baling";
      if (addReport) {
        addReport(`【${general.name}】发动【危壁霸临】，永久获得 28% 物理伤害减伤！`);
      }
      return null;
    }

    // 受到攻击 → 应用减伤
    if (type === "attacked" && event === "beforeDamage") {
      return { damageReduction: general.skillEffects.damageReduction / 100 };
    }

    // 回合结束 → 兵力 < 70% 则全属性 +8%（最多 4 层）
    if (type === "turnEnd") {
      const hpPct = (currentTroops || general.troops) / (maxTroops || general.maxTroops);
      if (hpPct < 0.7 && general.skillEffects.attrStackCount < general.skillEffects.maxAttrStack) {
        general.skillEffects.attrStackCount += 1;
        const pct = general.skillEffects.attrStackCount * 8;
        general.attack = Math.floor(general.attack * 1.08);
        general.defense = Math.floor(general.defense * 1.08);
        general.strategy = Math.floor(general.strategy * 1.08);
        general.speed = Math.floor(general.speed * 1.08);
        if (addReport) {
          addReport(
            `【${general.name}】兵力 < 70%，【危壁霸临】使全属性提升 8%（当前层数：${general.skillEffects.attrStackCount}/4，累计 +${pct}%）！`
          );
        }
      }
      return null;
    }

    // 回合开始 → 检查 HP < 50% 增伤
    if (type === "turnStart") {
      const hpPct = (currentTroops || general.troops) / (maxTroops || general.maxTroops);
      if (hpPct < 0.5 && !general.skillEffects.damageIncrease) {
        general.skillEffects.damageIncrease = 22;
        general.skillEffects.damageIncreaseSource = "weibi-baling-lowhp";
        if (addReport) {
          addReport(`【${general.name}】HP < 50%，【危壁霸临】使伤害增加 22%（永久）！`);
        }
      }
      // 首次兵力跌破 30% → 净化 + 回复
      if (
        !general.skillEffects.hasTriggeredRecovery &&
        currentTroops <= (maxTroops * 30) / 100
      ) {
        general.skillEffects.hasTriggeredRecovery = true;
        // 净化负面效果
        general.skillEffects.damageReduction = 0;
        general.skillEffects.damageReductionSource = "";
        general.skillEffects.attributeBonus = 0;
        general.skillEffects.attributeBonusSource = "";
        general.skillEffects.damageIncrease = 0;
        general.skillEffects.damageIncreaseSource = "";
        general.skillEffects.attrStackCount = 0;
        // 回复 15% 兵力
        const recovery = Math.floor(maxTroops * 0.15);
        general.troops = Math.min(maxTroops, general.troops + recovery);
        if (addReport) {
          addReport(`【${general.name}】首次跌破 30%，【危壁霸临】净化所有负面效果并回复 ${recovery} 点兵力！`);
        }
      }
      return null;
    }

    return null;
  },
});

export const createYuchiJiong = (): General => {
  const troops = calculateTroops(YUCHI_JIONG_BASE.command);
  return {
    ...YUCHI_JIONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuchiJiongSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YUCHI_JIONG_QUOTES,
  };
};

export const fetchYuchiJiongFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/633`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YUCHI_JIONG_BASE.command);
    return {
      ...YUCHI_JIONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuchiJiongSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YUCHI_JIONG_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取尉迟迥信息失败:", error);
    return createYuchiJiong();
  }
};
