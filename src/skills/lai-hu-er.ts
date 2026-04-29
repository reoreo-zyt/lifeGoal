import type { Skill, General, GeneralRarity } from "./types";

const LAI_HU_ER_QUOTES = {
  skill: [
    "平贼先锋，万夫不当！",
    "横刀立马，斩敌立功！",
    "战场杀敌，马到成功！"
  ],
  death: ["为国捐躯，死得其所..."]
} as const;

const LAI_HU_ER_BASE = {
  id: 535,
  name: "来护儿",
  rarity: "uncommon" as GeneralRarity,
  attack: 68,
  attackGrowth: 2.18,
  defense: 62,
  defenseGrowth: 1.98,
  strategy: 45,
  strategyGrowth: 1.28,
  speed: 72,
  speedGrowth: 2.28,
  attackRange: 2,
  siege: 60,
  siegeGrowth: 1.88,
  level: 4,
  command: 68,
  commandGrowth: 2.18,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/lai_hu_er.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  healingFromDamagePercent: 0,
  healingFromDamageSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 来护儿自带战法【平贼先锋】
export const createLaiHuErSkill = (): Skill => ({
  id: "pingzei-xianfeng",
  name: "平贼先锋",
  type: "active",
  distance: 3,
  probability: 0.42,
  description: "主动：对单体造成160%物理伤害，距离3，概率42%，伤害的30%转化为治疗",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    // 主动战法触发
    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【平贼先锋】！`);
      }
      if (targets && targets.length > 0) {
        const target = targets[0];
        const damage = Math.max(0, Math.floor(general.attack * 1.60 - target.defense / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！`);
        }
        // 伤害的30%转化为治疗
        const healAmount = Math.floor(damage * 0.30);
        const actualHeal = Math.min(healAmount, general.maxTroops - general.troops);
        if (actualHeal > 0) {
          general.troops = Math.min(general.maxTroops, general.troops + actualHeal);
          if (addReport) {
            addReport(`【${general.name}】的【平贼先锋】吸取${actualHeal}点生命！`);
          }
        }
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createLaiHuEr = (): General => {
  const troops = calculateTroops(LAI_HU_ER_BASE.command);
  return {
    ...LAI_HU_ER_BASE,
    troops,
    maxTroops: troops,
    skills: [createLaiHuErSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LAI_HU_ER_QUOTES,
  };
};

export const fetchLaiHuErFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/535`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LAI_HU_ER_BASE.command);
    return {
      ...LAI_HU_ER_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLaiHuErSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LAI_HU_ER_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取来护儿信息失败:", error);
    return createLaiHuEr();
  }
};