<template>
  <div class="card-container">
    <!-- 兵力条 -->
    <div class="troops-bar-container" :class="{ active: isBattleActive && general }">
      <div class="troops-bar" @mousedown.stop="handleTroopsBarMouseDown">
        <div
          class="troops-fill"
          :style="{
            width: general ? (general.troops / general.maxTroops) * 100 + '%' : '0%',
          }"
        ></div>
        <div class="troops-text">{{ general ? general.troops : 0 }}</div>
      </div>
    </div>

    <!-- 武将卡片 -->
    <div
      v-if="general"
      class="card"
      :class="[sideClass, {
        selected: isSelected,
        dead: general.isDead,
        attacking: isAttacking,
      }]"
      :style="{
        backgroundImage: `url(${avatarUrl})`,
        borderColor: borderColor,
      }"
      :data-card-side="side"
      :data-card-position="position"
      @contextmenu="handleContextMenu"
      @click="handleClick"
    >
      <div class="card-top">
        <div class="card-left-top">
          <div class="card-dynasty">{{ general.dynasty }}</div>
          <div class="card-name">{{ general.name }}</div>
        </div>
        <div class="card-right-top">
          <div class="card-stars">
            <span
              v-for="i in maxStar"
              :key="i"
              class="star"
              :class="{
                active: i <= synthStar,
                enhanced: synthStar > 0,
              }"
            >★</span>
          </div>
        </div>
      </div>

      <!-- 状态效果 + 羁绊 -->
      <StatusEffects :general="general" />
      <div v-if="activeBonds.length > 0" class="card-bonds">
        <span
          v-for="bond in activeBonds"
          :key="bond"
          class="bond-tag"
          :title="bond"
        >羁</span>
      </div>

      <div class="card-middle"></div>

      <!-- 定位标签 -->
      <div v-if="generalRoles.length > 0" class="card-roles">
        <span v-for="role in generalRoles" :key="role" class="role-tag">{{ role }}</span>
      </div>

      <!-- 底部信息 -->
      <div class="card-bottom">
        <div class="card-bottom-item">
          <span class="card-level">Lv.{{ general.level }}</span>
        </div>
        <div class="card-bottom-item">
          <span class="card-command">{{ general.leadership }}</span>
          <span class="card-bottom-label">统率</span>
        </div>
        <div class="card-bottom-item">
          <span class="card-soldier-type">{{ general.soldierType }}</span>
        </div>
        <div class="card-bottom-item">
          <span class="card-range">{{ general.attackRange }}</span>
          <span class="card-bottom-label">距</span>
        </div>
      </div>
    </div>

    <!-- 空槽位 -->
    <div v-else class="empty-slot">
      <span>{{ position }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { General, GeneralRarity } from "../skills/types";
import { RARITY_CONFIG } from "../skills/types";
import { getActiveBondNames } from "../skills/index";
import { getGeneralRole } from "../skills/role-utils";
import StatusEffects from "./StatusEffects.vue";

const RARITY_BORDER_COLORS: Record<GeneralRarity, string> = {
  common: "#6b7280",
  uncommon: "#22c55e",
  rare: "#a855f7",
  legendary: "#f59e0b",
};

const props = defineProps<{
  general: General | null | undefined;
  side: "player" | "enemy";
  position: "大营" | "中军" | "前锋";
  isSelected?: boolean;
  isAttacking?: boolean;
  isBattleActive?: boolean;
  apiBaseUrl: string;
  /** 同队武将，用于计算羁绊 */
  teamGenerals?: General[];
}>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "show-tooltip", event: MouseEvent): void;
  (e: "hide-tooltip"): void;
  (e: "troops-bar-mousedown", event: MouseEvent): void;
}>();

const sideClass = computed(() => props.side);

const avatarUrl = computed(() => {
  if (!props.general) return "";
  if (props.general.avatar) {
    return props.apiBaseUrl + props.general.avatar;
  }
  return (
    props.apiBaseUrl +
    `/public/images/ancient_character_${props.general.gender === "女" ? "women" : "men"}.webp`
  );
});

const synthStar = computed(() => {
  if (!props.general) return 0;
  const star = (props.general as General & { synthStar?: number }).synthStar;
  return typeof star === "number" ? Math.max(0, Math.min(5, star)) : 0;
});

const maxStar = computed(() => {
  if (!props.general) return 5;
  return RARITY_CONFIG[props.general.rarity]?.starLimit ?? 5;
});

const borderColor = computed(() => {
  if (!props.general) return "#8b6914";
  return RARITY_BORDER_COLORS[props.general.rarity] ?? "#8b6914";
});

const activeBonds = computed(() => {
  if (!props.general || !props.teamGenerals) return [];
  return getActiveBondNames(props.general.id, props.teamGenerals);
});

const generalRoles = computed(() => {
  if (!props.general) return [];
  return getGeneralRole(props.general);
});

const handleContextMenu = (event: MouseEvent) => {
  emit("show-tooltip", event);
};

const handleClick = () => {
  emit("hide-tooltip");
};

const handleTroopsBarMouseDown = (event: MouseEvent) => {
  if (props.side === "player") {
    emit("troops-bar-mousedown", event);
  }
};
</script>

<style scoped>
.card-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.troops-bar-container {
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.3s;
  z-index: 10;
}

.troops-bar-container.active {
  opacity: 1;
}

.troops-bar {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #8b7355;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.troops-fill {
  height: 100%;
  background: linear-gradient(90deg, #2d5016 0%, #4a7c23 50%, #2d5016 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.troops-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #f5f5dc;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

.card {
  width: 100%;
  height: 100%;
  border: 2px solid #8b6914;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.card.selected {
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.card.dead {
  filter: grayscale(100%);
  opacity: 0.6;
}

.card.attacking {
  animation: attack-pulse 0.5s ease-in-out;
}

@keyframes attack-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.card-top {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
}

.card-left-top {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-dynasty {
  color: #ffd700;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.card-name {
  color: #f5f5dc;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.card-right-top {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.card-stars {
  display: flex;
  gap: 1px;
}

.star {
  color: #666;
  font-size: 12px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.star.active {
  color: #ffd700;
}

.star.active.enhanced {
  color: #ff6b6b;
  text-shadow: 0 0 4px rgba(255, 107, 107, 0.6);
}

.card-middle {
  flex: 1;
}

.card-bonds {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 0 4px;
}

.bond-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  background: linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%);
  border: 1px solid #3a7abd;
  color: #ffd700;
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.4);
  cursor: help;
}

.card-role {
  position: absolute;
  top: 45px;
  left: 8px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd700;
  border: 1px solid #ffd700;
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.4);
}

.card-roles {
  position: absolute;
  top: 45px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  max-width: 80%;
}

.role-tag {
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd700;
  border: 1px solid #ffd700;
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.4);
  white-space: nowrap;
}

.card-bottom {
  display: flex;
  justify-content: space-around;
  padding: 8px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
}

.card-bottom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.card-level {
  color: #ffd700;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.card-command {
  color: #90ee90;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.card-bottom-label {
  color: #aaa;
  font-size: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.card-soldier-type {
  color: #87ceeb;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.card-range {
  color: #ffa07a;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #8b7355;
  border-radius: 8px;
  background: rgba(139, 115, 85, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.empty-slot:hover {
  background: rgba(139, 115, 85, 0.3);
  border-color: #a08060;
}

.empty-slot span {
  color: #8b7355;
  font-size: 18px;
  font-weight: bold;
}
</style>
