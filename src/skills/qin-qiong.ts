import type { Skill, General, GeneralRarity } from "./types";

const QIN_QIONG_QUOTES = {
  skill: [
    "马踏黄河两岸，锏打三州六府！",
    "瓦岗寨中逞英豪，凌烟阁上标姓名！",
    "大唐开国功臣，万古流芳！"
  ],
  death: ["一生戎马，未曾负过大唐..."]
} as const;

const QIN_QIONG_BASE = {
  id: 31,
  name: "秦琼",
  rarity: "rare" as GeneralRarity,
  attack: 85,
  attackGrowth: 2.68,
  defense: 78,
  defenseGrowth: 2.42,
  strategy: 52,
  strategyGrowth: 1.42,
  speed: 90,
  speedGrowth: 2.88,
  attackRange: 2,
  siege: 65,
  siegeGrowth: 1.98,
  level: 5,
  command: 85,
  commandGrowth: 2.68,
  leadership: 2.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/qin_qiong.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  pursuitChance: 0,
  pursuitChanceSource: "",
  pursuitDamage: 0,
  pursuitDamageSource: "",
  damageReduction: 0,
  damageReductionSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 秦琼自带战法【门神显圣】
export const createQinQiongSkill = (): Skill => ({
  id: "men-shen-xian-sheng",
  name: "门神显圣",
  type: "active",
  distance: 4,
  probability: 0.48,
  description: "主动：对单体造成195%物理伤害，30%概率使目标眩晕1回合，追击：普攻后40%概率追加90%伤害",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    // 主动战法触发
    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【门神显圣】！`);
      }
      if (targets && targets.length > 0) {
        const target = targets[0];
        const damage = Math.max(0, Math.floor(general.attack * 1.95 - target.defense / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！`);
        }
        // 30%概率眩晕1回合
        if (Math.random() < 0.30) {
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          target.skillEffects.isStunned = true;
          target.skillEffects.stunSource = `【${general.name}】的【门神显圣】`;
          if (addReport) {
            addReport(`【${target.name}】被眩晕，无法行动！`);
          }
        }
      }
      return { triggered: true };
    }

    // 追击效果：普攻后40%概率追加90%伤害
    if (type === "normalAttack" && event === "afterDamage") {
      if (Math.random() < 0.40) {
        if (!general.skillEffects.pursuitChance) {
          general.skillEffects.pursuitChance = 0.40;
          general.skillEffects.pursuitChanceSource = `【${general.name}】的【门神显圣】`;
        }
        const target = context.target;
        if (target) {
          const pursuitDamage = Math.max(0, Math.floor(general.attack * 0.90 - target.defense / 2));
          target.troops = Math.max(0, target.troops - pursuitDamage);
          if (addReport) {
            addReport(`【${general.name}】追击！对【${target.name}】追加${pursuitDamage}点物理伤害！`);
          }
        }
      }
    }

    return null;
  },
});

export const createQinQiong = (): General => {
  const troops = calculateTroops(QIN_QIONG_BASE.command);
  return {
    ...QIN_QIONG_BASE,
    troops,
    maxTroops: troops,
    skills: [createQinQiongSkill()],
    skillEffects: {
      ...DEFAULT_SKILL_EFFECTS,
      pursuitChance: 0.40,
      pursuitChanceSource: `【${QIN_QIONG_BASE.name}】的【门神显圣】`,
      pursuitDamage: 0.90,
      pursuitDamageSource: `【${QIN_QIONG_BASE.name}】的【门神显圣】`,
    },
    quotes: QIN_QIONG_QUOTES,
  };
};

export const fetchQinQiongFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/31`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(QIN_QIONG_BASE.command);
    return {
      ...QIN_QIONG_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createQinQiongSkill()],
      skillEffects: {
        ...DEFAULT_SKILL_EFFECTS,
        pursuitChance: 0.40,
        pursuitChanceSource: `【${QIN_QIONG_BASE.name}】的【门神显圣】`,
        pursuitDamage: 0.90,
        pursuitDamageSource: `【${QIN_QIONG_BASE.name}】的【门神显圣】`,
      },
      quotes: QIN_QIONG_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取秦琼信息失败:", error);
    return createQinQiong();
  }
};
