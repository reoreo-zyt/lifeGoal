import type { Skill, General, GeneralRarity } from "./types";

const LI_YUAN_JI_QUOTES = {
  skill: [
    "太原疾风，天下无双！",
    "快马加鞭，敌将难逃！",
    "箭如雨下，万箭穿心！"
  ],
  death: ["太原雄风，至此绝矣..."]
} as const;

const LI_YUAN_JI_BASE = {
  id: 655,
  name: "李元吉",
  rarity: "rare" as GeneralRarity,
  attack: 88,
  attackGrowth: 2.82,
  defense: 65,
  defenseGrowth: 2.08,
  strategy: 48,
  strategyGrowth: 1.28,
  speed: 92,
  speedGrowth: 2.95,
  attackRange: 2,
  siege: 55,
  siegeGrowth: 1.68,
  level: 5,
  command: 68,
  commandGrowth: 2.12,
  leadership: 2.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/li_yuan_ji.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  hasExtraAttack: false,
  hasExtraAttackSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 李元吉自带战法【太原疾风】
export const createLiYuanJiSkill = (): Skill => ({
  id: "taiyuan-jifeng",
  name: "太原疾风",
  type: "active",
  distance: 4,
  probability: 0.52,
  description: "主动：对单体造成155%物理伤害，距离4，概率52%，必定使目标速度-25%持续2回合，连击：普攻后必定再攻击一次",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    // 主动战法触发
    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【太原疾风】！`);
      }
      if (targets && targets.length > 0) {
        const target = targets[0];
        const damage = Math.max(0, Math.floor(general.attack * 1.55 - target.defense / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！`);
        }
        // 必定使目标速度-25%持续2回合
        if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        target.skillEffects.speedReduction = 0.25;
        target.skillEffects.speedReductionDuration = 2;
        target.skillEffects.speedReductionSource = `【${general.name}】的【太原疾风】`;
        if (addReport) {
          addReport(`【${target.name}】速度降低25%，持续2回合！`);
        }
      }
      return { triggered: true };
    }

    // 追击：普攻后必定再攻击一次（连击）
    if (type === "normalAttack" && event === "afterDamage") {
      if (!general.skillEffects.hasExtraAttack) {
        general.skillEffects.hasExtraAttack = true;
        general.skillEffects.hasExtraAttackSource = `【${general.name}】的【太原疾风】`;
        if (addReport) {
          addReport(`【${general.name}】普攻后触发【太原疾风】连击！`);
        }
      }
    }

    return null;
  },
});

export const createLiYuanJi = (): General => {
  const troops = calculateTroops(LI_YUAN_JI_BASE.command);
  return {
    ...LI_YUAN_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiYuanJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_YUAN_JI_QUOTES,
  };
};

export const fetchLiYuanJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/655`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(LI_YUAN_JI_BASE.command);
    return {
      ...LI_YUAN_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiYuanJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LI_YUAN_JI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取李元吉信息失败:", error);
    return createLiYuanJi();
  }
};