import type { Skill, General, GeneralRarity } from "./types";

const HAN_QIN_HU_QUOTES = {
  skill: ["渡江灭陈，此其时也！", "江南虽远，必有归期。", "擒贼擒王，一战而定！"],
  death: ["南朝旧事，终成泡影..."]
} as const;

const HAN_QIN_HU_BASE = {
  id: 12,
  name: "韩擒虎",
  rarity: "rare" as GeneralRarity,
  attack: 88,
  attackGrowth: 2.82,
  defense: 72,
  defenseGrowth: 2.22,
  strategy: 60,
  strategyGrowth: 1.85,
  speed: 86,
  speedGrowth: 2.82,
  attackRange: 2,
  siege: 65,
  siegeGrowth: 1.98,
  level: 5,
  command: 88,
  commandGrowth: 2.82,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/han_qin_hu.jpg",
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

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createHanQinHuSkill = (): Skill => ({
  id: "du-jiang-qin-di",
  name: "渡江擒敌",
  type: "active",
  distance: 4,
  probability: 0.46,
  description: "主动：对敌方单体造成180%物理伤害，40%概率震慑1回合",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【渡江擒敌】！`);
      }
      if (targets && targets.length > 0) {
        const target = targets[0];
        const damage = Math.max(0, Math.floor(general.attack * 1.80 - target.defense / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！`);
        }
        // 40%概率震慑1回合
        if (Math.random() < 0.40) {
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          target.skillEffects.cannotNormalAttack = true;
          target.skillEffects.cannotNormalAttackDuration = 1;
          target.skillEffects.cannotNormalAttackSource = `【${general.name}】的【渡江擒敌】`;
          if (addReport) {
            addReport(`【${target.name}】被震慑，无法普通攻击，持续1回合！`);
          }
        }
      }
      return { triggered: true };
    }

    // 震慑时间递减
    if (type === "turnEnd" && general.skillEffects?.cannotNormalAttackDuration) {
      general.skillEffects.cannotNormalAttackDuration -= 1;
      if (general.skillEffects.cannotNormalAttackDuration <= 0) {
        general.skillEffects.cannotNormalAttack = false;
        general.skillEffects.cannotNormalAttackSource = "";
      }
    }

    return null;
  },
});

export const createHanQinHu = (): General => {
  const troops = calculateTroops(HAN_QIN_HU_BASE.command);
  return {
    ...HAN_QIN_HU_BASE,
    troops,
    maxTroops: troops,
    skills: [createHanQinHuSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: HAN_QIN_HU_QUOTES,
  };
};

export const fetchHanQinHuFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/12`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(HAN_QIN_HU_BASE.command);
    return {
      ...HAN_QIN_HU_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createHanQinHuSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: HAN_QIN_HU_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取韩擒虎信息失败:", error);
    return createHanQinHu();
  }
};
