import type { Skill, General, GeneralRarity } from "./types";

const YUAN_YAN_QUOTES = {
  skill: [
    "刚正不阿，执法如山！",
    "名臣风骨，凛然正气！",
    "为国除奸，义不容辞！"
  ],
  death: ["名臣风骨，永昭青史..."]
} as const;

const YUAN_YAN_BASE = {
  id: 515,
  name: "元岩",
  rarity: "rare" as GeneralRarity,
  attack: 65,
  attackGrowth: 2.08,
  defense: 68,
  defenseGrowth: 2.18,
  strategy: 76,
  strategyGrowth: 2.58,
  speed: 58,
  speedGrowth: 1.82,
  attackRange: 3,
  siege: 52,
  siegeGrowth: 1.58,
  level: 5,
  command: 65,
  commandGrowth: 2.08,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuan_yan.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  defenseBonusPercent: 0,
  defenseBonusSource: "",
  damageOutputReduction: 0,
  damageOutputReductionSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 元岩自带战法【刚正名臣】
export const createYuanYanSkill = (): Skill => ({
  id: "gangzheng-mingchen",
  name: "刚正名臣",
  type: "command",
  description: "指挥：战斗开始我方全体防御+18%持续全场，每回合使敌方攻击最高单位降攻-10%持续1回合",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, allies, enemies } = context;

    // 战斗开始 → 我方全体防御+18%
    if (type === "battleStart" && event === "init") {
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (!ally.skillEffects) ally.skillEffects = {};
          ally.skillEffects.defenseBonusPercent = (ally.skillEffects.defenseBonusPercent || 0) + 18;
          ally.skillEffects.defenseBonusSource = `【${general.name}】的【刚正名臣】`;
        });
        if (addReport) {
          addReport(`【${general.name}】发动【刚正名臣】！我方全体防御+18%！`);
        }
      }
      return { triggered: true };
    }

    // 每回合使敌方攻击最高单位降攻-10%持续1回合
    if (type === "turnStart" && event === "init") {
      if (enemies && enemies.length > 0) {
        // 找到攻击最高的敌方单位
        let highestAttackEnemy = enemies[0];
        for (const enemy of enemies) {
          if ((enemy.attack as number) > (highestAttackEnemy.attack as number)) {
            highestAttackEnemy = enemy;
          }
        }
        if (!highestAttackEnemy.skillEffects) highestAttackEnemy.skillEffects = {};
        highestAttackEnemy.skillEffects.damageOutputReduction = 0.10;
        highestAttackEnemy.skillEffects.damageOutputReductionDuration = 1;
        highestAttackEnemy.skillEffects.damageOutputReductionSource = `【${general.name}】的【刚正名臣】`;
        if (addReport) {
          addReport(`【${general.name}】的【刚正名臣】生效！敌方【${highestAttackEnemy.name}】攻击力-10%！`);
        }
      }
    }

    return null;
  },
});

export const createYuanYan = (): General => {
  const troops = calculateTroops(YUAN_YAN_BASE.command);
  return {
    ...YUAN_YAN_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuanYanSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YUAN_YAN_QUOTES,
  };
};

export const fetchYuanYanFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/515`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YUAN_YAN_BASE.command);
    return {
      ...YUAN_YAN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuanYanSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YUAN_YAN_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取元岩信息失败:", error);
    return createYuanYan();
  }
};