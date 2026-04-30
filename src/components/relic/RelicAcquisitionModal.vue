<template>
  <Teleport to="body">
    <Transition name="modal-fade" @after-leave="onAfterLeave">
      <div v-if="visible && relic" class="acquisition-overlay" :class="`rarity-${relic.rarity}`" @click.self="handleClose">
        <!-- 遮罩背景 -->
        <div class="overlay-bg" :class="`bg-${relic.rarity}`" />

        <!-- 粒子容器 -->
        <RelicParticles :rarity="relic.rarity" class="particles-layer" />

        <!-- 金光光线（仅传说） -->
        <div v-if="relic.rarity === 'legendary'" class="light-rays" />

        <!-- 主卡片 -->
        <div class="relic-card" :class="`card-${relic.rarity}`">
          <!-- 稀有度标签 -->
          <div class="rarity-badge" :class="`badge-${relic.rarity}`">
            {{ rarityLabel }}
          </div>

          <!-- 光环（仅传说） -->
          <div v-if="relic.rarity === 'legendary'" class="card-halo" />

          <!-- 图标区 -->
          <div class="relic-icon-wrap" :class="`icon-${relic.rarity}`">
            <span class="relic-icon">{{ relic.icon }}</span>
          </div>

          <!-- 遗物名称 -->
          <Transition name="text-rise">
            <h2 v-if="showContent" class="relic-name" :class="`name-${relic.rarity}`">
              {{ relic.name }}
            </h2>
          </Transition>

          <!-- 典籍名（套装） -->
          <Transition name="text-rise">
            <div v-if="showContent && relic.lore" class="relic-history">
              {{ relic.lore }}
            </div>
          </Transition>

          <!-- 效果描述 -->
          <Transition name="text-rise">
            <div v-if="showContent" class="relic-effect" :class="`effect-${relic.rarity}`">
              {{ relic.effectText }}
            </div>
          </Transition>

          <!-- 确认按钮 -->
          <Transition name="btn-appear">
            <button v-if="showContent" class="confirm-btn" :class="`btn-${relic.rarity}`" @click="handleClose">
              收入囊中
            </button>
          </Transition>
        </div>

        <!-- 关闭提示 -->
        <div v-if="showContent" class="close-hint">点击任意处关闭</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Relic } from "../../relics/types";
import RelicParticles from "./RelicParticles.vue";

const props = defineProps<{
  visible: boolean;
  relic: Relic | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const showContent = ref(false);
const leaving = ref(false);

const rarityLabel = computed(() => {
  const map: Record<string, string> = {
    common: "普通",
    uncommon: "稀有",
    rare: "史诗",
    epic: "神话",
    legendary: "传说",
  };
  return map[props.relic?.rarity ?? "common"] ?? "普通";
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      showContent.value = false;
      leaving.value = false;
      // 延迟触发内容动画
      setTimeout(() => {
        showContent.value = true;
      }, 400);
    }
  }
);

function handleClose() {
  if (leaving.value) return;
  leaving.value = true;
  showContent.value = false;
  setTimeout(() => {
    emit("close");
    leaving.value = false;
  }, 300);
}

function onAfterLeave() {
  showContent.value = false;
}
</script>

<style scoped>
/* ===== 遮罩 ===== */
.acquisition-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.overlay-bg {
  position: absolute;
  inset: 0;
  transition: opacity 0.4s ease;
}

.overlay-bg.bg-common { background: rgba(0, 0, 0, 0.6); }
.overlay-bg.bg-uncommon { background: rgba(0, 20, 0, 0.7); }
.overlay-bg.bg-rare {
  background: radial-gradient(ellipse at center, rgba(88, 28, 135, 0.7) 0%, rgba(0, 0, 0, 0.85) 70%);
}
.overlay-bg.bg-epic {
  background: radial-gradient(ellipse at center, rgba(88, 28, 135, 0.7) 0%, rgba(0, 0, 0, 0.85) 70%);
}
.overlay-bg.bg-legendary {
  background: radial-gradient(ellipse at center, rgba(180, 120, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 60%);
}

/* ===== 粒子层 ===== */
.particles-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

/* ===== 传说金光射线 ===== */
.light-rays {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.light-rays::before,
.light-rays::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 215, 0, 0.15) 10deg,
    transparent 20deg,
    transparent 45deg,
    rgba(255, 215, 0, 0.15) 55deg,
    transparent 65deg,
    transparent 90deg,
    rgba(255, 215, 0, 0.15) 100deg,
    transparent 110deg,
    transparent 135deg,
    rgba(255, 215, 0, 0.15) 145deg,
    transparent 155deg,
    transparent 180deg,
    rgba(255, 215, 0, 0.15) 190deg,
    transparent 200deg,
    transparent 225deg,
    rgba(255, 215, 0, 0.15) 235deg,
    transparent 245deg,
    transparent 270deg,
    rgba(255, 215, 0, 0.15) 280deg,
    transparent 290deg,
    transparent 315deg,
    rgba(255, 215, 0, 0.15) 325deg,
    transparent 335deg,
    transparent 360deg
  );
  animation: rays-spin 6s linear infinite;
  opacity: 0;
}

.light-rays::before {
  animation-delay: 0s;
  opacity: 1;
}

.light-rays::after {
  animation: rays-spin 4s linear infinite reverse;
  opacity: 0.5;
}

@keyframes rays-spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ===== 主卡片 ===== */
.relic-card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 36px 48px;
  border-radius: 20px;
  min-width: 380px;
  max-width: 480px;
  border: 2px solid transparent;
  text-align: center;
  cursor: default;
  animation: card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* 稀有度基础样式 */
.card-common {
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  border-color: rgba(158, 158, 158, 0.4);
  box-shadow: 0 0 20px rgba(158, 158, 158, 0.1);
}

.card-uncommon {
  background: linear-gradient(145deg, #0d2818 0%, #0a1f12 100%);
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.15);
}

.card-rare {
  background: linear-gradient(145deg, #2d1b4e 0%, #1a0f30 100%);
  border-color: rgba(168, 85, 247, 0.6);
  box-shadow: 0 0 60px rgba(168, 85, 247, 0.3), 0 0 120px rgba(168, 85, 247, 0.15);
  animation: card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, purple-glow 2s ease-in-out infinite 0.5s;
}

.card-epic {
  background: linear-gradient(145deg, #2d1b4e 0%, #1a0f30 100%);
  border-color: rgba(168, 85, 247, 0.6);
  box-shadow: 0 0 60px rgba(168, 85, 247, 0.3), 0 0 120px rgba(168, 85, 247, 0.15);
  animation: card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, purple-glow 2s ease-in-out infinite 0.5s;
}

.card-legendary {
  background: linear-gradient(145deg, #3d2a00 0%, #1a1000 100%);
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow:
    0 0 80px rgba(255, 215, 0, 0.4),
    0 0 160px rgba(255, 140, 0, 0.2),
    inset 0 0 40px rgba(255, 215, 0, 0.05);
  animation: card-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, gold-glow 1.5s ease-in-out infinite 0.6s;
}

@keyframes card-enter {
  0% { transform: scale(0.2) translateY(40px); opacity: 0; }
  60% { transform: scale(1.06) translateY(-5px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes purple-glow {
  0%, 100% { box-shadow: 0 0 60px rgba(168, 85, 247, 0.3), 0 0 120px rgba(168, 85, 247, 0.1); }
  50% { box-shadow: 0 0 80px rgba(168, 85, 247, 0.5), 0 0 160px rgba(168, 85, 247, 0.25); }
}

@keyframes gold-glow {
  0%, 100% { box-shadow: 0 0 80px rgba(255, 215, 0, 0.4), 0 0 160px rgba(255, 140, 0, 0.15); }
  50% { box-shadow: 0 0 100px rgba(255, 215, 0, 0.6), 0 0 200px rgba(255, 140, 0, 0.3), inset 0 0 60px rgba(255, 215, 0, 0.1); }
}

/* ===== 稀有度标签 ===== */
.rarity-badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 24px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-common { background: #555; color: #ccc; border: 1px solid #777; }
.badge-uncommon { background: #14532d; color: #4ade80; border: 1px solid #22c55e; box-shadow: 0 0 12px rgba(34,197,94,0.3); }
.badge-rare { background: #4c1d95; color: #d8b4fe; border: 1px solid #a855f7; box-shadow: 0 0 20px rgba(168,85,247,0.4); }
.badge-epic { background: #4c1d95; color: #d8b4fe; border: 1px solid #a855f7; box-shadow: 0 0 20px rgba(168,85,247,0.4); }
.badge-legendary {
  background: linear-gradient(90deg, #78350f, #b45309, #78350f);
  color: #fef08a;
  border: 1px solid #fbbf24;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  animation: badge-shimmer 2s linear infinite;
}

@keyframes badge-shimmer {
  0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 140, 0, 0.4); }
}

/* ===== 光环（传说） ===== */
.card-halo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.15), inset 0 0 40px rgba(255, 215, 0, 0.05);
  animation: halo-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes halo-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
}

/* ===== 图标区 ===== */
.relic-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 8px 0 4px;
  position: relative;
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.icon-common { background: rgba(158, 158, 158, 0.2); border: 1px solid rgba(158,158,158,0.3); }
.icon-uncommon { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34,197,94,0.4); box-shadow: 0 0 20px rgba(34,197,94,0.2); }
.icon-rare {
  background: radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(88,28,135,0.3) 100%);
  border: 1px solid rgba(168,85,247,0.6);
  box-shadow: 0 0 40px rgba(168,85,247,0.4);
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both, icon-purple-pulse 2s ease-in-out infinite 0.8s;
}
.icon-epic {
  background: radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(88,28,135,0.3) 100%);
  border: 1px solid rgba(168,85,247,0.6);
  box-shadow: 0 0 40px rgba(168,85,247,0.4);
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both, icon-purple-pulse 2s ease-in-out infinite 0.8s;
}
.icon-legendary {
  background: radial-gradient(circle, rgba(255, 215, 0, 0.5) 0%, rgba(180, 120, 0, 0.3) 100%);
  border: 2px solid rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 60px rgba(255, 215, 0, 0.5), 0 0 100px rgba(255, 140, 0, 0.3);
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both, icon-gold-pulse 1.5s ease-in-out infinite 0.8s;
}

@keyframes icon-bounce {
  0% { transform: scale(0) rotate(-20deg); }
  70% { transform: scale(1.15) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes icon-purple-pulse {
  0%, 100% { box-shadow: 0 0 40px rgba(168,85,247,0.4); }
  50% { box-shadow: 0 0 70px rgba(168,85,247,0.7), 0 0 100px rgba(168,85,247,0.3); }
}

@keyframes icon-gold-pulse {
  0%, 100% { box-shadow: 0 0 60px rgba(255,215,0,0.5), 0 0 100px rgba(255,140,0,0.3); }
  50% { box-shadow: 0 0 90px rgba(255,215,0,0.8), 0 0 140px rgba(255,140,0,0.5); }
}

/* ===== 文字样式 ===== */
.relic-name {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 2px;
}

.name-common { color: #ccc; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
.name-uncommon { color: #4ade80; text-shadow: 0 0 10px rgba(34,197,94,0.3); }
.name-rare { color: #d8b4fe; text-shadow: 0 0 20px rgba(168,85,247,0.5); }
.name-epic { color: #d8b4fe; text-shadow: 0 0 20px rgba(168,85,247,0.5); }
.name-legendary {
  color: #fef08a;
  text-shadow: 0 0 20px #ffd700, 0 0 40px #ff8c00, 0 2px 8px rgba(0,0,0,0.5);
  font-size: 30px;
}

.relic-history {
  font-size: 13px;
  color: #888;
  font-style: italic;
  line-height: 1.5;
  max-width: 360px;
}

.relic-effect {
  font-size: 15px;
  line-height: 1.6;
  padding: 10px 16px;
  border-radius: 8px;
  max-width: 380px;
}

.effect-common { color: #bbb; background: rgba(255,255,255,0.05); }
.effect-uncommon { color: #86efac; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); }
.effect-rare { color: #e9d5ff; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); }
.effect-epic { color: #e9d5ff; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); }
.effect-legendary { color: #fef9c3; background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); }

.relic-set-info {
  font-size: 12px;
  color: #666;
  letter-spacing: 1px;
}

/* ===== 确认按钮 ===== */
.confirm-btn {
  margin-top: 8px;
  padding: 10px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.btn-common {
  background: #333;
  color: #aaa;
  border-color: #555;
}
.btn-common:hover { background: #444; color: #fff; }

.btn-uncommon {
  background: rgba(34,197,94,0.2);
  color: #4ade80;
  border-color: rgba(34,197,94,0.5);
}
.btn-uncommon:hover { background: rgba(34,197,94,0.35); box-shadow: 0 0 20px rgba(34,197,94,0.3); }

.btn-rare {
  background: rgba(168,85,247,0.2);
  color: #d8b4fe;
  border-color: rgba(168,85,247,0.5);
  box-shadow: 0 0 15px rgba(168,85,247,0.2);
}
.btn-rare:hover { background: rgba(168,85,247,0.35); box-shadow: 0 0 30px rgba(168,85,247,0.4); }

.btn-epic {
  background: rgba(168,85,247,0.2);
  color: #d8b4fe;
  border-color: rgba(168,85,247,0.5);
  box-shadow: 0 0 15px rgba(168,85,247,0.2);
}
.btn-epic:hover { background: rgba(168,85,247,0.35); box-shadow: 0 0 30px rgba(168,85,247,0.4); }

.btn-legendary {
  background: linear-gradient(90deg, #78350f, #b45309);
  color: #fef08a;
  border-color: #fbbf24;
  box-shadow: 0 0 25px rgba(255,215,0,0.3);
  animation: btn-gold-pulse 1.5s ease-in-out infinite;
}
.btn-legendary:hover { background: linear-gradient(90deg, #92400e, #d97706); box-shadow: 0 0 50px rgba(255,215,0,0.5); }

@keyframes btn-gold-pulse {
  0%, 100% { box-shadow: 0 0 25px rgba(255,215,0,0.3); }
  50% { box-shadow: 0 0 45px rgba(255,215,0,0.6), 0 0 80px rgba(255,140,0,0.3); }
}

/* ===== 关闭提示 ===== */
.close-hint {
  position: absolute;
  bottom: 32px;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  letter-spacing: 1px;
  z-index: 20;
}

/* ===== 过渡动画 ===== */
.modal-fade-enter-active { animation: overlay-in 0.4s ease; }
.modal-fade-leave-active { animation: overlay-out 0.3s ease; }

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes overlay-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.text-rise-enter-active { animation: text-rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.text-rise-enter-from { opacity: 0; transform: translateY(16px); }

@keyframes text-rise-in {
  to { opacity: 1; transform: translateY(0); }
}

.btn-appear-enter-active { animation: btn-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
.btn-appear-enter-from { opacity: 0; transform: scale(0.8); }

@keyframes btn-in {
  to { opacity: 1; transform: scale(1); }
}

/* ===== 震动效果 ===== */
.acquisition-overlay.rarity-rare {
  animation: shake-purple 0.4s ease-out;
}

.acquisition-overlay.rarity-epic {
  animation: shake-purple 0.4s ease-out;
}

.acquisition-overlay.rarity-legendary {
  animation: shake-gold 0.5s ease-out;
}

@keyframes shake-purple {
  0%, 100% { transform: translate(0); }
  15% { transform: translate(-4px, -3px); }
  30% { transform: translate(4px, 2px); }
  45% { transform: translate(-3px, 4px); }
  60% { transform: translate(3px, -2px); }
  75% { transform: translate(-2px, 2px); }
  90% { transform: translate(2px, -1px); }
}

@keyframes shake-gold {
  0%, 100% { transform: translate(0); }
  10% { transform: translate(-6px, -4px); }
  20% { transform: translate(6px, 3px); }
  30% { transform: translate(-5px, 5px); }
  40% { transform: translate(5px, -3px); }
  50% { transform: translate(-4px, 4px); }
  60% { transform: translate(4px, -4px); }
  70% { transform: translate(-3px, 3px); }
  80% { transform: translate(3px, -2px); }
  90% { transform: translate(-2px, 1px); }
}

/* ===== 传说白闪 ===== */
.acquisition-overlay.rarity-legendary .overlay-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 215, 0, 0.5);
  animation: white-flash 0.4s ease-out forwards;
  pointer-events: none;
}

@keyframes white-flash {
  0% { opacity: 0.7; }
  100% { opacity: 0; }
}
</style>
