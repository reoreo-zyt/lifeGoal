import type { Skill, General } from "./types";

const YU_CHI_GONG_QUOTES = {
  skill: [
    "玄武门前，谁敢放肆！",
    "铁骑踏处，敌阵瓦解！",
    "某家在此，谁敢来战！"
  ],
  death: ["主公...末将不能再护卫左右了..."]
} as const;

// 尉迟恭的基础属性常量
const YU_CHI_GONG_BASE = {
  id: 4,
  name: "尉迟恭",
  attack: 96,
  attackGrowth: 3.00,
  defense: 78,
  defenseGrowth: 2.10,
  strategy: 54,
  strategyGrowth: 1.20,
  speed: 58,
  speedGrowth: 0.95,
  attackRange: 1,
  siege: 12,
  siegeGrowth: 0.60,
  level: 5,
  command: 92,
  commandGrowth: 2.50,
  leadership: 4.0,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/yu_chi_gong.jpg",
};

// 尉迟恭的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  canCounterAttack: false,
  counterAttackDamage: 0.60,
  hasTaunt: false,
  tauntSource: '',
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 尉迟恭的自带战法【玄武铁骑】
export const createYuChiGongSkill = (): Skill => {
  return {
    id: "xuanwu-tieqi",
    name: "玄武铁骑",
    type: "command",
    description: "指挥：战斗开始时，自身获得【嘲讽】（敌人优先攻击自身）和60%反击效果，持续3回合；自身受到普通攻击后有35%概率进行强力反击（造成120%攻击伤害）。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, attacker, allies: _allies } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init") {
        if (addReport) {
          addReport(`【${general.name}】发动【玄武铁骑】，铁骑威武，震慑敌军！`);
        }

        // 自身获得嘲讽效果和反击能力
        general.skillEffects.canCounterAttack = true;
        general.skillEffects.counterAttackDamage = 0.60;
        general.skillEffects.hasTaunt = true;
        general.skillEffects.tauntSource = `【${general.name}】的【玄武铁骑】`;

        if (addReport) {
          addReport(`【${general.name}】获得【嘲讽】效果，敌人将优先攻击自身！`);
          addReport(`【${general.name}】获得60%反击效果，受到攻击时将进行反击！`);
        }

        return { triggered: true };
      }

      // 受到普通攻击时进行反击
      if (type === "attacked" && event === "afterDamage") {
        if (general.skillEffects.canCounterAttack && attacker) {
          const counterDamage = Math.floor(general.attack * general.skillEffects.counterAttackDamage);
          attacker.troops = Math.max(0, attacker.troops - counterDamage);

          if (attacker.troops <= 0) {
            attacker.isDead = true;
          }

          if (addReport) {
            addReport(`【${general.name}】受到攻击后发动【玄武铁骑】反击，对【${attacker.name}】造成${counterDamage}点伤害！`);
          }
        }

        // 35%概率进行强力反击（120%攻击伤害）
        if (Math.random() < 0.35 && attacker) {
          const strongCounterDamage = Math.floor(general.attack * 1.20);
          attacker.troops = Math.max(0, attacker.troops - strongCounterDamage);

          if (attacker.troops <= 0) {
            attacker.isDead = true;
          }

          if (addReport) {
            addReport(`【${general.name}】发动强力反击【玄武铁骑】，对【${attacker.name}】造成${strongCounterDamage}点伤害！`);
          }
        }
      }

      // 回合结束时检查嘲讽和反击效果是否过期（持续3回合）
      if (type === "turnEnd") {
        // 这里简化处理，实际应该在第3回合结束时移除
        // 由于我们没有完整的回合计数，暂时不自动移除
      }

      return null;
    },
  };
};

// 创建尉迟恭武将数据
export const createYuChiGong = (): General => {
  const troops = calculateTroops(YU_CHI_GONG_BASE.command);

  return {
    ...YU_CHI_GONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createYuChiGongSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: YU_CHI_GONG_QUOTES
  };
};

// 从数据库获取尉迟恭的详细信息
export const fetchYuChiGongFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/4`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(YU_CHI_GONG_BASE.command);

    return {
      ...YU_CHI_GONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createYuChiGongSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: YU_CHI_GONG_QUOTES
    };
  } catch (error) {
    console.error('从数据库获取尉迟恭信息失败:', error);
    return createYuChiGong();
  }
};
