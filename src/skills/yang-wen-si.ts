import type { Skill, General } from "./types";

const YANG_WEN_SI_BASE = {
  id: 66,
  name: "杨文思",
  attack: 46,
  attackGrowth: 0.78,
  defense: 61,
  defenseGrowth: 1.16,
  strategy: 84,
  strategyGrowth: 2.34,
  speed: 40,
  speedGrowth: 0.78,
  attackRange: 2,
  siege: 11,
  siegeGrowth: 0.54,
  level: 5,
  command: 90,
  commandGrowth: 2.18,
  leadership: 3.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yang_wen_si.webp",
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

export const createYangWenSiSkill = (): Skill => {
  return {
    id: "kuanjian-minzheng",
    name: "宽简民政",
    type: "command",
    description:
      "指挥：每回合开始时，使我军兵力最低单体恢复兵力（恢复率 90%），并获得 10% 减伤，持续 1 回合。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      const { type, event, allies, addReport } = context;
      if (type === "command" && event === "turnStart" && allies?.length > 0) {
        const aliveAllies = allies.filter((a: General) => !a.isDead);
        if (aliveAllies.length === 0) return { triggered: false };
        const ally = aliveAllies.reduce((min: General, cur: General) =>
          cur.troops < min.troops ? cur : min,
        );
        const recover = Math.floor(general.strategy * 0.9);
        ally.troops = Math.min(ally.maxTroops, ally.troops + recover);
        if (!ally.skillEffects) ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        ally.skillEffects.damageReduction = 0.1;
        ally.skillEffects.damageReductionSource = `【${general.name}】的【宽简民政】`;
        if (addReport) {
          addReport(`【${general.name}】施行【宽简民政】，为【${ally.name}】恢复${recover}兵力并赋予10%减伤！`);
        }
        return { triggered: true };
      }
      return null;
    },
  };
};

export const createYangWenSi = (): General => {
  const troops = calculateTroops(YANG_WEN_SI_BASE.command);
  return {
    ...YANG_WEN_SI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYangWenSiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: ["宽政安民，方可久治。", "为政在简，惠及黎庶。"],
      death: ["政道未竟，抱憾而终。"],
    },
  };
};

export const fetchYangWenSiFromDatabase = async (
  API_BASE_URL: string,
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/66`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YANG_WEN_SI_BASE.command);
    return {
      ...YANG_WEN_SI_BASE,
      id: characterData.id ?? YANG_WEN_SI_BASE.id,
      name: characterData.name ?? YANG_WEN_SI_BASE.name,
      dynasty: characterData.dynasty ?? YANG_WEN_SI_BASE.dynasty,
      gender: characterData.gender ?? YANG_WEN_SI_BASE.gender,
      avatar: characterData.avatar || YANG_WEN_SI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createYangWenSiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: ["宽政安民，方可久治。", "为政在简，惠及黎庶。"],
        death: ["政道未竟，抱憾而终。"],
      },
    };
  } catch (error) {
    console.error("从数据库获取杨文思信息失败:", error);
    return createYangWenSi();
  }
};
