import type { Skill, General } from "./types";

// 尉迟迥的基础属性常量
const YUCHI_JIONG_BASE = {
  id: 633,
  name: "尉迟迥",
  attack: 96,
  attackGrowth: 2.72,
  defense: 102,
  defenseGrowth: 2.35,
  strategy: 42,
  strategyGrowth: 0.7,
  speed: 38,
  speedGrowth: 0.52,
  attackRange: 2,
  siege: 18,
  siegeGrowth: 0.85,
  level: 5,
  command: 92, // 统御值
  commandGrowth: 2.2,
  leadership: 3.5, // 统率值，用于组建队伍
  isDead: false,
  dynasty: "北周",
  soldierType: "步兵" as const,
  gender: "男",
  avatar: "/images/yuchi_jiong.jpg",
};

// 尉迟迥的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0.25,
  attributeBonus: 0,
  maxAttributeBonus: 4,
  damageIncrease: 0,
  hasTriggeredRecovery: false,
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 尉迟迥的自带战法【危壁霸临】
export const createYuchiJiongSkill = (): Skill => {
  return {
    id: "weibi-baling",
    name: "危壁霸临",
    type: "passive",
    description: "被攻击时受到物理伤害减25%；回合结束兵力低于70%全属性+8%至多4层；兵力低于50%增伤20%；首次兵力跌破30%净化负面并回复15%兵力，单局一次。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, currentTroops, maxTroops, addReport } = context;

      // 被攻击时受到物理伤害减25%
      if (type === "attacked" && event === "beforeDamage") {
        return { damageReduction: general.skillEffects.damageReduction };
      }

      // 回合结束兵力低于70%全属性+8%至多4层
      if (type === "turnEnd") {
        const troopPercentage = currentTroops / maxTroops;
        if (
          troopPercentage < 0.7 &&
          general.skillEffects.attributeBonus <
            general.skillEffects.maxAttributeBonus
        ) {
          general.skillEffects.attributeBonus += 1;
          const bonus = general.skillEffects.attributeBonus * 0.08;
          general.attack *= 1 + bonus;
          general.defense *= 1 + bonus;
          general.strategy *= 1 + bonus;
          general.speed *= 1 + bonus;
          general.siege *= 1 + bonus;
          if (addReport) {
            addReport(
              `【${general.name}】触发【危壁霸临】，兵力低于70%，全属性提升8%，当前提升${(bonus * 100).toFixed(0)}%！`,
            );
          }
        }
      }

      // 兵力低于50%增伤20%
      if (type === "attack" && event === "beforeAttack") {
        const troopPercentage = currentTroops / maxTroops;
        if (troopPercentage < 0.5) {
          general.skillEffects.damageIncrease = 0.2;
          return { damageIncrease: general.skillEffects.damageIncrease };
        } else {
          general.skillEffects.damageIncrease = 0;
        }
      }

      // 首次兵力跌破30%净化负面并回复15%兵力，单局一次
      if (
        type === "troopChange" &&
        !general.skillEffects.hasTriggeredRecovery
      ) {
        const troopPercentage = currentTroops / maxTroops;
        if (troopPercentage < 0.3) {
          general.skillEffects.hasTriggeredRecovery = true;
          const recoveryAmount = Math.floor(maxTroops * 0.15);
          general.troops = Math.min(maxTroops, general.troops + recoveryAmount);
          if (addReport) {
            addReport(
              `【${general.name}】触发【危壁霸临】，兵力跌破30%，净化负面效果并回复15%兵力！`,
            );
            addReport(`【${general.name}】回复了${recoveryAmount}点兵力！`);
          }
        }
      }

      return null;
    },
  };
};

// 创建尉迟迥武将数据
export const createYuchiJiong = (): General => {
  const troops = calculateTroops(YUCHI_JIONG_BASE.command);

  return {
    ...YUCHI_JIONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuchiJiongSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
  };
};

// 从数据库获取尉迟迥的详细信息（包括头像）
export const fetchYuchiJiongFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/633`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();
    
    const troops = calculateTroops(YUCHI_JIONG_BASE.command);
    
    return {
      ...YUCHI_JIONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar, // 使用数据库中的头像
      troops,
      maxTroops: troops,
      skills: [createYuchiJiongSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    };
  } catch (error) {
    console.error('从数据库获取尉迟迥信息失败:', error);
    // 如果获取失败，返回默认数据
    return createYuchiJiong();
  }
};
 