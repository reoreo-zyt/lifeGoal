import type { Skill, General, GeneralRarity } from "./types";

const WEI_SHI_KANG_QUOTES = {
  skill: ["宽以御民，静以安邦。", "居官守心，以德化人。"],
  death: ["立身清正，一生简静，足矣。"],
} as const;

const WEI_SHI_KANG_BASE = {
  id: 71,
  name: "韦世康",
  rarity: "common" as GeneralRarity,
  attack: 41,
  attackGrowth: 0.72,
  defense: 60,
  defenseGrowth: 1.12,
  strategy: 85,
  strategyGrowth: 2.48,
  speed: 25,
  speedGrowth: 0.66,
  attackRange: 3,
  siege: 10,
  siegeGrowth: 0.48,
  level: 5,
  command: 82,
  commandGrowth: 1.95,
  leadership: 3.0,
  isDead: false,
  dynasty: "隋",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/assets/ui_frame.png",
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

// 主动 33%：单体 100% 策略伤害 + 为兵力最低友军恢复 85% 兵力
export const createWeiShiKangSkill = (): Skill => ({
  id: "shende-anzhong",
  name: "慎德安众",
  type: "active",
  description: "主动，发动概率 33%，攻击范围 3：对敌军单体造成 100% 策略伤害；为我军兵力最低者恢复兵力，恢复率 85%。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, targets, allies } = context;

    if (type === "activeSkill" && event === "trigger") {
      const chance = 0.33;
      if (addReport) addReport(`【${general.name}】尝试发动【慎德安众】（发动概率：33%）`);
      if (Math.random() >= chance) {
        if (addReport) addReport(`【${general.name}】的【慎德安众】未触发！`);
        return { triggered: false };
      }
      if (addReport) addReport(`【${general.name}】成功发动【慎德安众】！`);

      // 对敌军单体造成 100% 策略伤害
      if (targets?.length > 0) {
        const target = targets[0];
        const damage = Math.max(0, Math.floor(general.strategy - target.strategy / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) target.isDead = true;
        if (addReport) addReport(`【${general.name}】对【${target.name}】造成${damage}点策略伤害！`);
      }

      // 为兵力最低友军恢复兵力
      if (allies?.length > 0) {
        const alive = allies.filter((a: General) => !a.isDead);
        if (alive.length > 0) {
          const ally = alive.reduce((min: General, cur: General) =>
            cur.troops < min.troops ? cur : min,
          );
          const recover = Math.floor(general.strategy * 0.85);
          ally.troops = Math.min(ally.maxTroops, ally.troops + recover);
          if (addReport) addReport(`【${general.name}】安抚【${ally.name}】，恢复${recover}点兵力！`);
        }
      }

      return { triggered: true };
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
    if (!response.ok) throw new Error("获取人物信息失败");
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
    console.error("从数据库获取韦世康信息失败:", error);
    return createWeiShiKang();
  }
};