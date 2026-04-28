<script setup lang="ts">
import type { Relic } from "../relics";
import type { VictoryRewardOption } from "../types/game";

type Option = Relic | VictoryRewardOption;

defineProps<{
  visible: boolean;
  title: string;
  dialogLine: string;
  portrait?: string;
  candidates: Option[];
  /** "relic" for relic candidates, "reward" for victory/layer reward */
  mode?: "relic" | "reward";
}>();

defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: "select", option: any): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="relic-selector-mask">
      <div class="relic-selector-panel" :class="{ 'reward-panel': mode === 'reward' }">
        <h3>{{ title }}</h3>
        <div class="cui-jue-dialog">
          <img
            class="cui-jue-portrait"
            :src="portrait || '/assets/cui_jue.webp'"
            alt="崔珏"
          />
          <div class="cui-jue-bubble">{{ dialogLine }}</div>
        </div>
        <div class="relic-candidate-list">
          <div
            v-for="option in candidates"
            :key="option.id"
            class="relic-candidate-card"
            :class="[
              'rarity-' + ('rarity' in option ? option.rarity : 'common'),
              mode === 'reward' ? 'reward-candidate-card' : ''
            ]"
            @click="$emit('select', option)"
          >
            <div class="relic-candidate-icon">{{ option.icon }}</div>
            <div class="relic-candidate-name">{{ option.name }}</div>
            <div class="relic-candidate-effect">
              {{ 'effectText' in option ? option.effectText : option.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.relic-selector-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.relic-selector-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #c9a84c;
  border-radius: 12px;
  padding: 24px 32px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 0 40px rgba(201, 168, 76, 0.3);
  position: relative;
}

.relic-selector-panel.reward-panel {
  border-color: #ffd700;
  box-shadow: 0 0 50px rgba(255, 215, 0, 0.25);
}

.relic-selector-panel h3 {
  text-align: center;
  color: #c9a84c;
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: 600;
  letter-spacing: 2px;
}

.relic-selector-panel.reward-panel h3 {
  color: #ffd700;
}

.cui-jue-dialog {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-left: 4px solid #c9a84c;
}

.relic-selector-panel.reward-panel .cui-jue-dialog {
  border-left-color: #ffd700;
}

.cui-jue-portrait {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #c9a84c;
  flex-shrink: 0;
}

.relic-selector-panel.reward-panel .cui-jue-portrait {
  border-color: #ffd700;
}

.cui-jue-bubble {
  color: #e8e8e8;
  font-size: 14px;
  line-height: 1.6;
  font-style: italic;
}

.relic-candidate-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relic-candidate-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(201, 168, 76, 0.3);
  border-radius: 10px;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.relic-candidate-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: currentColor;
  opacity: 0.7;
}

.relic-candidate-card.rarity-common::before { background: #9ca3af; }
.relic-candidate-card.rarity-uncommon::before { background: #22c55e; }
.relic-candidate-card.rarity-rare::before { background: #3b82f6; }
.relic-candidate-card.rarity-epic::before { background: #a855f7; }
.relic-candidate-card.rarity-legendary::before { background: #f59e0b; }

.relic-candidate-card:hover {
  background: rgba(201, 168, 76, 0.15);
  border-color: #c9a84c;
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(201, 168, 76, 0.2);
}

.relic-candidate-card.rarity-common { border-color: rgba(156, 163, 175, 0.4); }
.relic-candidate-card.rarity-uncommon { border-color: rgba(34, 197, 94, 0.4); }
.relic-candidate-card.rarity-rare { border-color: rgba(59, 130, 246, 0.4); }
.relic-candidate-card.rarity-epic { border-color: rgba(168, 85, 247, 0.4); }
.relic-candidate-card.rarity-legendary {
  border-color: rgba(245, 158, 11, 0.5);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(201, 168, 76, 0.05) 100%);
}

.relic-candidate-card.rarity-legendary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent);
  animation: legendary-shimmer 3s infinite;
}

@keyframes legendary-shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.relic-candidate-card.reward-candidate-card {
  background: rgba(255, 215, 0, 0.05);
  border-color: rgba(255, 215, 0, 0.3);
}

.relic-candidate-card.reward-candidate-card:hover {
  background: rgba(255, 215, 0, 0.15);
  border-color: #ffd700;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
}

.relic-candidate-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.relic-candidate-name {
  font-size: 15px;
  font-weight: 600;
  color: #e8e8e8;
  min-width: 120px;
}

.relic-candidate-card.rarity-common .relic-candidate-name { color: #9ca3af; }
.relic-candidate-card.rarity-uncommon .relic-candidate-name { color: #22c55e; }
.relic-candidate-card.rarity-rare .relic-candidate-name { color: #60a5fa; }
.relic-candidate-card.rarity-epic .relic-candidate-name { color: #c084fc; }
.relic-candidate-card.rarity-legendary .relic-candidate-name { color: #fbbf24; }

.relic-candidate-effect {
  font-size: 13px;
  color: #a0a0a0;
  line-height: 1.4;
  flex: 1;
}
</style>
