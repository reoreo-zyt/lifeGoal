// 兵种类型
export type SoldierType = "步兵" | "弓兵" | "骑兵";

// 阵型位置类型
export type FormationPosition = "大营" | "中军" | "前锋";

// 武将稀有度
export type GeneralRarity = "common" | "uncommon" | "rare" | "legendary";

// 稀有度配置（颜色/名称/星级上限）
export const RARITY_CONFIG: Record<GeneralRarity, {
  color: string;
  name: string;
  starLimit: number;
  weight: number;
}> = {
  common: {
    color: "#9ca3af",
    name: "★★ 白",
    starLimit: 2,
    weight: 60,
  },
  uncommon: {
    color: "#22c55e",
    name: "★★★ 绿",
    starLimit: 3,
    weight: 30,
  },
  rare: {
    color: "#a855f7",
    name: "★★★★ 紫",
    starLimit: 4,
    weight: 9,
  },
  legendary: {
    color: "#f59e0b",
    name: "★★★★★ 金",
    starLimit: 5,
    weight: 1,
  },
};

// 技能接口
export interface Skill {
  id: string;
  name: string;
  type: "command" | "active" | "passive";
  description: string;
  effect: (general: General, context: any) => void;
}

// 武将接口
export interface General {
  id: number;
  name: string;
  rarity: GeneralRarity;
  attack: number;
  attackGrowth: number;
  defense: number;
  defenseGrowth: number;
  strategy: number;
  strategyGrowth: number;
  speed: number;
  speedGrowth: number;
  attackRange: number;
  siege: number;
  siegeGrowth: number;
  troops: number;
  maxTroops: number;
  level: number;
  command: number;
  commandGrowth: number;
  leadership: number; // 统率值，用于组建队伍，值为2、2.5、3、3.5
  isDead: boolean;
  dynasty?: string;
  soldierType?: SoldierType;
  avatar?: string;
  gender?: string;
  skills?: Skill[];
  skillEffects?: {
    [key: string]: any;
  };
  /** 战斗开始时施加的全队策略增伤（百分比，如 0.15 表示 15%） */
  teamStrategyDamageIncrease?: number;
  /** 战斗开始时施加的全队普通防御提升（百分比） */
  teamDefenseBonus?: number;
  /** 战斗开始时对敌方高谋略目标施加的防御降低效果 */
  enemyDefenseReduction?: number;
  enemyDefenseReductionDuration?: number;
  enemyDefenseReductionSource?: string;
  /** 战斗开始时对敌方高谋略目标施加的谋略易伤（受到的谋略伤害增加） */
  enemyStrategyVulnerability?: number;
  enemyStrategyVulnerabilityDuration?: number;
  enemyStrategyVulnerabilitySource?: string;
  quotes?: {
    readonly skill: ReadonlyArray<string>;
    readonly death: ReadonlyArray<string>;
  };
}

// 速度单位接口
export interface SpeedUnit {
  id: string;
  general: General;
  side: "player" | "enemy";
  position: string;
  speed: number;
  isActive: boolean;
}
