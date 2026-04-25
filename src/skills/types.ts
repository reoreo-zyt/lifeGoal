// 兵种类型
export type SoldierType = "步兵" | "弓兵" | "骑兵";

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
  quotes?: {
    skill: string[];
    death: string[];
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
