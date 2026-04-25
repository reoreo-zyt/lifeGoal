import type { Skill, General } from "./types";

// 韦世康的基础属性常量
const WEI_SHI_KANG_BASE = {
  id: 71,
  name: "韦世康",
  attack: 41,
  attackGrowth: 0.72,
  defense: 60,
  defenseGrowth: 1.12,
  strategy: 85,
  strategyGrowth: 2.48,
  speed: 25,
  speedGrowth: 0.66,
  attackRange: 3,
  siege: 10,
  siegeGrowth: 0.48,
  level: 5,
  command: 82,
  commandGrowth: 1.95,
  leadership: 3.0,
  isDead: false,
  dynasty: "隋",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/wei_shi_kang.jpg",
};

// 韦世康的skillEffects默认值
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
  skillTriggerReduction: 0,
  skillTriggerReductionDuration: 0,
  skillTriggerReductionSource: '',
  defenseReduction: 0, // 防御降低效果
  defenseReductionDuration: 0, // 防御降低持续回合
  defenseReductionSource: '', // 防御降低来源
};

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 韦世康的自带战法【慎德安众】
export const createWeiShiKangSkill = (): Skill => {
  return {
    id: "shende-anzhong",
    name: "慎德安众",
    type: "active",
    description: "主动，发动概率 33%，攻击范围 3：对敌军单体造成 105% 策略伤害，削减目标 7% 防御，持续 2 回合；安抚我军单体，清除一项负面状态，并小幅回复兵力，恢复率 110%。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets, allies } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        // 33% 的发动概率
        const triggerChance = 0.33;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【慎德安众】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }

        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(
              `【${general.name}】成功发动【慎德安众】！`,
            );
          }

          // 对敌军单体造成 105% 策略伤害，削减目标 7% 防御，持续 2 回合
          if (targets && targets.length > 0) {
            const target = targets[0];
            // 计算策略伤害：攻击方策略值 * 105% - 防御方策略值 / 2
            const damage = Math.max(0, Math.floor(general.strategy * 1.05 - target.strategy / 2));
            target.troops = Math.max(0, target.troops - damage);

            // 兵力降为0时标记死亡
            if (target.troops <= 0) {
              target.isDead = true;
            }

            // 削减目标 7% 防御，持续 2 回合
            if (!target.skillEffects) {
              target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            target.skillEffects.defenseReduction = 0.07;
            target.skillEffects.defenseReductionDuration = 2;
            target.skillEffects.defenseReductionSource = `【${general.name}】的【慎德安众】`;

            if (addReport) {
              addReport(
                `【${general.name}】对【${target.name}】造成${damage}点策略伤害，并削减其7%防御，持续2回合！`,
              );
            }
          }

          // 安抚我军单体，清除一项负面状态，并小幅回复兵力，恢复率 110%
          if (allies && allies.length > 0) {
            const ally = allies[0];
            // 清除负面状态（这里简化为清除所有持续减益效果）
            if (ally.skillEffects) {
              ally.skillEffects.damageOutputReduction = 0;
              ally.skillEffects.damageOutputReductionDuration = 0;
              ally.skillEffects.skillTriggerReduction = 0;
              ally.skillEffects.skillTriggerReductionDuration = 0;
              ally.skillEffects.defenseReduction = 0;
              ally.skillEffects.defenseReductionDuration = 0;
              if (addReport) {
                addReport(`【${ally.name}】的负面状态已被清除！`);
              }
            }

            // 回复兵力，恢复率 110%
            const recoveryAmount = Math.floor(general.strategy * 1.10);
            ally.troops = Math.min(ally.maxTroops, ally.troops + recoveryAmount);

            if (addReport) {
              addReport(
                `【${general.name}】安抚【${ally.name}】，清除负面状态并恢复${recoveryAmount}点兵力！`,
              );
            }
          }

          return { triggered: true };
        } else {
          if (addReport) {
            addReport(
              `【${general.name}】的【慎德安众】未触发！`,
            );
          }
          return { triggered: false };
        }
      }

      // 角色回合开始时减少防御降低的持续回合
      if (type === "turnStart") {
        if (general.skillEffects.defenseReductionDuration > 0) {
          general.skillEffects.defenseReductionDuration -= 1;
          if (addReport) {
            addReport(
              `【${general.name}】的防御降低效果剩余${general.skillEffects.defenseReductionDuration}回合`,
            );
          }
          if (general.skillEffects.defenseReductionDuration === 0) {
            const source = general.skillEffects.defenseReductionSource || "";
            general.skillEffects.defenseReduction = 0;
            general.skillEffects.defenseReductionSource = '';
            if (addReport) {
              addReport(
                `【${general.name}】${source}的防御降低效果结束！`,
              );
            }
          }
        }
      }

      // 攻击前应用防御降低效果
      if (type === "attack" && event === "beforeAttack") {
        if (general.skillEffects.defenseReduction > 0) {
          return { damageIncrease: general.skillEffects.defenseReduction };
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

// 创建韦世康武将数据
export const createWeiShiKang = (): General => {
  const troops = calculateTroops(WEI_SHI_KANG_BASE.command);

  return {
    ...WEI_SHI_KANG_BASE,
    troops,
    maxTroops: troops,
    skills: [createWeiShiKangSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: [
        "宽以御民，静以安邦。",
        "居官守心，以德化人。"
      ],
      death: ["立身清正，一生简静，足矣。"]
    }
  };
};

// 从数据库获取韦世康的详细信息（包括头像）
export const fetchWeiShiKangFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/9001`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(WEI_SHI_KANG_BASE.command);

    return {
      ...WEI_SHI_KANG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createWeiShiKangSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "宽以御民，静以安邦。",
          "居官守心，以德化人。"
        ],
        death: ["立身清正，一生简静，足矣。"]
      }
    };
  } catch (error) {
    console.error('从数据库获取韦世康信息失败:', error);
    return createWeiShiKang();
  }
};
