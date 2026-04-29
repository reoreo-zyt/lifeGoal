import type { Skill, General, GeneralRarity } from "./types";

const WEI_SHI_KANG_QUOTES = {
  skill: ["宽以御民，静以安邦。", "居官守心，以德化人。"],
  death: ["立身清正，一生简静，足矣。"],
} as const;

const WEI_SHI_KANG_BASE = {
  id: 71,
  name: "尉士康",
  rarity: "common" as GeneralRarity,
  attack: 56,
  attackGrowth: 1.78,
  defense: 70,
  defenseGrowth: 2.48,
  strategy: 52,
  strategyGrowth: 1.52,
  speed: 44,
  speedGrowth: 1.28,
  attackRange: 2,
  siege: 55,
  siegeGrowth: 1.72,
  level: 4,
  command: 56,
  commandGrowth: 1.78,
  leadership: 1.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/wei_shi_kang.webp",
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
  counterRateSource: "",
  counterDamage: 0,
  counterDamageSource: "",
};

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 被动：物理伤害-25%，策略防御-15%，受伤时30%概率反击80%伤害
export const createWeiShiKangSkill = (): Skill => ({
  id: "tiebi-jianshou",
  name: "铁壁坚守",
  type: "passive",
  description: "被动：物理伤害-25%，策略防御-15%，受伤时30%概率反击80%伤害",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, attacker } = context;

    // 被动效果：物理减伤25%，策防-15%，反击30%/80%
    if (type === "battleStart" && event === "init") {
      general.skillEffects.physicalDamageReduction = 0.25;
      general.skillEffects.physicalDamageReductionSource = `【${general.name}】的【铁壁坚守】`;
      general.skillEffects.strategyDefenseReduction = 0.15;
      general.skillEffects.strategyDefenseReductionSource = `【${general.name}】的【铁壁坚守】`;
      general.skillEffects.counterRate = 0.30;
      general.skillEffects.counterRateSource = `【${general.name}】的【铁壁坚守】`;
      general.skillEffects.counterDamage = 0.80;
      general.skillEffects.counterDamageSource = `【${general.name}】的【铁壁坚守】`;
      if (addReport) {
        addReport(`【${general.name}】的【铁壁坚守】生效：物理伤害-25%，策略防御-15%，受伤时30%概率反击80%伤害！`);
      }
      return { triggered: true };
    }

    // 受伤时30%概率反击80%伤害
    if (type === "attacked" && event === "afterDamage") {
      if (Math.random() < 0.30 && attacker) {
        const counterDamage = Math.max(0, Math.floor(general.attack * 0.80 - attacker.defense / 2));
        attacker.troops = Math.max(0, attacker.troops - counterDamage);
        if (attacker.troops <= 0) attacker.isDead = true;
        if (addReport) {
          addReport(`【${general.name}】触发【铁壁坚守】反击！对【${attacker.name}】造成${counterDamage}点物理伤害！`);
        }
      }
    }

    return null;
  },
});

export const createWeiShiKang = (): General => {
  const troops = calculateTroops(WEI_SHI_KANG_BASE.command);
  return {
    ...WEI_SHI_KANG_BASE,
    troops,
    maxTroops: troops,
    skills: [createWeiShiKangSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: WEI_SHI_KANG_QUOTES,
  };
};

export const fetchWeiShiKangFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/71`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(WEI_SHI_KANG_BASE.command);
    return {
      ...WEI_SHI_KANG_BASE,
      id: characterData.id ?? WEI_SHI_KANG_BASE.id,
      name: characterData.name ?? WEI_SHI_KANG_BASE.name,
      dynasty: characterData.dynasty ?? WEI_SHI_KANG_BASE.dynasty,
      gender: characterData.gender ?? WEI_SHI_KANG_BASE.gender,
      avatar: characterData.avatar || WEI_SHI_KANG_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createWeiShiKangSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: WEI_SHI_KANG_QUOTES,
    };
  } catch (error) {
    console.error('从数据库获取尉士康信息失败:', error);
    return createWeiShiKang();
  }
};
