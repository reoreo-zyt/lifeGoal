<template>
  <div class="player-side" :class="side">
    <div class="side-label">{{ sideLabel }}</div>

    <!-- 遗物栏 -->
    <RelicBar :relics="relics" :empty-text="relicEmptyText" style="margin-top: 94px;"/>

    <!-- 阵型 -->
    <div class="formation horizontal" :class="{ reverse: side === 'enemy' }" style="margin-top: 70px;">
      <!-- 大营 -->
      <div class="card-slot" @click="$emit('select-slot', positionMap.大营)">
        <GeneralCard
          :general="formation.大营"
          :side="side"
          position="大营"
          :is-selected="selectedSlot === slotKey.大营"
          :is-attacking="attackingCard === slotKey.大营"
          :is-battle-active="isBattleActive"
          :api-base-url="apiBaseUrl"
          :team-generals="teamGenerals"
          @select="$emit('select-slot', positionMap.大营)"
          @show-tooltip="(e) => $emit('show-tooltip', slotKey.大营, e)"
          @hide-tooltip="$emit('hide-tooltip')"
          @troops-bar-mousedown="(e) => $emit('troops-bar-mousedown', '大营', e)"
        />
      </div>

      <!-- 中军 -->
      <div class="card-slot" @click="$emit('select-slot', positionMap.中军)">
        <GeneralCard
          :general="formation.中军"
          :side="side"
          position="中军"
          :is-selected="selectedSlot === slotKey.中军"
          :is-attacking="attackingCard === slotKey.中军"
          :is-battle-active="isBattleActive"
          :api-base-url="apiBaseUrl"
          :team-generals="teamGenerals"
          @select="$emit('select-slot', positionMap.中军)"
          @show-tooltip="(e) => $emit('show-tooltip', slotKey.中军, e)"
          @hide-tooltip="$emit('hide-tooltip')"
          @troops-bar-mousedown="(e) => $emit('troops-bar-mousedown', '中军', e)"
        />
      </div>

      <!-- 前锋 -->
      <div class="card-slot" @click="$emit('select-slot', positionMap.前锋)">
        <GeneralCard
          :general="formation.前锋"
          :side="side"
          position="前锋"
          :is-selected="selectedSlot === slotKey.前锋"
          :is-attacking="attackingCard === slotKey.前锋"
          :is-battle-active="isBattleActive"
          :api-base-url="apiBaseUrl"
          :team-generals="teamGenerals"
          @select="$emit('select-slot', positionMap.前锋)"
          @show-tooltip="(e) => $emit('show-tooltip', slotKey.前锋, e)"
          @hide-tooltip="$emit('hide-tooltip')"
          @troops-bar-mousedown="(e) => $emit('troops-bar-mousedown', '前锋', e)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { General, FormationPosition } from "../skills/types";
import type { Relic } from "../relics";
import GeneralCard from "./GeneralCard.vue";
import RelicBar from "./RelicBar.vue";

interface Formation {
  大营: General | null;
  中军: General | null;
  前锋: General | null;
}

const props = defineProps<{
  side: "player" | "enemy";
  formation: Formation;
  relics: Relic[];
  selectedSlot: string | null;
  attackingCard: string | null;
  isBattleActive: boolean;
  apiBaseUrl: string;
}>();

defineEmits<{
  (e: "select-slot", payload: { side: "player" | "enemy"; position: FormationPosition }): void;
  (e: "show-tooltip", slotKey: string, event: MouseEvent): void;
  (e: "hide-tooltip"): void;
  (e: "troops-bar-mousedown", position: FormationPosition, event: MouseEvent): void;
}>();

const sideLabel = computed(() => (props.side === "player" ? "我方" : "敌方"));
const relicEmptyText = computed(() => (props.side === "player" ? "未选择遗物" : "未选择遗物"));
const teamGenerals = computed(() =>
  [props.formation.大营, props.formation.中军, props.formation.前锋].filter(
    (g): g is General => g !== null,
  ),
);

const positionMap = computed(() => ({
  大营: { side: props.side, position: "大营" as FormationPosition },
  中军: { side: props.side, position: "中军" as FormationPosition },
  前锋: { side: props.side, position: "前锋" as FormationPosition },
}));

const slotKey = computed(() => ({
  大营: `${props.side}-大营`,
  中军: `${props.side}-中军`,
  前锋: `${props.side}-前锋`,
}));
</script>

<style scoped>
.player-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.side-label {
  font-size: 18px;
  font-weight: bold;
  color: #f5f5dc;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(139, 115, 85, 0.5);
}

.formation {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.formation.horizontal {
  flex-direction: row;
}

.formation.horizontal.reverse {
  flex-direction: row-reverse;
}

.card-slot {
  width: 180px;
  height: 260px;
  position: relative;
}
</style>
