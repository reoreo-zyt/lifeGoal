import type { Skill, General, GeneralRarity } from "./types";

const ZHANG_XU_TUO_QUOTES = {
  skill: [
    "剿匪平贼，保境安民！",
    "贼寇不灭，誓不收兵！",
    "身先士卒，冲锋陷阵！"
  ],
  death: ["剿匪未成，此恨难消..."]
} as const;

const ZHANG_XU_TUO_BASE = {
  id: 578,
  name: "张须陀",
  rarity: "uncommon" as GeneralRarity,
  attack: 78,
  attackGrowth: 2.58,
  defense: 75,
  defenseGrowth: 2.42,
  strategy: 48,
  strategyGrowth: 1.32,
  speed: 55,
  speedGrowth: 1.72,
  attackRange: 2,
  siege: 58,
  siegeGrowth: 1.78,
  level: 4,
  command: 78,
  commandGrowth: 2.58,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/zhang_xu_tuo.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  damageOutputReduction: 0,
  damageOutputReductionSource: "",
  defenseBonusPercent: 0,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 张须陀自带战法【剿匪名将】
export const createZhangXuTuoSkill = (): Skill => ({
  id: "jiaofei-mingjiang",
  name: "剿匪名将",
  type: "passive",
  description: "被动：战斗开始时，使敌方攻击最高的单位降攻-18%持续全场，自身每损失10%兵力防御+8%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, enemies } = context;

    // 战斗开始 → 使敌方攻击最高单位降攻
    if (type === "battleStart" && event === "init") {
      if (enemies && enemies.length > 0) {
        // 找到攻击最高的敌方单位
        let highestAttackEnemy = enemies[0];
        for (const enemy of enemies) {
          if ((enemy.attack as number) > (highestAttackEnemy.attack as number)) {
            highestAttackEnemy = enemy;
          }
        }
        if (!highestAttackEnemy.skillEffects) highestAttackEnemy.skillEffects = {};
        highestAttackEnemy.skillEffects.damageOutputReduction = 0.18;
        highestAttackEnemy.skillEffects.damageOutputReductionSource = `【${general.name}】的【剿匪名将】`;
        highestAttackEnemy.skillEffects.damageOutputReductionDuration = -1; // 全场
        if (addReport) {
          addReport(`【${general.name}】发动【剿匪名将】！敌方【${highestAttackEnemy.name}】攻击力降低18%！`);
        }
      }
      return { triggered: true };
    }

    // 每损失10%兵力防御+8%
    if (type === "turnEnd") {
      const hpPct = general.troops / general.maxTroops;
      const hpLossPct = 1 - hpPct;
      const defenseBonus = Math.floor(hpLossPct / 0.1) * 8;
      if (defenseBonus > 0) {
        general.defense = Math.floor(general.defense * (1 + defenseBonus / 100));
        if (addReport) {
          addReport(`【${general.name}】损失兵力，【剿匪名将】防御+${defenseBonus}%！`);
        }
      }
    }

    return null;
  },
});

export const createZhangXuTuo = (): General => {
  const troops = calculateTroops(ZHANG_XU_TUO_BASE.command);
  return {
    ...ZHANG_XU_TUO_BASE,
    troops,
    maxTroops: troops,
    skills: [createZhangXuTuoSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: ZHANG_XU_TUO_QUOTES,
  };
};

export const fetchZhangXuTuoFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/578`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(ZHANG_XU_TUO_BASE.command);
    return {
      ...ZHANG_XU_TUO_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createZhangXuTuoSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: ZHANG_XU_TUO_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取张须陀信息失败:", error);
    return createZhangXuTuo();
  }
};