import type { Skill, General, GeneralRarity } from "./types";

const SHANG_GUAN_YI_QUOTES = {
  skill: ["辞锋可折冲，文笔亦安邦。", "文章经国，亦可定策。"],
  death: ["孤忠难申，徒留清名。"],
} as const;

const SHANG_GUAN_YI_BASE = {
  id: 707,
  name: "上官仪",
  rarity: "common" as GeneralRarity,
  attack: 42,
  attackGrowth: 0.66,
  defense: 52,
  defenseGrowth: 0.94,
  strategy: 97,
  strategyGrowth: 2.9,
  speed: 48,
  speedGrowth: 0.92,
  attackRange: 3,
  siege: 8,
  siegeGrowth: 0.38,
  level: 5,
  command: 88,
  commandGrowth: 2.06,
  leadership: 3.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/shang_guan_yi.webp",
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
  damageOutputReduction: 0,
  damageOutputReductionDuration: 0,
  damageOutputReductionSource: "",
  skillTriggerReduction: 0,
  skillTriggerReductionDuration: 0,
  skillTriggerReductionSource: "",
  defenseReduction: 0,
  defenseReductionDuration: 0,
  defenseReductionSource: "",
  cannotNormalAttack: false,
  cannotNormalAttackDuration: 0,
  cannotNormalAttackSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 指挥：每回合开始时，为我军兵力最低单体恢复兵力（恢复率 85%）
export const createShangGuanYiSkill = (): Skill => ({
  id: "qici-caizheng",
  name: "绮辞裁政",
  type: "command",
  description: "指挥：每回合开始时，为我军兵力最低单体恢复兵力，恢复率 85%。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, allies, addReport } = context;

    if (type === "command" && event === "turnStart" && allies?.length > 0) {
      const aliveAllies = allies.filter((a: General) => !a.isDead);
      if (aliveAllies.length === 0) return { triggered: false };
      const ally = aliveAllies.reduce((min: General, cur: General) =>
        cur.troops < min.troops ? cur : min,
      );
      const recover = Math.floor(general.strategy * 0.85);
      ally.troops = Math.min(ally.maxTroops, ally.troops + recover);
      if (addReport) addReport(`【${general.name}】施展【绮辞裁政】，为【${ally.name}】恢复${recover}点兵力！`);
      return { triggered: true };
    }
    return null;
  },
});

export const createShangGuanYi = (): General => {
  const troops = calculateTroops(SHANG_GUAN_YI_BASE.command);
  return {
    ...SHANG_GUAN_YI_BASE,
    troops,
    maxTroops: troops,
    skills: [createShangGuanYiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: SHANG_GUAN_YI_QUOTES,
  };
};

export const fetchShangGuanYiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/707`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(SHANG_GUAN_YI_BASE.command);
    return {
      ...SHANG_GUAN_YI_BASE,
      id: characterData.id ?? SHANG_GUAN_YI_BASE.id,
      name: characterData.name ?? SHANG_GUAN_YI_BASE.name,
      dynasty: characterData.dynasty ?? SHANG_GUAN_YI_BASE.dynasty,
      gender: characterData.gender ?? SHANG_GUAN_YI_BASE.gender,
      avatar: characterData.avatar || SHANG_GUAN_YI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createShangGuanYiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: SHANG_GUAN_YI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取上官仪信息失败:", error);
    return createShangGuanYi();
  }
};