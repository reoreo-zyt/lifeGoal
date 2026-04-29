import type { Skill, General, GeneralRarity } from "./types";

const LIU_SHU_QUOTES = {
  skill: [
    "护驾护国，忠义两全！",
    "身为驸马，理应为国效力！",
    "守土有责，绝不退缩！"
  ],
  death: ["为国捐躯，死得其所..."]
} as const;

const LIU_SHU_BASE = {
  id: 77,
  name: "柳述",
  rarity: "uncommon" as GeneralRarity,
  attack: 60,
  attackGrowth: 1.92,
  defense: 65,
  defenseGrowth: 2.08,
  strategy: 58,
  strategyGrowth: 1.78,
  speed: 52,
  speedGrowth: 1.62,
  attackRange: 2,
  siege: 48,
  siegeGrowth: 1.48,
  level: 4,
  command: 60,
  commandGrowth: 1.92,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/liu_shu.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  shield: 0,
  shieldSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 柳述自带战法【隋室驸马】
export const createLiuShuSkill = (): Skill => ({
  id: "sui-shi-fu-ma",
  name: "隋室驸马",
  type: "active",
  distance: 3,
  probability: 0.48,
  description: "主动：使我方单体获得护盾（相当于自身防御80%），持续2回合，距离3，概率48%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    // 主动战法触发
    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【隋室驸马】！`);
      }
      if (targets && targets.length > 0) {
        const target = targets[0];
        const shieldAmount = Math.floor(general.defense * 0.80);
        if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        target.skillEffects.shield = shieldAmount;
        target.skillEffects.shieldSource = `【${general.name}】的【隋室驸马】`;
        target.skillEffects.shieldDuration = 2;
        if (addReport) {
          addReport(`【${target.name}】获得${shieldAmount}点护盾，持续2回合！`);
        }
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createLiuShu = (): General => {
  const troops = calculateTroops(LIU_SHU_BASE.command);
  return {
    ...LIU_SHU_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiuShuSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LIU_SHU_QUOTES,
  };
};

export const fetchLiuShuFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/77`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LIU_SHU_BASE.command);
    return {
      ...LIU_SHU_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiuShuSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LIU_SHU_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取柳述信息失败:", error);
    return createLiuShu();
  }
};