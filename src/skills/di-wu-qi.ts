import type { Skill, General } from "./types";

const DI_WU_QI_QUOTES = {
  skill: ["国用当足，军心方定。", "理财有道，方可济时。"],
  death: ["财尽国危，此身亦尽。"],
} as const;

const DI_WU_QI_BASE = {
  id: 739,
  name: "第五琦",
  attack: 38,
  attackGrowth: 0.62,
  defense: 50,
  defenseGrowth: 0.95,
  strategy: 96,
  strategyGrowth: 2.84,
  speed: 44,
  speedGrowth: 0.88,
  attackRange: 3,
  siege: 8,
  siegeGrowth: 0.40,
  level: 5,
  command: 89,
  commandGrowth: 2.12,
  leadership: 3.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/di_wu_qi.webp",
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

export const createDiWuQiSkill = (): Skill => {
  return {
    id: "junfu-tongcai",
    name: "均赋通财",
    type: "active",
    description:
      "主动，发动概率 36%，攻击范围 3：对敌军单体造成 108% 策略伤害，并使其伤害输出降低 12%，持续 2 回合；为我军兵力最低单体恢复兵力，恢复率 100%。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      const { type, event, addReport, targets, allies } = context;
      if (type === "activeSkill" && event === "trigger") {
        const triggerChance = 0.36;
        if (addReport) {
          addReport(`【${general.name}】尝试发动【均赋通财】（发动概率：36%）`);
        }
        if (Math.random() >= triggerChance) {
          if (addReport) addReport(`【${general.name}】的【均赋通财】未触发！`);
          return { triggered: false };
        }
        if (targets && targets.length > 0) {
          const target = targets[0];
          const damage = Math.max(
            0,
            Math.floor(general.strategy * 1.08 - target.strategy / 2),
          );
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) target.isDead = true;
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          target.skillEffects.damageOutputReduction = 0.12;
          target.skillEffects.damageOutputReductionDuration = 2;
          target.skillEffects.damageOutputReductionSource = `【${general.name}】的【均赋通财】`;
          if (addReport) {
            addReport(`【${general.name}】对【${target.name}】造成${damage}点策略伤害，并使其降攻12%，持续2回合！`);
          }
        }
        if (allies && allies.length > 0) {
          const aliveAllies = allies.filter((a: General) => !a.isDead);
          if (aliveAllies.length > 0) {
            const ally = aliveAllies.reduce((min: General, cur: General) =>
              cur.troops < min.troops ? cur : min,
            );
            const recover = Math.floor(general.strategy);
            ally.troops = Math.min(ally.maxTroops, ally.troops + recover);
            if (addReport) addReport(`【${general.name}】调度军资，为【${ally.name}】恢复${recover}点兵力！`);
          }
        }
        return { triggered: true };
      }
      return null;
    },
  };
};

export const createDiWuQi = (): General => {
  const troops = calculateTroops(DI_WU_QI_BASE.command);
  return {
    ...DI_WU_QI_BASE,
    troops,
    maxTroops: troops,
    skills: [createDiWuQiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: DI_WU_QI_QUOTES,
  };
};

export const fetchDiWuQiFromDatabase = async (
  API_BASE_URL: string,
): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/739`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(DI_WU_QI_BASE.command);
    return {
      ...DI_WU_QI_BASE,
      id: characterData.id ?? DI_WU_QI_BASE.id,
      name: characterData.name ?? DI_WU_QI_BASE.name,
      dynasty: characterData.dynasty ?? DI_WU_QI_BASE.dynasty,
      gender: characterData.gender ?? DI_WU_QI_BASE.gender,
      avatar: characterData.avatar || DI_WU_QI_BASE.avatar,
      troops,
      maxTroops: troops,
      skills: [createDiWuQiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: DI_WU_QI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取第五琦信息失败:", error);
    return createDiWuQi();
  }
};
