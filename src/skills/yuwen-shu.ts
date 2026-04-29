import type { Skill, General, GeneralRarity } from "./types";

const YU_WEN_SHU_QUOTES = {
  skill: [
    "宇文世家，世代忠良！",
    "为国开疆，义不容辞！",
    "功勋卓著，青史留名！"
  ],
  death: ["宇文家族，为国尽忠..."]
} as const;

const YU_WEN_SHU_BASE = {
  id: 512,
  name: "宇文述",
  rarity: "uncommon" as GeneralRarity,
  attack: 65,
  attackGrowth: 2.08,
  defense: 70,
  defenseGrowth: 2.18,
  strategy: 58,
  strategyGrowth: 1.72,
  speed: 60,
  speedGrowth: 1.98,
  attackRange: 2,
  siege: 62,
  siegeGrowth: 1.92,
  level: 4,
  command: 65,
  commandGrowth: 2.08,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yuwen_shu.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  healingBonus: 0,
  healingBonusSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 宇文述自带战法【开隋元勋】
export const createYuWenShuSkill = (): Skill => ({
  id: "kai-sui-yuanxun",
  name: "开隋元勋",
  type: "command",
  description: "指挥：每回合使随机一名已方单位恢复6%兵力，持续全场",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, allies } = context;

    // 每回合使随机一名已方单位恢复6%兵力
    if (type === "turnStart" && event === "init") {
      if (allies && allies.length > 0) {
        const randomAlly = allies[Math.floor(Math.random() * allies.length)];
        const recoveryAmount = Math.floor(randomAlly.maxTroops * 0.06);
        const actualRecovery = Math.min(recoveryAmount, randomAlly.maxTroops - randomAlly.troops);
        if (actualRecovery > 0) {
          randomAlly.troops = Math.min(randomAlly.maxTroops, randomAlly.troops + actualRecovery);
          if (addReport) {
            addReport(`【${general.name}】的【开隋元勋】生效！已方【${randomAlly.name}】恢复${actualRecovery}点兵力！`);
          }
        }
      }
    }

    return null;
  },
});

export const createYuWenShu = (): General => {
  const troops = calculateTroops(YU_WEN_SHU_BASE.command);
  return {
    ...YU_WEN_SHU_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuWenShuSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_WEN_SHU_QUOTES,
  };
};

export const fetchYuWenShuFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/512`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YU_WEN_SHU_BASE.command);
    return {
      ...YU_WEN_SHU_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuWenShuSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_WEN_SHU_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取宇文述信息失败:", error);
    return createYuWenShu();
  }
};