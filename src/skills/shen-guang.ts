import type { Skill, General, GeneralRarity } from "./types";

const SHEN_GUANG_QUOTES = {
  skill: [
    "骁果雄风，谁与争锋！",
    "快马如风，斩将搴旗！",
    "马革裹尸，死得其所！"
  ],
  death: ["骁果军魂，永不熄灭..."]
} as const;

const SHEN_GUANG_BASE = {
  id: 534,
  name: "沈光",
  rarity: "rare" as GeneralRarity,
  attack: 86,
  attackGrowth: 2.78,
  defense: 68,
  defenseGrowth: 2.12,
  strategy: 52,
  strategyGrowth: 1.42,
  speed: 88,
  speedGrowth: 2.85,
  attackRange: 2,
  siege: 60,
  siegeGrowth: 1.88,
  level: 5,
  command: 86,
  commandGrowth: 2.78,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/shen_guang.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  hasFirstStrike: false,
  hasFirstStrikeSource: "",
  pursuitChance: 0,
  pursuitChanceSource: "",
  pursuitDamage: 0,
  pursuitDamageSource: "",
  isImmuneToCannotNormalAttack: false,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 沈光自带战法【骁果雄风】
export const createShenGuangSkill = (): Skill => ({
  id: "xiaoguo-xiongfeng",
  name: "骁果雄风",
  type: "passive",
  description: "被动：速度+30%，每回合必定先手；追击：普攻后40%概率追加70%伤害；免疫怯战效果",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, target } = context;

    // 战斗开始 → 必定先手 + 免疫怯战
    if (type === "battleStart" && event === "init") {
      general.speed = Math.floor(general.speed * 1.30);
      general.skillEffects.hasFirstStrike = true;
      general.skillEffects.hasFirstStrikeSource = `【${general.name}】的【骁果雄风】`;
      general.skillEffects.pursuitChance = 0.40;
      general.skillEffects.pursuitChanceSource = `【${general.name}】的【骁果雄风】`;
      general.skillEffects.pursuitDamage = 0.70;
      general.skillEffects.pursuitDamageSource = `【${general.name}】的【骁果雄风】`;
      general.skillEffects.isImmuneToCannotNormalAttack = true;
      if (addReport) {
        addReport(`【${general.name}】发动【骁果雄风】！速度+30%，必定先手，免疫怯战！`);
      }
      return { triggered: true };
    }

    // 追击：普攻后40%概率追加70%伤害
    if (type === "normalAttack" && event === "afterDamage") {
      if (Math.random() < 0.40 && target) {
        const pursuitDamage = Math.max(
          0,
          Math.floor(general.attack * 0.70 - target.defense / 2)
        );
        target.troops = Math.max(0, target.troops - pursuitDamage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】普攻后触发【骁果雄风】追击！对【${target.name}】追加${pursuitDamage}点物理伤害！`);
        }
      }
    }

    return null;
  },
});

export const createShenGuang = (): General => {
  const troops = calculateTroops(SHEN_GUANG_BASE.command);
  return {
    ...SHEN_GUANG_BASE,
    troops,
    maxTroops: troops,
    skills: [createShenGuangSkill()],
    skillEffects: {
      ...DEFAULT_SKILL_EFFECTS,
      hasFirstStrike: true,
      hasFirstStrikeSource: `【${SHEN_GUANG_BASE.name}】的【骁果雄风】`,
      pursuitChance: 0.40,
      pursuitChanceSource: `【${SHEN_GUANG_BASE.name}】的【骁果雄风】`,
      pursuitDamage: 0.70,
      pursuitDamageSource: `【${SHEN_GUANG_BASE.name}】的【骁果雄风】`,
      isImmuneToCannotNormalAttack: true,
    },
    quotes: SHEN_GUANG_QUOTES,
  };
};

export const fetchShenGuangFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/534`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(SHEN_GUANG_BASE.command);
    return {
      ...SHEN_GUANG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createShenGuangSkill()],
      skillEffects: {
        ...DEFAULT_SKILL_EFFECTS,
        hasFirstStrike: true,
        hasFirstStrikeSource: `【${SHEN_GUANG_BASE.name}】的【骁果雄风】`,
        pursuitChance: 0.40,
        pursuitChanceSource: `【${SHEN_GUANG_BASE.name}】的【骁果雄风】`,
        pursuitDamage: 0.70,
        pursuitDamageSource: `【${SHEN_GUANG_BASE.name}】的【骁果雄风】`,
        isImmuneToCannotNormalAttack: true,
      },
      quotes: SHEN_GUANG_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取沈光信息失败:", error);
    return createShenGuang();
  }
};