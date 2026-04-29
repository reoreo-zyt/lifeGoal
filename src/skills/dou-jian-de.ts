import type { Skill, General, GeneralRarity } from "./types";

const DOU_JIAN_DE_QUOTES = {
  skill: [
    "夏王义旗，天下归心！",
    "替天行道，吊民伐罪！",
    "义军所至，敌军瓦解！"
  ],
  death: ["夏王基业，付之一炬..."]
} as const;

const DOU_JIAN_DE_BASE = {
  id: 601,
  name: "窦建德",
  rarity: "uncommon" as GeneralRarity,
  attack: 75,
  attackGrowth: 2.48,
  defense: 68,
  defenseGrowth: 2.18,
  strategy: 62,
  strategyGrowth: 1.92,
  speed: 70,
  speedGrowth: 2.28,
  attackRange: 2,
  siege: 58,
  siegeGrowth: 1.78,
  level: 4,
  command: 75,
  commandGrowth: 2.48,
  leadership: 2.0,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/dou_jian_de.jpg",
};

const DEFAULT_SKILL_EFFECTS = {
  damageBonusForHigherHP: 0,
  damageBonusSource: "",
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

// 窦建德自带战法【夏王义旗】
export const createDouJianDeSkill = (): Skill => ({
  id: "xiawang-yiqi",
  name: "夏王义旗",
  type: "active",
  distance: 4,
  probability: 0.44,
  description: "主动：对敌方单体造成165%物理伤害，距离4，概率44%，若目标当前兵力高于自身则伤害+35%",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    // 主动战法触发
    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【夏王义旗】！`);
      }
      if (targets && targets.length > 0) {
        const target = targets[0];
        // 若目标当前兵力高于自身则伤害+35%
        const targetHPPct = target.troops / target.maxTroops;
        const selfHPPct = general.troops / general.maxTroops;
        let multiplier = 1.65;
        if (targetHPPct > selfHPPct) {
          multiplier = 2.00; // 165% + 35% = 200%
          if (addReport) {
            addReport(`【${target.name}】兵力高于【${general.name}】，伤害+35%！`);
          }
        }
        const damage = Math.max(0, Math.floor(general.attack * multiplier - target.defense / 2));
        target.troops = Math.max(0, target.troops - damage);
        if (target.troops <= 0) {
          target.isDead = true;
        }
        if (addReport) {
          addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！`);
        }
      }
      return { triggered: true };
    }

    return null;
  },
});

export const createDouJianDe = (): General => {
  const troops = calculateTroops(DOU_JIAN_DE_BASE.command);
  return {
    ...DOU_JIAN_DE_BASE,
    troops,
    maxTroops: troops,
    skills: [createDouJianDeSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: DOU_JIAN_DE_QUOTES,
  };
};

export const fetchDouJianDeFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/601`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(DOU_JIAN_DE_BASE.command);
    return {
      ...DOU_JIAN_DE_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createDouJianDeSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: DOU_JIAN_DE_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取窦建德信息失败:", error);
    return createDouJianDe();
  }
};