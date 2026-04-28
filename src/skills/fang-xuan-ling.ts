import type { Skill, General, GeneralRarity } from "./types";

const FANG_XUAN_LING_QUOTES = {
  skill: ["房谋杜断，共治天下。", "为陛下分忧，臣之职也。", "贞观之治，始于良谋。"],
  death: ["贞观之治，臣无憾矣..."],
} as const;

const FANG_XUAN_LING_BASE = {
  id: 27,
  name: "房玄龄",
  rarity: "rare" as GeneralRarity,
  attack: 50,
  attackGrowth: 1.52,
  defense: 64,
  defenseGrowth: 1.98,
  strategy: 72,
  strategyGrowth: 2.85,
  speed: 32,
  speedGrowth: 0.82,
  attackRange: 3,
  siege: 42,
  siegeGrowth: 1.28,
  level: 4,
  command: 65,
  commandGrowth: 1.95,
  leadership: 2.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/fang_xuan_ling.jpg",
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

// 贞观良谋 — 指挥：全体友军谋略伤害+15%永久；每回合40%概率使敌方随机1人沉默1回合
export const createFangXuanLingSkill = (): Skill => ({
  id: "zhenguan-liangmou",
  name: "贞观良谋",
  type: "command",
  description: "指挥：全体友军谋略伤害+15%永久；每回合40%概率使敌方随机1人沉默1回合",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, allies, enemies } = context;

    // 战斗开始 → 全体友军谋略伤害+15%
    if (type === "battleStart" && event === "init") {
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (!ally.skillEffects) ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          ally.skillEffects.strategyDamageBonus = (ally.skillEffects.strategyDamageBonus || 0) + 15;
          ally.skillEffects.strategyDamageBonusSource = `【${general.name}】的【贞观良谋】`;
          if (addReport) addReport(`【${ally.name}】受【贞观良谋】加持，谋略伤害+15%！`);
        });
      }
      if (addReport) addReport(`【${general.name}】发动【贞观良谋】，运筹帷幄，决胜千里！`);
      return { triggered: true };
    }

    // 回合开始 → 40%概率沉默敌方随机1人
    if (type === "turnStart") {
      if (Math.random() < 0.40 && enemies && enemies.length > 0) {
        const aliveEnemies = enemies.filter((e: General): boolean => !e.isDead);
        if (aliveEnemies.length === 0) return null;
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        target.skillEffects.isSilenced = true;
        target.skillEffects.silenceSource = `【${general.name}】的【贞观良谋】`;
        target.skillEffects.silenceDuration = 1;
        if (addReport) addReport(`【${general.name}】的【贞观良谋】使【${target.name}】陷入【沉默】，无法发动主动战法！`);
      }
    }

    // 回合结束 → 清除沉默持续时间
    if (type === "turnEnd") {
      if (enemies) {
        enemies.forEach((enemy: General) => {
          if (enemy.skillEffects?.silenceDuration) {
            enemy.skillEffects.silenceDuration -= 1;
            if (enemy.skillEffects.silenceDuration <= 0) {
              enemy.skillEffects.isSilenced = false;
              enemy.skillEffects.silenceDuration = 0;
              enemy.skillEffects.silenceSource = "";
            }
          }
        });
      }
    }

    // 主动战法触发前 → 检查沉默
    if (type === "activeSkill" && event === "beforeTrigger") {
      if (general.skillEffects.isSilenced) {
        if (addReport) addReport(`【${general.name}】处于【沉默】状态，无法发动主动战法！`);
        return { blocked: true, reason: "沉默" };
      }
    }

    return null;
  },
});

export const createFangXuanLing = (): General => {
  const troops = calculateTroops(FANG_XUAN_LING_BASE.command);
  return {
    ...FANG_XUAN_LING_BASE,
    troops,
    maxTroops: troops,
    skills: [createFangXuanLingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: FANG_XUAN_LING_QUOTES,
    rarity: FANG_XUAN_LING_BASE.rarity,
  };
};

export const fetchFangXuanLingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/27`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(FANG_XUAN_LING_BASE.command);
    return {
      ...FANG_XUAN_LING_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createFangXuanLingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: FANG_XUAN_LING_QUOTES,
      rarity: FANG_XUAN_LING_BASE.rarity,
    };
  } catch (error) {
    console.error("从数据库获取房玄龄信息失败:", error);
    return createFangXuanLing();
  }
};
