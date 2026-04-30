<script setup lang="ts">
import type { MapEvent, Effect } from '../events/event-types';

defineProps<{
  visible: boolean;
  event: MapEvent | null;
}>();

const emit = defineEmits<{
  (e: 'select', choice: 'A' | 'B'): void;
}>();

const formatEffect = (effect: Effect): string => {
  const sign = effect.value >= 0 ? '+' : '';
  const pct = ['attack', 'defense', 'speed', 'strategy', 'attributePercent', 'moral'].includes(effect.type) ? '%' : '';
  const unit = effect.type === 'addGeneral' ? '名武将' : '';
  return `${sign}${effect.value}${pct}${unit} ${effectLabel(effect.type)}`;
};

const effectLabel = (type: string): string => {
  const labels: Record<string, string> = {
    gold: '金币',
    conscript: '征召',
    attack: '攻击',
    defense: '防御',
    speed: '速度',
    strategy: '谋略',
    attributePercent: '全属性',
    moral: '士气',
    specialBuff: '特殊增益',
    specialDebuff: '特殊减益',
    addGeneral: '武将',
  };
  return labels[type] || type;
};
</script>

<template>
  <Teleport to="body">
    <Transition name="event-panel">
      <div v-if="visible && event" class="event-mask">
        <div class="event-panel">
          <div class="event-header">
            <h2>{{ event.title }}</h2>
            <p class="source">出处：{{ event.narrativeSource }}</p>
          </div>

          <div class="narrative-box">
            <p>{{ event.narrative }}</p>
          </div>

          <div class="choices">
            <button class="choice-btn choice-a" @click="emit('select', 'A')">
              <div class="choice-label">{{ event.choiceA.label }}</div>
              <div class="choice-desc">{{ event.choiceA.description }}</div>
              <div class="choice-effects">
                <span v-for="(eff, idx) in event.choiceA.effects" :key="idx" class="effect-tag">
                  {{ formatEffect(eff) }}
                </span>
              </div>
            </button>

            <button class="choice-btn choice-b" @click="emit('select', 'B')">
              <div class="choice-label">{{ event.choiceB.label }}</div>
              <div class="choice-desc">{{ event.choiceB.description }}</div>
              <div class="choice-effects">
                <span v-for="(eff, idx) in event.choiceB.effects" :key="idx" class="effect-tag">
                  {{ formatEffect(eff) }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.event-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.event-panel {
  background: linear-gradient(135deg, #1a0a0a 0%, #2d1a1a 50%, #1a0a0a 100%);
  border: 2px solid #8b5cf6;
  border-radius: 16px;
  padding: 28px 36px;
  max-width: 720px;
  width: 92%;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow:
    0 0 60px rgba(139, 92, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
}

.event-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background:
    radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
    radial-gradient(ellipse at bottom, rgba(239, 68, 68, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.event-header {
  text-align: center;
  margin-bottom: 20px;
}

.event-header h2 {
  color: #fbbf24;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 4px;
  margin: 0 0 8px;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
}

.source {
  color: #9ca3af;
  font-size: 12px;
  margin: 0;
  font-style: italic;
}

.narrative-box {
  background: rgba(0, 0, 0, 0.4);
  border-left: 4px solid #8b5cf6;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.narrative-box p {
  color: #e8e8d8;
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
  font-family: 'Noto Serif SC', 'SimSun', serif;
}

.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.choice-btn {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.choice-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.choice-btn:hover::before {
  opacity: 1;
}

.choice-a {
  border: 2px solid rgba(74, 222, 128, 0.5);
  background: linear-gradient(145deg, rgba(5, 46, 22, 0.9), rgba(6, 78, 59, 0.7));
}

.choice-a::before {
  background: linear-gradient(145deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.05));
}

.choice-a:hover {
  border-color: #4ade80;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(74, 222, 128, 0.25);
}

.choice-a .choice-label {
  color: #4ade80;
}

.choice-b {
  border: 2px solid rgba(248, 113, 113, 0.5);
  background: linear-gradient(145deg, rgba(69, 10, 10, 0.9), rgba(127, 29, 29, 0.7));
}

.choice-b::before {
  background: linear-gradient(145deg, rgba(248, 113, 113, 0.15), rgba(220, 38, 38, 0.05));
}

.choice-b:hover {
  border-color: #f87171;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(248, 113, 113, 0.25);
}

.choice-b .choice-label {
  color: #f87171;
}

.choice-label {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 2px;
}

.choice-desc {
  font-size: 13px;
  color: #c4b5a0;
  line-height: 1.5;
}

.choice-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.effect-tag {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  color: #d4c4a8;
  border: 1px solid rgba(212, 196, 168, 0.2);
}

.event-panel-enter-active,
.event-panel-leave-active {
  transition: opacity 0.3s ease;
}

.event-panel-enter-active .event-panel,
.event-panel-leave-active .event-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.event-panel-enter-from,
.event-panel-leave-to {
  opacity: 0;
}

.event-panel-enter-from .event-panel,
.event-panel-leave-to .event-panel {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}

@media (max-width: 600px) {
  .choices {
    grid-template-columns: 1fr;
  }

  .event-panel {
    padding: 20px;
  }

  .event-header h2 {
    font-size: 20px;
  }
}
</style>
