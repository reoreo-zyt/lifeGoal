import type { Skill, General } from "./types";

const LU_YAN_SHI_QUOTES = {
  skill: ["整肃风纪，以正朝纲。", "敦礼明伦，修身匡世。", "清身守道，不以权势屈节。"],
  death: ["正道难行，清节犹在，此生无愧名教。"]
} as const;

// 陆彦师的基础属性常量
const LU_YAN_SHI_BASE = {
  id: 588,
  name: "陆彦师",
  attack: 39,
  attackGrowth: 0.70,
  defense: 53,
  defenseGrowth: 1.00,
  strategy: 88,
  strategyGrowth: 2.55,
  speed: 22,
  speedGrowth: 0.65,
  attackRange: 3,
  siege: 9,
  siegeGrowth: 0.45,
  level: 5,
  command: 83, // 统御值
  commandGrowth: 2.00,
  leadership: 2.5, // 统率值，用于组建队伍
  isDead: false,
  dynasty: "北周",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/lu_yan_shi.jpg",
};

// 陆彦师的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  damageOutputReduction: 0,
  damageOutputReductionDuration: 0,
  damageOutputReductionSource: '',
  skillTriggerReduction: 0, // 主动战法发动概率降低
  skillTriggerReductionDuration: 0, // 主动战法发动概率降低持续回合
  skillTriggerReductionSource: '', // 主动战法发动概率降低效果来源
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 陆彦师的自带战法【清规守正】
export const createLuYanShiSkill = (): Skill => {
  return {
    id: "qinggui-shouzheng",
    name: "清规守正",
    type: "active",
    description: "主动，发动概率 32%，攻击范围 3：对敌军单体造成 110% 策略伤害，使其主动战法发动概率降低 6%，持续 2 回合；为我军单体恢复兵力，恢复率 115%。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets, allies } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        // 32% 的发动概率
        const triggerChance = 0.32;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【清规守正】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }
        
        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(
              `【${general.name}】成功发动【清规守正】！`,
            );
          }

          // 对敌军单体造成 110% 策略伤害
          if (targets && targets.length > 0) {
            const target = targets[0]; // 选择第一个目标
            // 计算策略伤害：攻击方策略值 * 110% - 防御方策略值 / 2
            const damage = Math.max(0, Math.floor(general.strategy * 1.10 - target.strategy / 2));
            target.troops = Math.max(0, target.troops - damage);
            
            // 兵力降为0时标记死亡
            if (target.troops <= 0) {
              target.isDead = true;
            }

            // 使其主动战法发动概率降低 6%，持续 2 回合
            if (!target.skillEffects) {
              target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            target.skillEffects.skillTriggerReduction = 0.06;
            target.skillEffects.skillTriggerReductionDuration = 2;
            target.skillEffects.skillTriggerReductionSource = `【${general.name}】的【清规守正】`;

            if (addReport) {
              addReport(
                `【${general.name}】对【${target.name}】造成${damage}点策略伤害，并降低其6%主动战法发动概率，持续2回合！`,
              );
            }
          }

          // 为我军单体恢复兵力，恢复率 115%
          if (allies && allies.length > 0) {
            const ally = allies[0]; // 选择第一个友军
            const recoveryAmount = Math.floor(general.strategy * 1.15);
            ally.troops = Math.min(ally.maxTroops, ally.troops + recoveryAmount);

            if (addReport) {
              addReport(
                `【${general.name}】为【${ally.name}】恢复${recoveryAmount}点兵力！`,
              );
            }
          }

          return { triggered: true };
        } else {
          if (addReport) {
            addReport(
              `【${general.name}】的【清规守正】未触发！`,
            );
          }
          return { triggered: false };
        }
      }

      // 角色回合开始时减少主动战法发动概率降低的持续回合
      if (type === "turnStart") {
        if (general.skillEffects.skillTriggerReductionDuration > 0) {
          general.skillEffects.skillTriggerReductionDuration -= 1;
          if (addReport) {
            addReport(
              `【${general.name}】的战法发动概率降低效果剩余${general.skillEffects.skillTriggerReductionDuration}回合`,
            );
          }
          if (general.skillEffects.skillTriggerReductionDuration === 0) {
            const source = general.skillEffects.skillTriggerReductionSource || "";
            general.skillEffects.skillTriggerReduction = 0;
            general.skillEffects.skillTriggerReductionSource = '';
            if (addReport) {
              addReport(
                `【${general.name}】${source}的战法发动概率降低效果结束！`,
              );
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

// 创建陆彦师武将数据
export const createLuYanShi = (): General => {
  const troops = calculateTroops(LU_YAN_SHI_BASE.command);

  return {
    ...LU_YAN_SHI_BASE,
    troops,
    maxTroops: troops,
    skills: [createLuYanShiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: LU_YAN_SHI_QUOTES,
  };
};

// 从数据库获取陆彦师的详细信息（包括头像）
export const fetchLuYanShiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/70`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(LU_YAN_SHI_BASE.command);

    return {
      ...LU_YAN_SHI_BASE,
      id: LU_YAN_SHI_BASE.id, // 使用固定的陆彦师ID
      name: LU_YAN_SHI_BASE.name, // 使用固定的陆彦师名字
      dynasty: LU_YAN_SHI_BASE.dynasty, // 使用固定的朝代
      gender: LU_YAN_SHI_BASE.gender, // 使用固定的性别
      avatar: characterData.avatar || LU_YAN_SHI_BASE.avatar, // 使用数据库中的头像，如果没有则使用默认头像
      troops,
      maxTroops: troops,
      skills: [createLuYanShiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "整肃风纪，以正朝纲。",
          "敦礼明伦，修身匡世。",
          "清身守道，不以权势屈节。"
        ],
        death: ["正道难行，清节犹在，此生无愧名教。"]
      }
    };
  } catch (error) {
    console.error('从数据库获取陆彦师信息失败:', error);
    // 如果获取失败，返回默认数据
    return createLuYanShi();
  }
};
