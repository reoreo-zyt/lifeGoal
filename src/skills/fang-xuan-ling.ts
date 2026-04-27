import type { Skill, General } from "./types";

// 房玄龄的基础属性常量
const FANG_XUAN_LING_BASE = {
  id: 27,
  name: "房玄龄",
  attack: 50,
  attackGrowth: 0.85,
  defense: 65,
  defenseGrowth: 1.30,
  strategy: 102,
  strategyGrowth: 2.85,
  speed: 32,
  speedGrowth: 0.55,
  attackRange: 4,
  siege: 11,
  siegeGrowth: 0.55,
  level: 5,
  command: 88,
  commandGrowth: 2.20,
  leadership: 3.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/fang_xuan_ling.jpg",
};

// 房玄龄的skillEffects默认值
const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: '',
  attributeBonus: 0,
  attributeBonusSource: '',
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: '',
  hasTriggeredRecovery: false,
  hasAppliedCommand: false,
  isSilenced: false,
  silenceSource: '',
};

// 计算兵力
const calculateTroops = (commandValue: number): number => {
  return Math.floor(commandValue * 10);
};

// 房玄龄的自带战法【贞观良谋】
export const createFangXuanLingSkill = (): Skill => {
  return {
    id: "zhenguan-liangmou",
    name: "贞观良谋",
    type: "command",
    description: "指挥：战斗开始时，全体友军谋略+12%；每回合有35%概率使敌方随机1人陷入【沉默】（无法发动主动战法），持续1回合。",
    effect: (general: General, context: any) => {
      if (!general.skillEffects) {
        general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
      }

      const { type, event, addReport, allies, targets } = context;

      // 战斗开始时触发指挥战法
      if (type === "battleStart" && event === "init" && !general.skillEffects.hasAppliedCommand) {
        general.skillEffects.hasAppliedCommand = true;

        if (addReport) {
          addReport(`【${general.name}】发动【贞观良谋】，运筹帷幄，决胜千里！`);
        }

        // 为全体友军施加谋略加成
        if (allies && allies.length > 0) {
          allies.forEach((ally: General) => {
            if (!ally.skillEffects) {
              ally.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            // 谋略+12%
            ally.strategy = Math.floor(ally.strategy * 1.12);

            if (addReport) {
              addReport(`【${ally.name}】受到【贞观良谋】加持，谋略提升12%！`);
            }
          });
        }

        return { triggered: true };
      }

      // 回合开始时有35%概率使敌方随机1人陷入【沉默】
      if (type === "turnStart") {
        if (Math.random() < 0.35) {
          if (targets && targets.length > 0) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            if (!randomTarget.skillEffects) {
              randomTarget.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
            }
            randomTarget.skillEffects.isSilenced = true;
            randomTarget.skillEffects.silenceSource = `【${general.name}】的【贞观良谋】`;

            if (addReport) {
              addReport(`【${general.name}】的【贞观良谋】使【${randomTarget.name}】陷入【沉默】，无法发动主动战法！`);
            }
          }
        }
      }

      // 回合开始时检查沉默效果
      if (type === "turnStart" && general.skillEffects?.isSilenced) {
        if (addReport) {
          addReport(`【${general.name}】处于【沉默】状态，无法发动主动战法！`);
        }
        general.skillEffects.isSilenced = false;
      }

      // 主动战法触发前检查沉默效果
      if (type === "activeSkill" && event === "beforeTrigger" && general.skillEffects?.isSilenced) {
        return { blocked: true, reason: "沉默" };
      }

      return null;
    },
  };
};

// 创建房玄龄武将数据
export const createFangXuanLing = (): General => {
  const troops = calculateTroops(FANG_XUAN_LING_BASE.command);

  return {
    ...FANG_XUAN_LING_BASE,
    troops,
    maxTroops: troops,
    skills: [createFangXuanLingSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: {
      skill: [
        "房谋杜断，共治天下。",
        "为陛下分忧，臣之职也。",
        "贞观之治，始于良谋。"
      ],
      death: ["贞观之治，臣无憾矣..."]
    }
  };
};

// 从数据库获取房玄龄的详细信息
export const fetchFangXuanLingFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/27`);
    if (!response.ok) {
      throw new Error('获取人物信息失败');
    }
    const characterData = await response.json();

    const troops = calculateTroops(FANG_XUAN_LING_BASE.command);

    return {
      ...FANG_XUAN_LING_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createFangXuanLingSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: {
        skill: [
          "房谋杜断，共治天下。",
          "为陛下分忧，臣之职也。",
          "贞观之治，始于良谋。"
        ],
        death: ["贞观之治，臣无憾矣..."]
      }
    };
  } catch (error) {
    console.error('从数据库获取房玄龄信息失败:', error);
    return createFangXuanLing();
  }
};
