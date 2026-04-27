import type { Skill, General } from "./types";

// 高颎的基础属性常量
const GAO_JIONG_BASE = {
  id: 24,
  name: "高颎",
  attack: 48,
  attackGrowth: 0.85,
  defense: 62,
  defenseGrowth: 1.20,
  strategy: 100,
  strategyGrowth: 2.80,
  speed: 30,
  speedGrowth: 0.50,
  attackRange: 4,
  siege: 12,
  siegeGrowth: 0.60,
  level: 5,
  command: 90,
  commandGrowth: 2.20,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/gao_jiong.jpg",
};

// 高颎的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  skillTriggerReduction: 0,
  skillTriggerReductionDuration: 0,
  skillTriggerReductionSource: '',
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 高颎的自带战法【宰辅之谋】
export const createGaoJiongSkill = (): Skill => {
  return {
    id: "zaifu-zhimou",
    name: "宰辅之谋",
    type: "active",
    description: "主动，发动概率38%，攻击范围4：对敌方全体造成120%谋略伤害，使敌方随机1人主动战法发动概率降低8%，持续2回合。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        const triggerChance = 0.38;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【宰辅之谋】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }

        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(`【${general.name}】成功发动【宰辅之谋】！`);
          }

          // 对敌方全体造成120%谋略伤害
          if (targets && targets.length > 0) {
            targets.forEach((target: General) => {
              const damage = Math.max(0, Math.floor(general.strategy * 1.20 - target.strategy / 2));
              target.troops = Math.max(0, target.troops - damage);

              if (target.troops <= 0) {
                target.isDead = true;
              }

              if (addReport) {
                addReport(`【${general.name}】对【${target.name}】造成${damage}点谋略伤害！`);
              }
            });
          }

          // 使敌方随机1人主动战法发动概率降低8%，持续2回合
          if (targets && targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            if (!randomTarget.skillEffects) {
              randomTarget.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            randomTarget.skillEffects.skillTriggerReduction = 0.08;
            randomTarget.skillEffects.skillTriggerReductionDuration = 2;
            randomTarget.skillEffects.skillTriggerReductionSource = `【${general.name}】的【宰辅之谋】`;

            if (addReport) {
              addReport(`【${randomTarget.name}】的主动战法发动概率降低8%，持续2回合！`);
            }
          }

          return { triggered: true };
        } else {
          if (addReport) {
            addReport(`【${general.name}】的【宰辅之谋】未触发！`);
          }
          return { triggered: false };
        }
      }

      // 角色回合开始时减少持续回合
      if (type === "turnStart") {
        if (general.skillEffects.skillTriggerReductionDuration > 0) {
          general.skillEffects.skillTriggerReductionDuration -= 1;
          if (addReport) {
            addReport(`【${general.name}】的战法发动概率降低效果剩余${general.skillEffects.skillTriggerReductionDuration}回合`);
          }
          if (general.skillEffects.skillTriggerReductionDuration === 0) {
            const source = general.skillEffects.skillTriggerReductionSource || "";
            general.skillEffects.skillTriggerReduction = 0;
            general.skillEffects.skillTriggerReductionSource = '';
            if (addReport) {
              addReport(`【${general.name}】${source}的战法发动概率降低效果结束！`);
            }
          }
        }
      }

      // 主动战法触发前应用发动概率降低效果
      if (type === "activeSkill" && event === "beforeTrigger") {
        if (general.skillEffects.skillTriggerReduction > 0) {
          return { triggerReduction: general.skillEffects.skillTriggerReduction };
        }
      }

      return null;
    },
  };
};

// 创建高颎武将数据
export const createGaoJiong = (): General => {
  const troops = calculateTroops(GAO_JIONG_BASE.command);

  return {
    ...GAO_JIONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createGaoJiongSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: [
        "平陈之策，臣已熟虑。",
        "治国之道，在于任人。",
        "宰辅之责，安邦定国。"
      ],
      death: ["臣事隋室，死而无憾..."]
    }
  };
};

// 从数据库获取高颎的详细信息
export const fetchGaoJiongFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/24`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(GAO_JIONG_BASE.command);

    return {
      ...GAO_JIONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createGaoJiongSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "平陈之策，臣已熟虑。",
          "治国之道，在于任人。",
          "宰辅之责，安邦定国。"
        ],
        death: ["臣事隋室，死而无憾..."]
      }
    };
  } catch (error) {
    console.error('从数据库获取高颎信息失败:', error);
    return createGaoJiong();
  }
};
