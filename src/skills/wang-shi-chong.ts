import type { Skill, General, GeneralRarity } from "./types";

const WANG_SHI_CHONG_QUOTES = {
  skill: [
    "郑国基业，谁敢觊觎！",
    "洛阳城坚，谁与争锋！",
    "帝王霸业，尽在掌握！"
  ],
  death: ["洛阳城破，郑国亡矣..."]
} as const;

const WANG_SHI_CHONG_BASE = {
  id: 526,
  name: "王世充",
  rarity: "uncommon" as GeneralRarity,
  attack: 68,
  attackGrowth: 2.18,
  defense: 82,
  defenseGrowth: 2.62,
  strategy: 65,
  strategyGrowth: 1.98,
  speed: 45,
  speedGrowth: 1.32,
  attackRange: 2,
  siege: 55,
  siegeGrowth: 1.68,
  level: 4,
  command: 68,
  commandGrowth: 2.18,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/wang_shi_chong.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  speedReduction: 0,
  speedReductionSource: "",
  recoveryPercent: 0,
  recoverySource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 王世充自带战法【郑帝狡雄】
export const createWangShiChongSkill = (): Skill => ({
  id: "zhengdi-jiaoxiong",
  name: "郑帝狡雄",
  type: "command",
  description: "指挥：战斗开始敌方全体速度-15%持续全场，自身每回合开始时恢复4%兵力",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, enemies } = context;

    // 战斗开始 → 敌方全体速度-15%
    if (type === "battleStart" && event === "init") {
      if (enemies && enemies.length > 0) {
        enemies.forEach((enemy: General) => {
          if (!enemy.skillEffects) enemy.skillEffects = {};
          enemy.skillEffects.speedReduction = 0.15;
          enemy.skillEffects.speedReductionDuration = -1; // 全场
          enemy.skillEffects.speedReductionSource = `【${general.name}】的【郑帝狡雄】`;
        });
        if (addReport) {
          addReport(`【${general.name}】发动【郑帝狡雄】！敌方全体速度降低15%！`);
        }
      }
      return { triggered: true };
    }

    // 每回合开始时恢复4%兵力
    if (type === "turnStart" && event === "init") {
      const recoveryAmount = Math.floor(general.maxTroops * 0.04);
      const actualRecovery = Math.min(recoveryAmount, general.maxTroops - general.troops);
      if (actualRecovery > 0) {
        general.troops = Math.min(general.maxTroops, general.troops + actualRecovery);
        if (addReport) {
          addReport(`【${general.name}】每回合开始，恢复${actualRecovery}点兵力！`);
        }
      }
    }

    return null;
  },
});

export const createWangShiChong = (): General => {
  const troops = calculateTroops(WANG_SHI_CHONG_BASE.command);
  return {
    ...WANG_SHI_CHONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createWangShiChongSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: WANG_SHI_CHONG_QUOTES,
  };
};

export const fetchWangShiChongFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/526`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(WANG_SHI_CHONG_BASE.command);
    return {
      ...WANG_SHI_CHONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createWangShiChongSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: WANG_SHI_CHONG_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取王世充信息失败:", error);
    return createWangShiChong();
  }
};