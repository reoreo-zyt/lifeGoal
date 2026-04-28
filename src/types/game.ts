// 地图节点类型
export type NodeType =
  | "battle"
  | "elite"
  | "event"
  | "treasure"
  | "rest"
  | "shop"
  | "boss";

// 地图节点
export interface MapNode {
  id: string;
  floor: number;
  lane: number;
  yOffset: number;
  type: NodeType;
  linksTo: string[];
  visited: boolean;
}

// 跑图地图
export interface RunMap {
  act: number;
  floors: number;
  lanes: number;
  nodes: MapNode[];
  currentNodeId: string;
}

// 连接线
export interface MapLinkLine {
  id: string;
  path: string;
  reachable: boolean;
  visited: boolean;
}

// 图例项
export interface LegendItem {
  type: NodeType;
  label: string;
  icon: string;
}

// 战斗胜利奖励选项
export interface VictoryRewardOption {
  id: string;
  type: "gold" | "conscript" | "promote" | "layerHeal";
  icon: string;
  name: string;
  description: string;
  value: number;
}

// 游戏阶段
export type GamePhase = "map_select" | "encounter_resolve" | "reward_resolve" | "map_advance";

// 武将战斗快照
export type GeneralBattleSnapshot = {
  attack: number;
  defense: number;
  strategy: number;
  speed: number;
  siege: number;
  troops: number;
  maxTroops: number;
  isDead: boolean;
  skillEffects: Record<string, any>;
};
