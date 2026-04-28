import type { Skill, General } from "./types";

const SHANG_GUAN_YI_QUOTES = {
  skill: ["辞锋可折冲，文笔亦安邦。", "文章经国，亦可定策。"],
  death: ["孤忠难申，徒留清名。"]
} as const;

const SHANG_GUAN_YI_BASE = {
  id: 707,
  name: "上官仪",
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
  passiveDamageTagValue: 0.15,
  passiveDamageTagLabel: "文裁",
  passiveDamageTagSource: "【绮辞裁政】每次伤害前增伤15%",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createShangGuanYiSkill = (): Skill => {
  return {
    id: "qici-caizheng",
    name: "绮辞裁政",
    type: "passive",
    description:
      "被动：每次造成伤害前，自身增伤 15%；首次兵力低于 50% 时，额外获得 18% 减伤并持续全场。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      const { type, event, currentTroops, maxTroops, addReport } = context;

      if (type === "attack" && event === "beforeAttack") {
        return { damageIncrease: 0.15 };
      }

      if (type === "attacked" && event === "beforeDamage") {
        const ratio = maxTroops > 0 ? currentTroops / maxTroops : 1;
        if (ratio < 0.5 && general.skillEffects.damageReduction < 0.18) {
          general.skillEffects.damageReduction = 0.18;
          general.skillEffects.damageReductionSource = `【${general.name}】的【绮辞裁政】`;
          if (addReport) addReport(`【${general.name}】文心自守，触发【绮辞裁政】，获得18%减伤！`);
        }
        if (general.skillEffects.damageReduction > 0) {
          return { damageReduction: general.skillEffects.damageReduction };
        }
      }

      return null;
    },
  };
};

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

export const fetchShangGuanYiFromDatabase = async (
  API_BASE_URL: string,
): Promise<General | null> => {
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
      quotes: {
        skill: ["辞锋可折冲，文笔亦安邦。", "文章经国，亦可定策。"],
        death: ["孤忠难申，徒留清名。"],
      },
    };
  } catch (error) {
    console.error("从数据库获取上官仪信息失败:", error);
    return createShangGuanYi();
  }
};
