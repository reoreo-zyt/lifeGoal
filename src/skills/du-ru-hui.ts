import type { Skill, General, GeneralRarity } from "./types";

const DU_RU_HUI_QUOTES = {
  skill: ["断则必行，行之必果。", "谋定而后动，动则必胜。", "当机立断，不容迟疑。"],
  death: ["天不假年，壮志未酬..."],
} as const;

const DU_RU_HUI_BASE = {
  id: 28,
  name: "杜如晦",
  rarity: "rare" as GeneralRarity,
  attack: 60,
  attackGrowth: 1.52,
  defense: 68,
  defenseGrowth: 2.08,
  strategy: 78,
  strategyGrowth: 2.68,
  speed: 44,
  speedGrowth: 1.22,
  attackRange: 3,
  siege: 50,
  siegeGrowth: 1.52,
  level: 4,
  command: 72,
  commandGrowth: 2.12,
  leadership: 2.5,
  isDead: false,
  dynasty: "唐朝",
  soldierType: "弓兵" as const,
  gender: "男",
  avatar: "/images/du_ru_hui.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  damageReduction: 0,
  damageReductionSource: "",
  attributeBonus: 0,
  attributeBonusSource: "",
  maxAttributeBonus: 4,
  damageIncrease: 0,
  damageIncreaseSource: "",
  hasTriggeredRecovery: false,
};

const calculateTroops = (commandValue: number): number => Math.floor(commandValue * 10);

// 当机立断 — 主动：对敌方随机2人造成80%谋略伤害，距离3，概率48%，驱散目标1个增益
export const createDuRuHuiSkill = (): Skill => ({
  id: "dangji-liduan",
  name: "当机立断",
  type: "active",
  distance: 3,
  probability: 0.48,
  description: "主动：对敌方随机2人造成80%谋略伤害，距离3，概率48%，驱散目标1个增益",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    const { type, event, addReport, enemies } = context;

    if (type === "activeSkill" && event === "trigger") {
      if (enemies && enemies.length > 0) {
        const aliveEnemies = enemies.filter((e: General): boolean => !e.isDead);
        if (aliveEnemies.length === 0) return null;
        // 随机选2人
        const targets: General[] = [];
        const pool = [...aliveEnemies];
        const count = Math.min(2, pool.length);
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * pool.length);
          targets.push(pool.splice(idx, 1)[0]);
        }
        if (addReport) {
          const names = targets.map((t) => `【${t.name}】`).join("和");
          addReport(`【${general.name}】发动【当机立断】，精准狙击${names}！`);
        }
        targets.forEach((target: General) => {
          if (!target.skillEffects) target.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
          // 驱散1个增益
          const effects = target.skillEffects;
          const dispelled: string[] = [];
          if (effects.damageReduction > 0) { effects.damageReduction = 0; effects.damageReductionSource = ""; dispelled.push("减伤"); }
          if (effects.attributeBonus > 0) { effects.attributeBonus = 0; effects.attributeBonusSource = ""; dispelled.push("属性加成"); }
          if (effects.damageIncrease > 0) { effects.damageIncrease = 0; effects.damageIncreaseSource = ""; dispelled.push("增伤"); }
          if (dispelled.length > 0 && addReport) {
            addReport(`【${target.name}】被驱散：${dispelled.join("、")}效果消失！`);
          }
          // 造成80%谋略伤害
          const damage = Math.max(0, Math.floor(general.strategy * 0.80 - target.strategy / 2));
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) target.isDead = true;
          if (addReport) addReport(`【${target.name}】受到${damage}点谋略伤害！`);
        });
        return { multiTarget: targets, damageMultiplier: 0.80, damageType: "strategy" as const };
      }
    }

    return null;
  },
});

export const createDuRuHui = (): General => {
  const troops = calculateTroops(DU_RU_HUI_BASE.command);
  return {
    ...DU_RU_HUI_BASE,
    troops,
    maxTroops: troops,
    skills: [createDuRuHuiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: DU_RU_HUI_QUOTES,
    rarity: DU_RU_HUI_BASE.rarity,
  };
};

export const fetchDuRuHuiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/28`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(DU_RU_HUI_BASE.command);
    return {
      ...DU_RU_HUI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createDuRuHuiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: DU_RU_HUI_QUOTES,
      rarity: DU_RU_HUI_BASE.rarity,
    };
  } catch (error) {
    console.error("从数据库获取杜如晦信息失败:", error);
    return createDuRuHui();
  }
};
