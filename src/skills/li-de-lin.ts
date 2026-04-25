import type { Skill, General } from "./types";

// 李德林的基础属性常量
const LI_DE_LIN_BASE = {
  id: 69,
  name: "李德林",
  attack: 47,
  attackGrowth: 0.81,
  defense: 59,
  defenseGrowth: 1.15,
  strategy: 97,
  strategyGrowth: 2.92,
  speed: 56,
  speedGrowth: 0.73,
  attackRange: 4,
  siege: 11,
  siegeGrowth: 0.55,
  level: 5,
  command: 91, // 统御值
  commandGrowth: 2.43,
  leadership: 3.0, // 统率值，用于组建队伍
  isDead: false,
  dynasty: "北齐",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/li_de_lin.jpg",
};

// 李德林的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  attributeBonus: 0,
  maxAttributeBonus: 4,
  damageIncrease: 0,
  hasTriggeredRecovery: false,
  damageOutputReduction: 0, // 伤害输出降低
  damageOutputReductionDuration: 0, // 伤害输出降低持续回合
  damageOutputReductionSource: '', // 伤害输出降低效果来源
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 李德林的自带战法【鸿笔定略】
export const createLiDeLinSkill = (): Skill => {
  return {
    id: "hongbi-dinglve",
    name: "鸿笔定略",
    type: "active",
    description: "主动，发动概率 42%，攻击范围 4：对敌军群体 2 人造成 152% 策略伤害，降低目标 14% 伤害输出，持续 2 回合。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        // 42% 的发动概率
        const triggerChance = 0.42;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【鸿笔定略】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }
        
        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(
              `【${general.name}】成功发动【鸿笔定略】！`,
            );
          }

          // 对敌军群体 2 人造成 152% 策略伤害
          if (targets && targets.length > 0) {
            const selectedTargets = targets.slice(0, 2); // 选择前2个目标
            selectedTargets.forEach((target: General) => {
              // 计算策略伤害：攻击方策略值 * 152% - 防御方策略值 / 2
              const damage = Math.max(0, Math.floor(general.strategy * 1.52 - target.strategy / 2));
              target.troops = Math.max(0, target.troops - damage);

              // 降低目标 14% 伤害输出，持续 2 回合
              if (!target.skillEffects) {
                target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
              }
              target.skillEffects.damageOutputReduction = 0.14;
              target.skillEffects.damageOutputReductionDuration = 2;
              target.skillEffects.damageOutputReductionSource = `【${general.name}】的【鸿笔定略】`;

              if (addReport) {
                addReport(
                  `【${general.name}】对【${target.name}】造成${damage}点策略伤害，并降低其14%伤害输出，持续2回合！`,
                );
              }
            });
          }

          return { triggered: true };
        } else {
          if (addReport) {
            addReport(
              `【${general.name}】的【鸿笔定略】未触发！`,
            );
          }
          return { triggered: false };
        }
      }

      // 角色回合开始时减少伤害输出降低的持续回合
      if (type === "turnStart") {
        if (general.skillEffects.damageOutputReductionDuration > 0) {
          general.skillEffects.damageOutputReductionDuration -= 1;
          if (addReport) {
            addReport(
              `【${general.name}】的降攻效果剩余${general.skillEffects.damageOutputReductionDuration}回合`,
            );
          }
          if (general.skillEffects.damageOutputReductionDuration === 0) {
            const source = general.skillEffects.damageOutputReductionSource || "";
            general.skillEffects.damageOutputReduction = 0;
            general.skillEffects.damageOutputReductionSource = '';
            if (addReport) {
              addReport(
                `【${general.name}】${source}的伤害输出降低效果结束！`,
              );
            }
          }
        }
      }

      // 攻击前应用伤害输出降低效果
      if (type === "attack" && event === "beforeAttack") {
        if (general.skillEffects.damageOutputReduction > 0) {
          return { damageReduction: general.skillEffects.damageOutputReduction };
        }
      }

      return null;
    },
  };
};

// 创建李德林武将数据
export const createLiDeLin = (): General => {
  const troops = calculateTroops(LI_DE_LIN_BASE.command);

  return {
    ...LI_DE_LIN_BASE,
    troops,
    maxTroops: troops,
    skills: [createLiDeLinSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
  };
};

// 从数据库获取李德林的详细信息（包括头像）
export const fetchLiDeLinFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/69`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(LI_DE_LIN_BASE.command);

    return {
      ...LI_DE_LIN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar, // 使用数据库中的头像
      troops,
      maxTroops: troops,
      skills: [createLiDeLinSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    };
  } catch (error) {
    console.error('从数据库获取李德林信息失败:', error);
    // 如果获取失败，返回默认数据
    return createLiDeLin();
  }
};
