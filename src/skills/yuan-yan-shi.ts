import type { Skill, General } from "./types";

// 元岩的基础属性常量
const YUAN_YAN_BASE = {
  id: 515,
  name: "元岩",
  attack: 37,
  attackGrowth: 0.65,
  defense: 56,
  defenseGrowth: 1.03,
  strategy: 87,
  strategyGrowth: 2.58,
  speed: 22,
  speedGrowth: 0.60,
  attackRange: 3,
  siege: 8,
  siegeGrowth: 0.42,
  level: 5,
  command: 84,
  commandGrowth: 1.90,
  leadership: 3.0,
  isDead: false,
  dynasty: "北魏",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuan_yan.jpg",
};

// 元岩的skillEffects默认值
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
  defenseReduction: 0,
  defenseReductionDuration: 0,
  defenseReductionSource: '',
  recoveryFromDebuff: 0, // 来自直谏固朝的回血增益
  recoveryFromDebuffDuration: 0, // 回血增益持续回合
  recoveryFromDebuffSource: '', // 回血增益来源
};

const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 元岩的自带战法【直谏固朝】
export const createYuanYanSkill = (): Skill => {
  return {
    id: "zhijian-guchao",
    name: "直谏固朝",
    type: "command",
    description: "指挥战法：战斗全程，每回合开始时，若我军单体存在负面效果，小幅恢复其兵力（恢复率 95%）。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies } = context;

      // 指挥战法在每回合开始时检查并恢复我军兵力
      if (type === "command" && event === "turnStart") {
        console.log(`【${general.name}】的【直谏固朝】尝试触发！`);
        if (addReport) {
          addReport(`【${general.name}】的【直谏固朝】效果发动！`);
        }

        // 检查我军单体是否存在负面效果
        console.log(`检查友军，allies数量: ${allies?.length || 0}`);
        if (allies && allies.length > 0) {
          for (const ally of allies) {
            if (ally.isDead) continue;
            console.log(`检查【${ally.name}】的debuff状态:`, ally.skillEffects);

            // 检查是否存在负面效果
            const hasDebuff = (ally.skillEffects && (
              ally.skillEffects.damageOutputReduction > 0 ||
              ally.skillEffects.skillTriggerReduction > 0 ||
              ally.skillEffects.defenseReduction > 0
            ));

            console.log(`【${ally.name}】hasDebuff: ${hasDebuff}`);

            if (hasDebuff) {
              // 恢复兵力，恢复率 95%
              const recoveryAmount = Math.floor(general.strategy * 0.95);
              ally.troops = Math.min(ally.maxTroops, ally.troops + recoveryAmount);

              // 添加回血增益buff标记
              if (!ally.skillEffects) {
                ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS } as typeof DEFAULT_SKILL_EFFECTS;
              }
              ally.skillEffects.recoveryFromDebuff = 0.95;
              ally.skillEffects.recoveryFromDebuffDuration = 1;
              ally.skillEffects.recoveryFromDebuffSource = `【${general.name}】的【直谏固朝】`;

              console.log(`设置【${ally.name}】回血增益完成:`, ally.skillEffects);

              if (addReport) {
                addReport(
                  `【${ally.name}】存在负面效果，【${general.name}】为其恢复${recoveryAmount}点兵力，并获得1回合回血增益！`,
                );
              }
            }
          }
        }

        return { triggered: true };
      }

      return null;
    },
  };
};

// 创建元岩武将数据
export const createYuanYan = (): General => {
  const troops = calculateTroops(YUAN_YAN_BASE.command);

  return {
    ...YUAN_YAN_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuanYanSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
  };
};

// 从数据库获取元岩的详细信息（包括头像）
export const fetchYuanYanFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/515`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(YUAN_YAN_BASE.command);

    return {
      ...YUAN_YAN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuanYanSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    };
  } catch (error) {
    console.error('从数据库获取元岩信息失败:', error);
    return createYuanYan();
  }
};
