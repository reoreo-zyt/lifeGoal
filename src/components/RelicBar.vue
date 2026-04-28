<template>
  <div class="relic-bar">
    <div
      v-for="relic in relics"
      :key="relic.id"
      class="relic-item"
      :class="`rarity-${relic.rarity}`"
      :title="getRelicTooltip(relic)"
    >
      <span class="relic-icon">{{ relic.icon }}</span>
      <span class="relic-name">{{ relic.name }}</span>
    </div>
    <div v-if="relics.length === 0" class="relic-item empty">{{ emptyText }}</div>
  </div>
</template>

<script setup lang="ts">
import type { Relic } from "../relics";
import { getRelicTooltip } from "../relics";

withDefaults(
  defineProps<{
    relics: Relic[];
    emptyText?: string;
  }>(),
  {
    emptyText: "未选择遗物",
  }
);
</script>

<style scoped>
.relic-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  min-height: 40px;
}

.relic-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(139, 115, 85, 0.3);
  border: 1px solid rgba(139, 115, 85, 0.5);
  cursor: help;
  transition: all 0.2s;
}

.relic-item:hover {
  background: rgba(139, 115, 85, 0.5);
  transform: translateY(-1px);
}

.relic-item.rarity-common {
  border-color: #9e9e9e;
  background: rgba(158, 158, 158, 0.2);
}

.relic-item.rarity-uncommon {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
}

.relic-item.rarity-rare {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.2);
}

.relic-item.rarity-legendary {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.2);
}

.relic-icon {
  font-size: 16px;
}

.relic-name {
  font-size: 12px;
  color: #f5f5dc;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.relic-item.empty {
  color: #8b7355;
  font-style: italic;
  cursor: default;
}
</style>
