import type { Skill, General } from "./types";

// 杨素的基础属性常量
const YANG_SU_BASE = {
  id: 25,
  name: "杨素",
  attack: 92,
  attackGrowth: 2.50,
  defense: 85,
  defenseGrowth: 2.20,
  strategy: 80,
  strategyGrowth: 2.00,
  speed: 55,
  speedGrowth: 0.80,
  attackRange: 2,
  siege: 15,
  siegeGrowth: 0.75,
  level: 5,
  command: 94,
  commandGrowth: 2.40,
  leadership: 3.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yang_su.jpg",
};

// 杨素的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 杨素的自带战法【出塞破敌】
export const createYangSuSkill = (): Skill => {
  return {
    id: "chusai-podi",
    name: "出塞破敌",
    type: "active",
    description: "主动，发动概率40%，攻击范围2：对敌方前排造成130%物理伤害；若目标兵力低于50%，额外造成40%伤害。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, targets } = context;

      // 主动战法触发
      if (type === "activeSkill" && event === "trigger") {
        const triggerChance = 0.40;
        if (addReport) {
          addReport(
            `【${general.name}】尝试发动【出塞破敌】（发动概率：${(triggerChance * 100).toFixed(0)}%）`,
          );
        }

        if (Math.random() < triggerChance) {
          if (addReport) {
            addReport(`【${general.name}】成功发动【出塞破敌】！`);
          }

          // 对敌方前排造成130%物理伤害
          if (targets && targets.length > 0) {
            // 假设前2个为前排
            const frontTargets = targets.slice(0, 2);
            frontTargets.forEach((target: General) => {
              const baseDamage = Math.max(0, Math.floor(general.attack * 1.30 - target.defense / 2));

              // 若目标兵力低于50%，额外造成40%伤害
              const troopRatio = target.troops / target.maxTroops;
              let bonusDamage = 0;
              if (troopRatio < 0.5) {
                bonusDamage = Math.floor(baseDamage * 0.40);
                if (addReport) {
                  addReport(`【${target.name}】兵力不足50%，受到额外伤害！`);
                }
              }

              const totalDamage = baseDamage + bonusDamage;
              target.troops = Math.max(0, target.troops - totalDamage);

              if (target.troops <= 0) {
                target.isDead = true;
              }

              if (addReport) {
                addReport(`【${general.name}】对【${target.name}】造成${totalDamage}点物理伤害！`);
              }
            });
          }

          return { triggered: true };
        } else {
          if (addReport) {
            addReport(`【${general.name}】的【出塞破敌】未触发！`);
          }
          return { triggered: false };
        }
      }

      return null;
    },
  };
};

// 创建杨素武将数据
export const createYangSu = (): General => {
  const troops = calculateTroops(YANG_SU_BASE.command);

  return {
    ...YANG_SU_BASE,
    troops,
    maxTroops: troops,
    skills: [createYangSuSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: [
        "铁骑所至，皆为齑粉。",
        "破阵杀敌，如探囊取物。",
        "出塞千里，踏破贺兰山缺。"
      ],
      death: ["权倾一时，终归尘土..."]
    }
  };
};

// 从数据库获取杨素的详细信息
export const fetchYangSuFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/25`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(YANG_SU_BASE.command);

    return {
      ...YANG_SU_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYangSuSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "铁骑所至，皆为齑粉。",
          "破阵杀敌，如探囊取物。",
          "出塞千里，踏破贺兰山缺。"
        ],
        death: ["权倾一时，终归尘土..."]
      }
    };
  } catch (error) {
    console.error('从数据库获取杨素信息失败:', error);
    return createYangSu();
  }
};
