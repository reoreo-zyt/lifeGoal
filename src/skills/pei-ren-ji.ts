import type { Skill, General, GeneralRarity } from "./types";

const PEI_REN_JI_QUOTES = {
  skill: [
    "裴氏虎子，所向披靡！",
    "攻城略地，势不可挡！",
    "血战到底，绝不后退！"
  ],
  death: ["裴家虎子，战死沙场，无憾..."]
} as const;

const PEI_REN_JI_BASE = {
  id: 571,
  name: "裴仁基",
  rarity: "rare" as GeneralRarity,
  attack: 82,
  attackGrowth: 2.58,
  defense: 75,
  defenseGrowth: 2.38,
  strategy: 55,
  strategyGrowth: 1.52,
  speed: 78,
  speedGrowth: 2.48,
  attackRange: 2,
  siege: 68,
  siegeGrowth: 2.08,
  level: 5,
  command: 82,
  commandGrowth: 2.58,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/pei_ren_ji.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  pursuitChance: 0,
  pursuitChanceSource: "",
  pursuitDamage: 0,
  pursuitDamageSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 裴仁基自带战法【裴氏虎子】
export const createPeiRenJiSkill = (): Skill => ({
  id: "pei-shi-huzi",
  name: "裴氏虎子",
  type: "active",
  distance: 4,
  probability: 0.44,
  description: "主动：对单体造成175%物理伤害，距离4，概率44%，追击：普攻后35%概率追加85%伤害，自身生命值每低10%伤害+12%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    // 主动战法触发
    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【裴氏虎子】！`);
      }
      if (targets && targets.length > 0) {
        const target = targets[0];
        // 生命值每低10%伤害+12%
        const hpPct = general.troops / general.maxTroops;
        const hpLossPct = 1 - hpPct;
        const extraDamagePct = Math.floor(hpLossPct / 0.1) * 0.12;
        const totalMultiplier = 1.75 + extraDamagePct;
        const damage = Math.max(0, Math.floor(general.attack * totalMultiplier - target.defense / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！（血量低伤害加成+${(extraDamagePct * 100).toFixed(0)}%）`);
        }
      }
      return { triggered: true };
    }

    // 追击效果：普攻后35%概率追加85%伤害
    if (type === "normalAttack" && event === "afterDamage") {
      if (Math.random() < 0.35) {
        if (!general.skillEffects.pursuitChance) {
          general.skillEffects.pursuitChance = 0.35;
          general.skillEffects.pursuitChanceSource = `【${general.name}】的【裴氏虎子】`;
        }
        if (!general.skillEffects.pursuitDamage) {
          general.skillEffects.pursuitDamage = 0.85;
          general.skillEffects.pursuitDamageSource = `【${general.name}】的【裴氏虎子】`;
        }
        const target = context.target;
        if (target) {
          const pursuitDamage = Math.max(0, Math.floor(general.attack * 0.85 - target.defense / 2));
          target.troops = Math.max(0, target.troops - pursuitDamage);
          if (addReport) {
            addReport(`【${general.name}】追击！对【${target.name}】追加${pursuitDamage}点物理伤害！`);
          }
        }
      }
    }

    return null;
  },
});

export const createPeiRenJi = (): General => {
  const troops = calculateTroops(PEI_REN_JI_BASE.command);
  return {
    ...PEI_REN_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createPeiRenJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: PEI_REN_JI_QUOTES,
  };
};

export const fetchPeiRenJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/571`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(PEI_REN_JI_BASE.command);
    return {
      ...PEI_REN_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createPeiRenJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: PEI_REN_JI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取裴仁基信息失败:", error);
    return createPeiRenJi();
  }
};