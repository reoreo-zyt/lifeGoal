import type { Skill, General, GeneralRarity } from "./types";

const FENG_CI_MING_QUOTES = {
  skill: ["守节不移，虽死犹荣。", "臣心所系，唯在社稷。"],
  death: ["义尽于此，无愧天下。"],
} as const;

const FENG_CI_MING_BASE = {
  id: 577,
  name: "冯慈明",
  rarity: "common" as GeneralRarity,
  attack: 41,
  attackGrowth: 0.71,
  defense: 48,
  defenseGrowth: 0.93,
  strategy: 95,
  strategyGrowth: 2.76,
  speed: 52,
  speedGrowth: 1.15,
  attackRange: 3,
  siege: 9,
  siegeGrowth: 0.45,
  level: 5,
  command: 87,
  commandGrowth: 1.94,
  leadership: 3.0,
  isDead: false,
  dynasty: "南朝宋",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/feng_ci_ming.jpg",
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

// 主动 35%：单体 120% 策略伤害 + 使目标陷入「怯战」（无法普攻）2 回合
export const createFengCiMingSkill = (): Skill => ({
  id: "sijie-buer",
  name: "死节不贰",
  type: "active",
  description:
    "主动，发动概率 35%，攻击范围 3：对敌军单体造成 120% 策略伤害，并使其陷入「怯战」（无法普攻），持续 2 回合。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      const chance = 0.35;
      if (addReport) addReport(`【${general.name}】尝试发动【死节不贰】（发动概率：35%）`);
      if (Math.random() >= chance) {
        if (addReport) addReport(`【${general.name}】的【死节不贰】未触发！`);
        return { triggered: false };
      }
      if (addReport) addReport(`【${general.name}】成功发动【死节不贰】！`);

      if (targets?.length > 0) {
        const target = targets[0];
        const damage = Math.max(0, Math.floor(general.strategy * 1.2 - target.strategy / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) target.isDead = true;

        if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        target.skillEffects.cannotNormalAttack = true;
        target.skillEffects.cannotNormalAttackDuration = 2;
        target.skillEffects.cannotNormalAttackSource = `【${general.name}】的【死节不贰】`;

        if (addReport) addReport(`【${general.name}】对【${target.name}】造成${damage}点策略伤害，并使其陷入「怯战」2回合！`);
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createFengCiMing = (): General => {
  const troops = calculateTroops(FENG_CI_MING_BASE.command);
  return {
    ...FENG_CI_MING_BASE,
    troops,
    maxTroops: troops,
    skills: [createFengCiMingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: FENG_CI_MING_QUOTES,
  };
};

export const fetchFengCiMingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/577`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(FENG_CI_MING_BASE.command);
    return {
      ...FENG_CI_MING_BASE,
      id: characterData.id ?? FENG_CI_MING_BASE.id,
      name: characterData.name ?? FENG_CI_MING_BASE.name,
      dynasty: characterData.dynasty ?? FENG_CI_MING_BASE.dynasty,
      gender: characterData.gender ?? FENG_CI_MING_BASE.gender,
      avatar: characterData.avatar || FENG_CI_MING_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createFengCiMingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: FENG_CI_MING_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取冯慈明信息失败:", error);
    return createFengCiMing();
  }
};