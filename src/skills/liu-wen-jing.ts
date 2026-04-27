import type { Skill, General } from "./types";

// 刘文静的基础属性常量
const LIU_WEN_JING_BASE = {
  id: 20,
  name: "刘文静",
  attack: 52,
  attackGrowth: 0.90,
  defense: 58,
  defenseGrowth: 1.10,
  strategy: 94,
  strategyGrowth: 2.60,
  speed: 45,
  speedGrowth: 0.70,
  attackRange: 3,
  siege: 10,
  siegeGrowth: 0.50,
  level: 5,
  command: 86,
  commandGrowth: 2.10,
  leadership: 3.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/liu_wen_jing.jpg",
};

// 刘文静的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  defenseReduction: 0,
  defenseReductionDuration: 0,
  defenseReductionSource: '',
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 刘文静的自带战法【晋阳之谋】
export const createLiuWenJingSkill = (): Skill => {
  return {
    id: "jinyang-zhimou",
    name: "晋阳之谋",
    type: "active",
    description: "主动，发动概率42%，攻击范围3：使敌方随机2人下回合受到110%谋略伤害；若自身兵力高于70%，额外使目标防御降低10%，持续1回合。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets, currentTroops, maxTroops } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        const triggerChance = 0.42;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【晋阳之谋】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }

        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(`【${general.name}】成功发动【晋阳之谋】！`);
          }

          // 使敌方随机2人下回合受到110%谋略伤害
          if (targets && targets.length > 0) {
            const selectedTargets = targets.slice(0, 2);
            selectedTargets.forEach((target: General) => {
              // 延迟伤害标记
              if (!target.skillEffects) {
                target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
              }
              // 这里简化处理，直接造成伤害
              const damage = Math.max(0, Math.floor(general.strategy * 1.10 - target.strategy / 2));
              target.troops = Math.max(0, target.troops - damage);

              if (target.troops <= 0) {
                target.isDead = true;
              }

              if (addReport) {
                addReport(`【${general.name}】的【晋阳之谋】对【${target.name}】造成${damage}点谋略伤害！`);
              }

              // 若自身兵力高于70%，额外使目标防御降低10%，持续1回合
              const troopRatio = currentTroops / maxTroops;
              if (troopRatio > 0.7) {
                target.skillEffects.defenseReduction = 0.10;
                target.skillEffects.defenseReductionDuration = 1;
                target.skillEffects.defenseReductionSource = `【${general.name}】的【晋阳之谋】`;

                if (addReport) {
                  addReport(`【${target.name}】的防御降低10%，持续1回合！`);
                }
              }
            });
          }

          return { triggered: true };
        } else {
          if (addReport) {
            addReport(`【${general.name}】的【晋阳之谋】未触发！`);
          }
          return { triggered: false };
        }
      }

      // 回合开始时减少防御降低的持续回合
      if (type === "turnStart") {
        if (general.skillEffects.defenseReductionDuration > 0) {
          general.skillEffects.defenseReductionDuration -= 1;
          if (addReport) {
            addReport(`【${general.name}】的防御降低效果剩余${general.skillEffects.defenseReductionDuration}回合`);
          }
          if (general.skillEffects.defenseReductionDuration === 0) {
            const source = general.skillEffects.defenseReductionSource || "";
            general.skillEffects.defenseReduction = 0;
            general.skillEffects.defenseReductionSource = '';
            if (addReport) {
              addReport(`【${general.name}】${source}的防御降低效果结束！`);
            }
          }
        }
      }

      return null;
    },
  };
};

// 创建刘文静武将数据
export const createLiuWenJing = (): General => {
  const troops = calculateTroops(LIU_WEN_JING_BASE.command);

  return {
    ...LIU_WEN_JING_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiuWenJingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: [
        "晋阳起兵，大业可成。",
        "与秦王共谋，定天下之策。",
        "运筹帷幄，决胜千里。"
      ],
      death: ["裴寂害我，死不瞑目..."]
    }
  };
};

// 从数据库获取刘文静的详细信息
export const fetchLiuWenJingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/20`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(LIU_WEN_JING_BASE.command);

    return {
      ...LIU_WEN_JING_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createLiuWenJingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "晋阳起兵，大业可成。",
          "与秦王共谋，定天下之策。",
          "运筹帷幄，决胜千里。"
        ],
        death: ["裴寂害我，死不瞑目..."]
      }
    };
  } catch (error) {
    console.error('从数据库获取刘文静信息失败:', error);
    return createLiuWenJing();
  }
};
