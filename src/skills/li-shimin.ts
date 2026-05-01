import type { Skill, General, GeneralRarity } from "./types";

const LI_SHIMIN_QUOTES = {
  skill: ["朕观天下英雄，唯靖与世民。", "天策上将，所向披靡。", "平定天下，此其时也。"],
  death: ["朕已尽力，天下交给你们了..."],
} as const;

// 李世民的基础属性常量
const LI_SHIMIN_BASE = {
  id: 2,
  name: "李世民",
  rarity: "legendary" as GeneralRarity,
  attack: 92,
  attackGrowth: 3.00,
  defense: 88,
  defenseGrowth: 2.78,
  strategy: 90,
  strategyGrowth: 2.88,
  speed: 92,
  speedGrowth: 2.98,
  attackRange: 4,
  siege: 80,
  siegeGrowth: 2.52,
  level: 5,
  command: 92,
  commandGrowth: 2.98,
  leadership: 3.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/li_shimin.jpg",
};

// 李世民的skillEffects默认值
const DEFAULT_SKILL_EFFECTS: Record<string, unknown> = {
  damageReduction: 0,
  damageReductionSource: "",
  attackBonus: 0,
  attackBonusSource: "",
  speedBonus: 0,
  speedBonusSource: "",
  strategyDamageBonus: 0,
  strategyDamageBonusSource: "",
  pursuitChance: 0,
  pursuitChanceSource: "",
  taiyuanTwinActive: false,
  immuneToChichan: false,
  immuneToChichanSource: "",
  immuneToSilence: false,
  immuneToSilenceSource: "",
  hasAppliedCommand: false,
  tiancSkillActive: false,
  killCount: 0,
  extraAttackChance: 0,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 李世民的自带战法【天策上将】
export const createLiShiminSkill = (): Skill => {
  return {
    id: "tiance-shangjiang",
    name: "天策上将",
    type: "command",
    description: "指挥：前三回合我方全体攻击+28%与速度+15%；自身每击杀一个敌人，攻击力永久+12%；免疫怯战，追击：普攻后40%概率追加90%伤害",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;
        general.skillEffects.tiancSkillActive = true;

        if (addReport) {
          addReport(`【${general.name}】发动【天策上将】，三军用命！`);
        }

        // 前三回合全体友军攻击+28%，速度+15%
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) ally.skillEffects = {};
            ally.skillEffects.attackBonus = (ally.skillEffects.attackBonus || 0) + 28;
            ally.skillEffects.attackBonusSource = "天策上将";
            ally.skillEffects.speedBonus = (ally.skillEffects.speedBonus || 0) + 15;
            ally.skillEffects.speedBonusSource = "天策上将";
            if (addReport) {
              addReport(`【${ally.name}】攻击+28%，速度+15%！`);
            }
          });
        }

        return { triggered: true };
      }

      // 追击：普攻后40%概率追加90%伤害
      if (type === "normalAttack" && event === "afterDamage") {
        if (Math.random() < 0.40) {
          if (addReport) {
            addReport(`【${general.name}】触发【天策上将】追击，追加90%伤害！`);
          }
          return { extraDamageRatio: 0.90 };
        }
      }

      // 免疫怯战：在怯战状态检查时清除
      if (type === "turnStart") {
        if (general.skillEffects?.isChichan) {
          if (addReport) {
            addReport(`【${general.name}】免疫【怯战】效果！`);
          }
          general.skillEffects.isChichan = false;
        }
      }

      return null;
    },
  };
};

// 创建李世民武将数据
export const createLiShimin = (): General => {
  const troops = calculateTroops(LI_SHIMIN_BASE.command);

  return {
    ...LI_SHIMIN_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiShiminSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LI_SHIMIN_QUOTES,
  };
};

// 从数据库获取李世民的详细信息
export const fetchLiShiminFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/2`);
    if (!response.ok) {
      throw new Error("获取人物信息失败");
    }
    const characterData = await response.json();

    const troops = calculateTroops(LI_SHIMIN_BASE.command);

    return {
      ...LI_SHIMIN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiShiminSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: LI_SHIMIN_QUOTES,
    };
  } catch {
    return createLiShimin();
  }
};
