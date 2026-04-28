import type { Skill, General, GeneralRarity } from "./types";

const DU_HU_CHANG_QUOTES = {
  skill: ["谋覆三军，计定天下。", "谋士之策，胜于甲兵。", "运筹帷幄，决胜千里。"],
  death: ["计谋已尽，天命难违..."],
} as const;

const DU_HU_CHANG_BASE = {
  id: 36,
  name: "独弧昌",
  rarity: "rare",
  attack: 72,
  attackGrowth: 2.18,
  defense: 70,
  defenseGrowth: 2.22,
  strategy: 82,
  strategyGrowth: 2.82,
  speed: 68,
  speedGrowth: 2.08,
  attackRange: 5,
  siege: 52,
  siegeGrowth: 1.52,
  level: 4,
  command: 72,
  commandGrowth: 2.18,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/du_hu_chang.jpg",
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

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 独弧昌的自带战法【谋覆军众】
export const createDuHuChangSkill = (): Skill => {
  return {
    id: "mou-fu-jun-zhong",
    name: "谋覆军众",
    type: "active",
    distance: 5,
    probability: 0.45,
    description: "主动：对敌方全体造成65%策略伤害，距离5，概率45%，30%概率使目标沉默1回合",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, enemies } = context;

      // 主动战法：对敌方全体造成65%策略伤害，30%概率使目标沉默1回合
      if (type === "activeSkill" && event === "trigger") {
        if (enemies && enemies.length > 0) {
          const aliveEnemies = enemies.filter((e: General) => !e.isDead);
          if (aliveEnemies.length > 0) {
            if (addReport) {
              addReport(`【${general.name}】发动【谋覆军众】，谋覆三军！`);
            }
            // 对每个敌人检查沉默
            aliveEnemies.forEach((enemy: General) => {
              if (Math.random() < 0.30) {
                if (!enemy.skillEffects) {
                  enemy.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
                }
                enemy.skillEffects.isSilenced = true;
                enemy.skillEffects.silenceSource = `【${general.name}】的【谋覆军众】`;
                if (addReport) {
                  addReport(`【${enemy.name}】被【谋覆军众】沉默，下回合无法发动主动战法！`);
                }
              }
            });
            return {
              allTargets: true,
              damageMultiplier: 0.65,
              damageType: "strategy",
            };
          }
        }
      }

      // 处理沉默状态在回合结束时解除
      if (type === "turnEnd") {
        if (general.skillEffects?.isSilenced) {
          general.skillEffects.isSilenced = false;
          general.skillEffects.silenceSource = "";
        }
      }

      return null;
    },
  };
};

export const createDuHuChang = (): General => {
  const troops = calculateTroops(DU_HU_CHANG_BASE.command);
  return {
    ...DU_HU_CHANG_BASE,
    troops,
    maxTroops: troops,
    skills: [createDuHuChangSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: DU_HU_CHANG_QUOTES,
    rarity: DU_HU_CHANG_BASE.rarity as GeneralRarity,
  };
};

export const fetchDuHuChangFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/36`);
    if (!response.ok) throw new Error('获取人物信息失败');
    const characterData = await response.json();
    const troops = calculateTroops(DU_HU_CHANG_BASE.command);
    return {
      ...DU_HU_CHANG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createDuHuChangSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: DU_HU_CHANG_QUOTES,
      rarity: DU_HU_CHANG_BASE.rarity as GeneralRarity,
    };
  } catch (error) {
    console.error('从数据库获取独弧昌信息失败:', error);
    return createDuHuChang();
  }
};
