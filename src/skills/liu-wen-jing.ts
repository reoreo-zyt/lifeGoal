import type { Skill, General, GeneralRarity } from "./types";

const LIU_WEN_JING_QUOTES = {
  skill: ["太原谋主，运筹帷幄。", "与秦王共谋，定天下之策。", "决胜千里，智计为先。"],
  death: ["裴寂害我，死不瞑目..."],
} as const;

const LIU_WEN_JING_BASE = {
  id: 20,
  name: "刘文静",
  rarity: "uncommon" as GeneralRarity,
  attack: 58,
  attackGrowth: 1.88,
  defense: 52,
  defenseGrowth: 1.62,
  strategy: 70,
  strategyGrowth: 2.58,
  speed: 62,
  speedGrowth: 2.12,
  attackRange: 3,
  siege: 50,
  siegeGrowth: 1.48,
  level: 4,
  command: 58,
  commandGrowth: 1.88,
  leadership: 2.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/liu_wen_jing.jpg",
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

// 太原谋主 — 主动：使我方单体攻击+25%与速度+18%持续2回合，距离3，概率45%
export const createLiuWenJingSkill = (): Skill => ({
  id: "taiyuan-mouzhou",
  name: "太原谋主",
  type: "active",
  distance: 3,
  probability: 0.45,
  description: "主动：使我方单体攻击+25%与速度+18%持续2回合，距离3，概率45%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, allies } = context;

    if (type === "activeSkill" && event === "trigger") {
      if (allies && allies.length > 0) {
        const aliveAllies = allies.filter((a: General) => !a.isDead);
        if (aliveAllies.length > 0) {
          const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          target.skillEffects.attackBonus = (target.skillEffects.attackBonus || 0) + 25;
          target.skillEffects.attackBonusSource = `【${general.name}】的【太原谋主】`;
          target.skillEffects.attackBonusDuration = 2;
          target.skillEffects.speedBonus = (target.skillEffects.speedBonus || 0) + 18;
          target.skillEffects.speedBonusSource = `【${general.name}】的【太原谋主】`;
          target.skillEffects.speedBonusDuration = 2;
          if (addReport) {
            addReport(`【${general.name}】发动【太原谋主】，【${target.name}】攻击+25%、速度+18%，持续2回合！`);
          }
          return { triggered: true };
        }
      }
    }

    // 回合结束减少持续时间
    if (type === "turnEnd") {
      if (general.skillEffects?.attackBonusDuration) {
        general.skillEffects.attackBonusDuration -= 1;
        if (general.skillEffects.attackBonusDuration <= 0) {
          general.skillEffects.attackBonus = 0;
          general.skillEffects.attackBonusSource = "";
          general.skillEffects.attackBonusDuration = 0;
        }
      }
      if (general.skillEffects?.speedBonusDuration) {
        general.skillEffects.speedBonusDuration -= 1;
        if (general.skillEffects.speedBonusDuration <= 0) {
          general.skillEffects.speedBonus = 0;
          general.skillEffects.speedBonusSource = "";
          general.skillEffects.speedBonusDuration = 0;
        }
      }
    }

    return null;
  },
});

export const createLiuWenJing = (): General => {
  const troops = calculateTroops(LIU_WEN_JING_BASE.command);
  return {
    ...LIU_WEN_JING_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiuWenJingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LIU_WEN_JING_QUOTES,
    rarity: LIU_WEN_JING_BASE.rarity,
  };
};

export const fetchLiuWenJingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/20`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LIU_WEN_JING_BASE.command);
    return {
      ...LIU_WEN_JING_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiuWenJingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LIU_WEN_JING_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取刘文静信息失败:", error);
    return createLiuWenJing();
  }
};
