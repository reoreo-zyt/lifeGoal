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
  attackGrowth: 0.85,
  defense: 65,
  defenseGrowth: 1.30,
  strategy: 102,
  strategyGrowth: 2.85,
  speed: 32,
  speedGrowth: 0.55,
  attackRange: 4,
  siege: 11,
  siegeGrowth: 0.55,
  level: 5,
  command: 88,
  commandGrowth: 2.20,
  leadership: 3.5,
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
  teamStrategyDamageIncrease: 0,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

/**
 * 【贞观良谋】指挥
 * - 战斗开始时：永久使全体友军谋略伤害 +15%（利用 teamStrategyDamageIncrease 字段）
 * - 每回合开始：40% 概率使敌方随机 1 人陷入【沉默】（无法发动主动战法）1 回合
 * - 整体定位：团队谋略增益 + 控制敌方主动战法，辅助核心
 */
export const createFangXuanLingSkill = (): Skill => ({
  id: "zhenguan-liangmou",
  name: "贞观良谋",
  type: "command",
  description:
    "指挥：战斗开始时全体友军谋略伤害永久 +15%；每回合开始 40% 概率使敌方随机 1 人【沉默】1 回合。",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, allies, targets } = context;

    // 战斗开始 → 全体友军谋略伤害 +15%
    if (type === "battleStart" && event === "init") {
      if (!general.teamStrategyDamageIncrease) {
        general.teamStrategyDamageIncrease = 15;
      }
      if (allies && allies.length > 0) {
        allies.forEach((ally: General) => {
          if (!ally.skillEffects) {
            ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          }
          ally.skillEffects.teamStrategyDamageIncrease =
            (ally.skillEffects.teamStrategyDamageIncrease || 0) + 15;
          if (addReport) {
            addReport(
              `【${ally.name}】受到【贞观良谋】加持，谋略伤害永久提升 15%！`
            );
          }
        });
      }
      if (addReport) {
        addReport(
          `【${general.name}】发动【贞观良谋】，运筹帷幄，决胜千里！`
        );
      }
      return { triggered: true };
    }

    // 每回合开始 → 40% 沉默敌方随机 1 人
    if (type === "turnStart") {
      if (Math.random() < 0.40 && targets && targets.length > 0) {
        const target =
          targets[Math.floor(Math.random() * targets.length)];
        if (!target.skillEffects) {
          target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
        }
        target.skillEffects.isSilenced = true;
        target.skillEffects.silenceSource = `【${general.name}】的【贞观良谋】`;
        if (addReport) {
          addReport(
            `【${general.name}】的【贞观良谋】使【${target.name}】陷入【沉默】，无法发动主动战法！`
          );
        }
      }
      // 清除自身的沉默状态（回合开始时自动清除）
      if (general.skillEffects.isSilenced) {
        general.skillEffects.isSilenced = false;
        general.skillEffects.silenceSource = "";
      }
      return null;
    }

    // 主动战法触发前 → 检查沉默
    if (type === "activeSkill" && event === "beforeTrigger") {
      if (general.skillEffects.isSilenced) {
        if (addReport) {
          addReport(
            `【${general.name}】处于【沉默】状态，无法发动主动战法！`
          );
        }
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
  };
};

export const fetchFangXuanLingFromDatabase = async (
  API_BASE_URL: string
): Promise<General | null> => {
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
    };
  } catch (error) {
    console.error("从数据库获取房玄龄信息失败:", error);
    return createFangXuanLing();
  }
};
