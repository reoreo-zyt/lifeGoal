import type { Skill, General } from "./types";

const WEI_YI_QUOTES = {
  skill: ["边城既定，民心自安。", "戎马为国，亦当抚众。"],
  death: ["边烽未息，吾已至此。"],
} as const;

const WEI_YI_BASE = {
  id: 73,
  name: "韦艺",
  attack: 89,
  attackGrowth: 2.32,
  defense: 83,
  defenseGrowth: 2.06,
  strategy: 62,
  strategyGrowth: 1.4,
  speed: 61,
  speedGrowth: 1.2,
  attackRange: 2,
  siege: 14,
  siegeGrowth: 0.72,
  level: 5,
  command: 91,
  commandGrowth: 2.28,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/wei_yi.webp",
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

export const createWeiYiSkill = (): Skill => {
  return {
    id: "zhenbian-fumin",
    name: "镇边抚民",
    type: "active",
    description:
      "主动，发动概率 34%，攻击范围 2：对敌军单体造成 132% 物理伤害，并降低其防御 10%，持续 2 回合。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      const { type, event, addReport, targets } = context;
      if (type === "activeSkill" && event === "trigger") {
        const chance = 0.34;
        if (addReport) addReport(`【${general.name}】尝试发动【镇边抚民】（发动概率：34%）`);
        if (Math.random() >= chance) {
          if (addReport) addReport(`【${general.name}】的【镇边抚民】未触发！`);
          return { triggered: false };
        }
        if (targets?.length > 0) {
          const target = targets[0];
          const damage = Math.max(
            0,
            Math.floor(general.attack * 1.32 - target.defense / 2),
          );
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) target.isDead = true;
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          target.skillEffects.defenseReduction = 0.1;
          target.skillEffects.defenseReductionDuration = 2;
          target.skillEffects.defenseReductionSource = `【${general.name}】的【镇边抚民】`;
          if (addReport) {
            addReport(`【${general.name}】重击【${target.name}】造成${damage}点物理伤害，并使其降防10%，持续2回合！`);
          }
        }
        return { triggered: true };
      }
      return null;
    },
  };
};

export const createWeiYi = (): General => {
  const troops = calculateTroops(WEI_YI_BASE.command);
  return {
    ...WEI_YI_BASE,
    troops,
    maxTroops: troops,
    skills: [createWeiYiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: WEI_YI_QUOTES,
  };
};

export const fetchWeiYiFromDatabase = async (
  API_BASE_URL: string,
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/73`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(WEI_YI_BASE.command);
    return {
      ...WEI_YI_BASE,
      id: characterData.id ?? WEI_YI_BASE.id,
      name: characterData.name ?? WEI_YI_BASE.name,
      dynasty: characterData.dynasty ?? WEI_YI_BASE.dynasty,
      gender: characterData.gender ?? WEI_YI_BASE.gender,
      avatar: characterData.avatar || WEI_YI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createWeiYiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: WEI_YI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取韦艺信息失败:", error);
    return createWeiYi();
  }
};
