import type { Skill, General, GeneralRarity } from "./types";

const YUCHI_JIONG_QUOTES = {
  skill: ["临危授命，以安宗社。", "举义勤王，诛篡逆之贼。", "城存人存，城亡人亡！"],
  death: ["周室既倾，吾身殉国，无憾矣。"],
} as const;

const YUCHI_JIONG_BASE = {
  id: 633,
  name: "尉迟迥",
  rarity: "rare" as GeneralRarity,
  attack: 68,
  attackGrowth: 2.08,
  defense: 82,
  defenseGrowth: 2.65,
  strategy: 42,
  strategyGrowth: 1.02,
  speed: 38,
  speedGrowth: 1.08,
  attackRange: 2,
  siege: 62,
  siegeGrowth: 1.92,
  level: 4,
  command: 78,
  commandGrowth: 2.48,
  leadership: 2.5,
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
};

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 危壁霸临 — 指挥：战斗开始永久获得28%物理减伤；每回合结束兵力<70%时全属性+8%，最多4层
export const createYuchiJiongSkill = (): Skill => ({
  id: "weibi-baling",
  name: "危壁霸临",
  type: "command",
  description: "指挥：战斗开始永久获得28%物理减伤；每回合结束兵力<70%时全属性+8%，最多4层",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport } = context;

    // 战斗开始 → 永久减伤
    if (type === "battleStart" && event === "init") {
      general.skillEffects.damageReduction = 28;
      general.skillEffects.damageReductionSource = `【${general.name}】的【危壁霸临】`;
      if (addReport) addReport(`【${general.name}】发动【危壁霸临】，永久获得28%物理减伤！`);
      return { triggered: true };
    }

    // 回合结束 → 兵力<70%时叠属性
    if (type === "turnEnd") {
      const hpPct = general.troops / general.maxTroops;
      if (hpPct < 0.70 && general.skillEffects.attributeBonus < 4) {
        general.skillEffects.attributeBonus += 1;
        const stack = general.skillEffects.attributeBonus;
        // 全属性+8%（叠乘）
        general.attack = Math.floor(general.attack * 1.08);
        general.defense = Math.floor(general.defense * 1.08);
        general.strategy = Math.floor(general.strategy * 1.08);
        general.speed = Math.floor(general.speed * 1.08);
        if (addReport) {
          addReport(`【${general.name}】兵力<70%，【危壁霸临】叠层成功！当前层数：${stack}/4`);
        }
      }
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
    rarity: YUCHI_JIONG_BASE.rarity,
  };
};

export const fetchYuchiJiongFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
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
      rarity: YUCHI_JIONG_BASE.rarity,
    };
  } catch (error) {
    console.error("从数据库获取尉迟迥信息失败:", error);
    return createYuchiJiong();
  }
};
