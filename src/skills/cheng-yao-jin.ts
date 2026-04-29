import type { Skill, General, GeneralRarity } from "./types";

const CHENG_YAO_JIN_QUOTES = {
  skill: [
    "三斧子劈脑袋，小鬼都难逃！",
    "瓦岗寨上逞英豪，谁敢挡我！",
    "斧落人亡，天意如此！"
  ],
  death: ["三板斧已尽，瓦岗雄风犹在..."]
} as const;

const CHENG_YAO_JIN_BASE = {
  id: 33,
  name: "程咬金",
  rarity: "rare" as GeneralRarity,
  attack: 88,
  attackGrowth: 2.82,
  defense: 72,
  defenseGrowth: 2.18,
  strategy: 45,
  strategyGrowth: 1.12,
  speed: 86,
  speedGrowth: 2.78,
  attackRange: 2,
  siege: 58,
  siegeGrowth: 1.78,
  level: 5,
  command: 88,
  commandGrowth: 2.82,
  leadership: 2.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/cheng_yao_jin.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: "",
  damageIncrease: 0,
  damageIncreaseSource: "",
  // 三板斧状态
  isFirstAttackBoosted: false,
  attackBonusStacks: 0,
  maxAttackBonusStacks: 10,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 程咬金自带战法【三板斧】
export const createChengYaoJinSkill = (): Skill => ({
  id: "san-ban-fu",
  name: "三板斧",
  type: "passive",
  description: "被动：前三回合首次攻击伤害+85%，每次攻击使自身下一次攻击+25%（不叠加），反击：受到攻击时35%概率反击100%伤害",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, attacker, currentRound } = context;

    // 战斗开始 → 标记前三回合首次攻击加成
    if (type === "battleStart" && event === "init") {
      general.skillEffects.isFirstAttackBoosted = true;
      general.skillEffects.attackBonusStacks = 0;
      if (addReport) {
        addReport(`【${general.name}】发动【三板斧】，前三回合首次攻击伤害+85%！`);
      }
      return { triggered: true };
    }

    // 回合开始 → 重置首攻加成标记（前三回合）
    if (type === "turnStart" && event === "init") {
      const round = typeof currentRound === 'number' ? currentRound : 1;
      if (round <= 3) {
        general.skillEffects.isFirstAttackBoosted = true;
      }
    }

    // 普攻时 → 首次攻击加成 + 叠层
    if (type === "normalAttack" && event === "beforeDamage") {
      const round = typeof currentRound === 'number' ? currentRound : 1;

      // 前三回合首次攻击 +85%
      if (round <= 3 && general.skillEffects.isFirstAttackBoosted) {
        if (addReport) {
          addReport(`【${general.name}】前三回合首次攻击，【三板斧】伤害+85%！`);
        }
        general.skillEffects.isFirstAttackBoosted = false;
      }

      // 每次攻击叠下一次+25%（不叠加，只刷新）
      if (general.skillEffects.attackBonusStacks < general.skillEffects.maxAttackBonusStacks) {
        general.skillEffects.attackBonusStacks += 1;
      }
      if (addReport) {
        addReport(`【${general.name}】攻击后，【三板斧】蓄力下一次攻击+${general.skillEffects.attackBonusStacks * 25}%！`);
      }

      return null;
    }

    // 受到攻击时 → 反击
    if (type === "attacked" && event === "beforeDamage") {
      if (attacker && Math.random() < 0.35) {
        const counterDamage = Math.max(
          0,
          Math.floor(general.attack * 1.0 - attacker.defense / 2)
        );
        attacker.troops = Math.max(0, attacker.troops - counterDamage);
        if (attacker.troops <= 0) {
          attacker.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】受到攻击，【三板斧】触发反击！对【${attacker.name}】造成${counterDamage}点物理伤害！`);
        }
      }
    }

    return null;
  },
});

export const createChengYaoJin = (): General => {
  const troops = calculateTroops(CHENG_YAO_JIN_BASE.command);
  return {
    ...CHENG_YAO_JIN_BASE,
    troops,
    maxTroops: troops,
    skills: [createChengYaoJinSkill()],
    skillEffects: {
      ...DEFAULT_SKILL_EFFECTS,
      isFirstAttackBoosted: true,
    },
    quotes: CHENG_YAO_JIN_QUOTES,
  };
};

export const fetchChengYaoJinFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/33`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(CHENG_YAO_JIN_BASE.command);
    return {
      ...CHENG_YAO_JIN_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createChengYaoJinSkill()],
      skillEffects: {
        ...DEFAULT_SKILL_EFFECTS,
        isFirstAttackBoosted: true,
      },
      quotes: CHENG_YAO_JIN_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取程咬金信息失败:", error);
    return createChengYaoJin();
  }
};
