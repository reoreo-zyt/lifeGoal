import type { Skill, General, GeneralRarity } from "./types";

const LU_YAN_SHI_QUOTES = {
  skill: ["整肃风纪，以正朝纲。", "敦礼明伦，修身匡世。", "清身守道，不以权势屈节。"],
  death: ["正道难行，清节犹在，此生无愧名教。"],
} as const;

const LU_YAN_SHI_BASE = {
  id: 588,
  name: "陆彦师",
  rarity: "common" as GeneralRarity,
  attack: 39,
  attackGrowth: 0.70,
  defense: 53,
  defenseGrowth: 1.00,
  strategy: 88,
  strategyGrowth: 2.55,
  speed: 22,
  speedGrowth: 0.65,
  attackRange: 3,
  siege: 9,
  siegeGrowth: 0.45,
  level: 5,
  command: 83,
  commandGrowth: 2.00,
  leadership: 2.5,
  isDead: false,
  dynasty: "北周",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/lu_yan_shi.jpg",
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
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 主动 32%：对 2 名敌军单体各造成 100% 策略伤害（群体 AOE，简单实用）
export const createLuYanShiSkill = (): Skill => ({
  id: "qinggui-shouzheng",
  name: "清规守正",
  type: "active",
  description: "主动，发动概率 32%，攻击范围 3：对 2 名敌军单体各造成 100% 策略伤害。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      const chance = 0.32;
      if (addReport) addReport(`【${general.name}】尝试发动【清规守正】（发动概率：32%）`);
      if (Math.random() >= chance) {
        if (addReport) addReport(`【${general.name}】的【清规守正】未触发！`);
        return { triggered: false };
      }
      if (addReport) addReport(`【${general.name}】成功发动【清规守正】！`);

      // 对最多 2 名敌军造成 100% 策略伤害
      if (targets && targets.length > 0) {
        const count = Math.min(targets.length, 2);
        for (let i = 0; i < count; i++) {
          const target = targets[i];
          const damage = Math.max(0, Math.floor(general.strategy * 1.0 - target.strategy / 2));
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) target.isDead = true;
          if (addReport) addReport(`【${general.name}】对【${target.name}】造成${damage}点策略伤害！`);
        }
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createLuYanShi = (): General => {
  const troops = calculateTroops(LU_YAN_SHI_BASE.command);
  return {
    ...LU_YAN_SHI_BASE,
    troops,
    maxTroops: troops,
    skills: [createLuYanShiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LU_YAN_SHI_QUOTES,
  };
};

export const fetchLuYanShiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/70`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LU_YAN_SHI_BASE.command);
    return {
      ...LU_YAN_SHI_BASE,
      id: LU_YAN_SHI_BASE.id,
      name: LU_YAN_SHI_BASE.name,
      dynasty: LU_YAN_SHI_BASE.dynasty,
      gender: LU_YAN_SHI_BASE.gender,
      avatar: characterData.avatar || LU_YAN_SHI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createLuYanShiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LU_YAN_SHI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取陆彦师信息失败:", error);
    return createLuYanShi();
  }
};