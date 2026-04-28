import type { Skill, General, GeneralRarity } from "./types";

const YU_WEN_HUA_JI_QUOTES = {
  skill: ["江都之变，天命在我。", "杨广无道，当诛之。", "弑君夺位，舍我其谁。"],
  death: ["本想称帝，竟至于此..."],
} as const;

const YU_WEN_HUA_JI_BASE = {
  id: 26,
  name: "宇文化及",
  rarity: "uncommon" as GeneralRarity,
  attack: 52,
  attackGrowth: 1.58,
  defense: 50,
  defenseGrowth: 1.48,
  strategy: 52,
  strategyGrowth: 1.52,
  speed: 56,
  speedGrowth: 1.82,
  attackRange: 3,
  siege: 52,
  siegeGrowth: 1.58,
  level: 4,
  command: 52,
  commandGrowth: 1.58,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yu_wen_hua_ji.jpg",
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

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 弑逆逞凶 — 主动：消耗25%兵力对敌方全体造成70%物理伤害，距离3，概率35%，敌方全体怯战1回合
export const createYuWenHuaJiSkill = (): Skill => ({
  id: "shini-chengxiong",
  name: "弑逆逞凶",
  type: "active",
  distance: 3,
  probability: 0.35,
  description: "主动：消耗25%兵力对敌方全体造成70%物理伤害，距离3，概率35%，敌方全体怯战1回合",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, enemies } = context;

    if (type === "activeSkill" && event === "trigger") {
      // 消耗25%当前兵力
      const cost = Math.floor(general.maxTroops * 0.25);
      general.troops = Math.max(0, general.troops - cost);
      if (addReport) addReport(`【${general.name}】消耗${cost}兵力发动【弑逆逞凶】！`);

      // 对敌方全体造成70%物理伤害
      if (enemies && enemies.length > 0) {
        enemies.forEach((enemy: General) => {
          if (enemy.isDead) return;
          const damage = Math.max(0, Math.floor(general.attack * 0.70 - enemy.defense / 4));
          enemy.troops = Math.max(0, enemy.troops - damage);
          if (enemy.troops <= 0) enemy.isDead = true;
          if (!enemy.skillEffects) enemy.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          enemy.skillEffects.cannotPhysicalAttack = true;
          enemy.skillEffects.cannotPhysicalAttackDuration = 1;
          enemy.skillEffects.cannotPhysicalAttackSource = `【${general.name}】的【弑逆逞凶】`;
          if (addReport) {
            addReport(`【${general.name}】对【${enemy.name}】造成${damage}点物理伤害，并使其怯战1回合！`);
          }
        });
      }
      return { triggered: true };
    }

    // 回合开始减少怯战持续时间
    if (type === "turnStart") {
      enemies?.forEach((enemy: General) => {
        if (enemy.skillEffects?.cannotPhysicalAttackDuration) {
          enemy.skillEffects.cannotPhysicalAttackDuration -= 1;
          if (enemy.skillEffects.cannotPhysicalAttackDuration <= 0) {
            enemy.skillEffects.cannotPhysicalAttack = false;
            enemy.skillEffects.cannotPhysicalAttackDuration = 0;
          }
        }
      });
    }

    return null;
  },
});

export const createYuWenHuaJi = (): General => {
  const troops = calculateTroops(YU_WEN_HUA_JI_BASE.command);
  return {
    ...YU_WEN_HUA_JI_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuWenHuaJiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_WEN_HUA_JI_QUOTES,
    rarity: YU_WEN_HUA_JI_BASE.rarity,
  };
};

export const fetchYuWenHuaJiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/26`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(YU_WEN_HUA_JI_BASE.command);
    return {
      ...YU_WEN_HUA_JI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuWenHuaJiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_WEN_HUA_JI_QUOTES,
      rarity: "uncommon" as GeneralRarity,
    };
  } catch (error) {
    console.error("从数据库获取宇文化及信息失败:", error);
    return createYuWenHuaJi();
  }
};
