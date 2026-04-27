<template>
  <div class="card-status">
    <div
      v-for="status in allStatuses"
      :key="status.key"
      class="status-icon"
      :class="status.type"
      :title="status.title"
    >
      <span class="status-icon-inner">{{ status.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { General } from '../skills/types';
import { getAllStatusList } from '../skills/status-config';

const props = defineProps<{
  general: General | null | undefined;
}>();

const allStatuses = computed(() => {
  return getAllStatusList(props.general?.skillEffects);
});
</script>

<style scoped>
.card-status {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: flex-start;
  align-items: flex-start;
  min-height: 20px;
  padding: 2px;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  cursor: help;
}

.status-icon.buff {
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
  border: 1px solid #4a9a44;
  color: #90ee90;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

.status-icon.debuff {
  background: linear-gradient(135deg, #5a2727 0%, #7a3737 100%);
  border: 1px solid #9a4444;
  color: #ff6b6b;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

.status-icon.neutral {
  background: linear-gradient(135deg, #4a4a4a 0%, #6a6a6a 100%);
  border: 1px solid #8a8a8a;
  color: #e0e0e0;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

.status-icon-inner {
  display: inline-block;
}
</style>
