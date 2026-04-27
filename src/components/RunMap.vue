<template>
  <div class="event-map-panel" :class="{ 'in-drawer': inDrawer }">
    <div class="event-map-header">
      <span>事件树 · 当前可选层 {{ currentMapFloor }}</span>
    </div>
    <div class="event-map-board">
      <!-- 连接线 SVG -->
      <svg class="event-map-links" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          v-for="line in mapLinkLines"
          :key="line.id"
          :d="line.path"
          class="event-map-link"
          :class="{ reachable: line.reachable, visited: line.visited }"
        />
      </svg>

      <!-- 节点按钮 -->
      <button
        v-for="node in (runMap?.nodes || [])"
        :key="node.id"
        class="event-node-btn"
        :class="[
          `type-${node.type}`,
          {
            selectable: canSelectMapNode(node),
            visited: node.visited,
            pending: pendingNodeId === node.id,
            current: runMap?.currentNodeId === node.id,
          },
        ]"
        :style="getNodeStyle(node)"
        :disabled="!canSelectMapNode(node)"
        :title="`第${node.floor}层 · ${nodeTypeTitle[node.type]}`"
        @click="$emit('select-node', node)"
      >
        <img class="event-node-icon" :src="mapNodeIconByType[node.type]" :alt="nodeTypeTitle[node.type]" />
      </button>

      <!-- 图例 -->
      <div class="map-legend">
        <div class="map-legend-header">
          <div class="map-legend-title">图例</div>
          <button class="map-legend-toggle" @click="$emit('toggle-legend')">
            {{ isMapLegendCollapsed ? "展开" : "收起" }}
          </button>
        </div>
        <div v-if="!isMapLegendCollapsed">
          <div
            v-for="item in mapLegendItems"
            :key="item.type"
            class="map-legend-item"
          >
            <img class="map-legend-icon" :src="item.icon" :alt="item.label" />
            <span class="map-legend-text">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type NodeType =
  | "battle"
  | "elite"
  | "event"
  | "treasure"
  | "rest"
  | "shop"
  | "boss";

interface MapNode {
  id: string;
  floor: number;
  lane: number;
  yOffset: number;
  type: NodeType;
  linksTo: string[];
  visited: boolean;
}

interface RunMap {
  act: number;
  floors: number;
  lanes: number;
  nodes: MapNode[];
  currentNodeId: string;
}

interface MapLinkLine {
  id: string;
  path: string;
  reachable: boolean;
  visited: boolean;
}

interface LegendItem {
  type: NodeType;
  label: string;
  icon: string;
}

const props = defineProps<{
  runMap: RunMap | null;
  currentMapFloor: number;
  pendingNodeId: string | null;
  mapNodeIconByType: Record<NodeType, string>;
  nodeTypeTitle: Record<NodeType, string>;
  mapLegendItems: LegendItem[];
  isMapLegendCollapsed: boolean;
  inDrawer?: boolean;
}>();

defineEmits<{
  (e: "select-node", node: MapNode): void;
  (e: "toggle-legend"): void;
}>();

const MAP_CONFIG = {
  maxFloors: 12,
  maxNodesPerFloor: 3,
};

// 生成唯一楼层键
const floorKey = (floor: number) => floor;

// 按楼层分组节点
const groupByFloor = (nodes: MapNode[]) => {
  const groups = new Map<number, MapNode[]>();
  for (const node of nodes) {
    if (!groups.has(node.floor)) groups.set(node.floor, []);
    groups.get(node.floor)!.push(node);
  }
  return groups;
};

// 检查节点是否可选
const canSelectMapNode = (node: MapNode): boolean => {
  if (!props.runMap) return false;
  if (node.visited) return false;

  const currentNodeId = props.runMap.currentNodeId;
  if (currentNodeId === "start") {
    return node.floor === 1;
  }

  const currentNode = props.runMap.nodes.find((n) => n.id === currentNodeId);
  if (!currentNode) return false;

  // 只能选择下一层的节点
  if (node.floor !== currentNode.floor + 1) return false;

  // 检查是否有连接
  return currentNode.linksTo.includes(node.id);
};

// 计算杀戮尖塔风格的节点位置
const getNodeStyle = (node: MapNode) => {
  const floors = props.runMap?.floors || MAP_CONFIG.maxFloors;
  const floorGroups = groupByFloor(props.runMap?.nodes || []);
  const nodesInFloor = floorGroups.get(node.floor)?.length || 1;

  // 每层水平均匀分布，留边距
  const leftMargin = 8;
  const rightMargin = 8;
  const usableWidth = 100 - leftMargin - rightMargin;
  const floorSpacing = usableWidth / (floors - 1);
  const left = leftMargin + (node.floor - 1) * floorSpacing;

  // 同一层多个节点时，垂直方向均匀分布
  let top: number;
  if (nodesInFloor === 1) {
    top = 50;
  } else {
    const sortedByLane = [...floorGroups.get(node.floor)!].sort((a, b) => a.lane - b.lane);
    const idx = sortedByLane.indexOf(node);
    const step = 65 / (nodesInFloor - 1);
    top = 17 + idx * step;
  }

  return {
    top: `${top}%`,
    left: `${left}%`,
  };
};

// 计算连接线 - 杀戮尖塔风格曲线
const mapLinkLines = computed((): MapLinkLine[] => {
  if (!props.runMap) return [];

  const lines: MapLinkLine[] = [];
  const currentNodeId = props.runMap.currentNodeId;

  let currentNode: MapNode | undefined;
  if (currentNodeId !== "start") {
    currentNode = props.runMap.nodes.find((n) => n.id === currentNodeId);
  }

  for (const node of props.runMap.nodes) {
    for (const linkId of node.linksTo) {
      const target = props.runMap.nodes.find((n) => n.id === linkId);
      if (!target) continue;

      const start = getNodePoint(node);
      const end = getNodePoint(target);

      let reachable = false;
      let visited = false;

      if (currentNodeId === "start" && node.floor === 1) {
        reachable = true;
      } else if (currentNode) {
        if (node.visited && target.visited) {
          visited = true;
        }
        if (node.id === currentNodeId && !target.visited) {
          reachable = true;
        }
      }

      // 杀戮尖塔风格：使用贝塞尔曲线，起点和终点向水平方向弯曲
      const dx = end.x - start.x;
      const controlOffset = Math.min(Math.abs(dx) * 0.4, 20);
      const cp1x = start.x + controlOffset;
      const cp2x = end.x - controlOffset;
      const path = `M ${start.x} ${start.y} C ${cp1x} ${start.y}, ${cp2x} ${end.y}, ${end.x} ${end.y}`;

      lines.push({
        id: `${node.id}-${linkId}`,
        path,
        reachable,
        visited,
      });
    }
  }

  return lines;
});

// 计算节点坐标 - 与 getNodeStyle 保持一致
const getNodePoint = (node: MapNode) => {
  const floors = props.runMap?.floors || MAP_CONFIG.maxFloors;
  const floorGroups = groupByFloor(props.runMap?.nodes || []);
  const nodesInFloor = floorGroups.get(node.floor)?.length || 1;

  const leftMargin = 8;
  const rightMargin = 8;
  const usableWidth = 100 - leftMargin - rightMargin;
  const floorSpacing = usableWidth / (floors - 1);
  const x = leftMargin + (node.floor - 1) * floorSpacing;

  let y: number;
  if (nodesInFloor === 1) {
    y = 50;
  } else {
    const sortedByLane = [...floorGroups.get(node.floor)!].sort((a, b) => a.lane - b.lane);
    const idx = sortedByLane.indexOf(node);
    const step = 65 / (nodesInFloor - 1);
    y = 17 + idx * step;
  }

  return { x, y };
};
</script>

<style scoped>
.event-map-panel {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.event-map-header {
  padding: 8px 12px;
  background: rgba(139, 115, 85, 0.3);
  border-bottom: 1px solid rgba(139, 115, 85, 0.5);
  font-size: 14px;
  color: #f5f5dc;
  text-align: center;
}

.event-map-board {
  flex: 1;
  position: relative;
  min-height: 400px;
}

.event-map-links {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.event-map-link {
  fill: none;
  stroke: rgba(139, 115, 85, 0.3);
  stroke-width: 1.5;
  transition: stroke 0.3s;
}

.event-map-link.reachable {
  stroke: rgba(76, 175, 80, 0.5);
}

.event-map-link.visited {
  stroke: rgba(158, 158, 158, 0.35);
}

.event-node-btn {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 4px solid #8b7355;
  background: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  transition: all 0.2s;
  padding: 0;
}

.event-node-btn:hover:not(:disabled) {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 0 12px rgba(139, 115, 85, 0.6);
}

.event-node-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.event-node-btn.selectable {
  border-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  animation: pulse 2s infinite;
}

.event-node-btn.current {
  border-color: #ffeb3b;
  box-shadow: 0 0 15px rgba(255, 235, 59, 0.7);
}

.event-node-btn.pending {
  border-color: #ff9800;
  box-shadow: 0 0 15px rgba(255, 152, 0, 0.7);
}

.event-node-btn.visited {
  opacity: 0.6;
  border-color: #9e9e9e;
}

.event-node-btn.type-battle {
  background: rgba(244, 67, 54, 0.2);
}

.event-node-btn.type-elite {
  background: rgba(156, 39, 176, 0.2);
}

.event-node-btn.type-event {
  background: rgba(33, 150, 243, 0.2);
}

.event-node-btn.type-treasure {
  background: rgba(255, 193, 7, 0.2);
}

.event-node-btn.type-rest {
  background: rgba(76, 175, 80, 0.2);
}

.event-node-btn.type-shop {
  background: rgba(0, 150, 136, 0.2);
}

.event-node-btn.type-boss {
  background: rgba(0, 0, 0, 0.5);
  border-color: #f44336;
  width: 76px;
  height: 76px;
}

.event-node-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.event-node-btn.type-boss .event-node-icon {
  width: 44px;
  height: 44px;
}

.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(139, 115, 85, 0.6);
  border-radius: 8px;
  padding: 14px;
  min-width: 140px;
}

.map-legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.map-legend-title {
  font-size: 15px;
  color: #f5f5dc;
  font-weight: bold;
}

.map-legend-toggle {
  font-size: 12px;
  padding: 4px 10px;
  background: rgba(139, 115, 85, 0.3);
  border: 1px solid rgba(139, 115, 85, 0.5);
  border-radius: 4px;
  color: #f5f5dc;
  cursor: pointer;
}

.map-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.map-legend-icon {
  width: 26px;
  height: 26px;
}

.map-legend-text {
  font-size: 14px;
  color: #d4c4a8;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 0 16px rgba(76, 175, 80, 0.7);
  }
}
</style>
