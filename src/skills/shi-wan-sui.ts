import type { Skill, General, GeneralRarity } from "./types";

const SHI_WAN_SUI_QUOTES = {
  skill: ["平番之功，当仁不让！", "蛮夷乱边，某必平之！", "横刀立马，誓死不退！"],
  death: ["素贼害我，文帝误我..."]
} as const;

const SHI_WAN_SUI_BASE = {
  id: 42,
  name: "史万岁",
  rarity: "rare" as GeneralRarity,
  attack: 86,
  attackGrowth: 2.82,
  defense: 68,
  defenseGrowth: 2.08,
  strategy: 55,
  strategyGrowth: 1.52,
  speed: 85,
  speedGrowth: 2.82,
  attackRange: 2,
  siege: 58,
  siegeGrowth: 1.78,
  level: 5,
  command: 86,
  commandGrowth: 2.82,
  leadership: 2.5,
  isDead: false,
  dynasty: "隋朝",
  soldierType: "骑兵" as const,
  gender: "男",
  avatar: "/images/shi_wan_sui.jpg",
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
  speedBonus: 0,
  speedBonusSource: "",
  speedBonusDuration: 0,
};

const calculateTroops = (commandValue: number): number =>
  Math.floor(commandValue * 10);

export const createShiWanSuiSkill = (): Skill => ({
  id: "pingfan-hengsao",
  name: "平番横扫",
  type: "active",
  distance: 5,
  probability: 0.42,
  description: "主动：对2名敌方目标造成120%物理伤害，自身速度+15%持续2回合",
  effect: (general: General, context: any) => {
    if (!general.skillEffects) {
      general.skillEffects = { ...DEFAULT_SKILL_EFFECTS };
    }

    const { type, event, addReport, targets } = context;

    if (type === "activeSkill" && event === "trigger") {
      if (addReport) {
        addReport(`【${general.name}】发动【平番横扫】！`);
      }
      if (targets && targets.length > 0) {
        const hitTargets = targets.slice(0, 2);
        hitTargets.forEach((target: General) => {
          const damage = Math.max(0, Math.floor(general.attack * 1.20 - target.defense / 2));
          target.troops = Math.max(0, target.troops - damage);
          if (target.troops <= 0) {
            target.isDead = true;
          }
          if (addReport) {
            addReport(`【${general.name}】对【${target.name}】造成${damage}点物理伤害！`);
          }
        });
      }
      // 自身速度+15%持续2回合
      general.skillEffects.speedBonus = 0.15;
      general.skillEffects.speedBonusSource = `【${general.name}】的【平番横扫】`;
      general.skillEffects.speedBonusDuration = 2;
      if (addReport) {
        addReport(`【${general.name}】自身速度提升15%，持续2回合！`);
      }
      return { triggered: true };
    }

    // 速度加成时间递减
    if (type === "turnEnd" && general.skillEffects?.speedBonusDuration) {
      general.skillEffects.speedBonusDuration -= 1;
      if (general.skillEffects.speedBonusDuration <= 0) {
        general.skillEffects.speedBonus = 0;
        general.skillEffects.speedBonusSource = "";
      }
    }

    return null;
  },
});

export const createShiWanSui = (): General => {
  const troops = calculateTroops(SHI_WAN_SUI_BASE.command);
  return {
    ...SHI_WAN_SUI_BASE,
    troops,
    maxTroops: troops,
    skills: [createShiWanSuiSkill()],
    skillEffects: { ...DEFAULT_SKILL_EFFECTS },
    quotes: SHI_WAN_SUI_QUOTES,
  };
};

export const fetchShiWanSuiFromDatabase = async (API_BASE_URL: string): Promise<General | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/42`);
    if (!response.ok) throw new Error("获取人物信息失败");
    const characterData = await response.json();
    const troops = calculateTroops(SHI_WAN_SUI_BASE.command);
    return {
      ...SHI_WAN_SUI_BASE,
      id: characterData.id,
      name: characterData.name,
      dynasty: characterData.dynasty,
      gender: characterData.gender,
      avatar: characterData.avatar,
      troops,
      maxTroops: troops,
      skills: [createShiWanSuiSkill()],
      skillEffects: { ...DEFAULT_SKILL_EFFECTS },
      quotes: SHI_WAN_SUI_QUOTES,
    };
  } catch (error) {
    console.error("从数据库获取史万岁信息失败:", error);
    return createShiWanSui();
  }
};
