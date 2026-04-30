<template>
  <div class="particles-container">
    <!-- 中心爆发光球 -->
    <div class="burst-core" :class="`core-${rarity}`" />

    <!-- 飞散粒子 -->
    <div
      v-for="(p, i) in particles"
      :key="i"
      class="particle"
      :class="`particle-${rarity}`"
      :style="p.style"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}>();

interface Particle {
  style: Record<string, string>;
}

const PARTICLE_COUNT: Record<string, number> = {
  common: 0,
  uncommon: 0,
  rare: 20,
  epic: 25,
  legendary: 40,
};

const PARTICLE_COLORS: Record<string, string[]> = {
  rare: [
    "#a855f7", "#c084fc", "#7c3aed", "#8b5cf6", "#a78bfa",
    "#6d28d9", "#9333ea", "#c4b5fd", "#e879f9", "#f0abfc",
  ],
  epic: [
    "#a855f7", "#c084fc", "#7c3aed", "#8b5cf6", "#a78bfa",
    "#6d28d9", "#9333ea", "#c4b5fd", "#e879f9", "#f0abfc",
  ],
  legendary: [
    "#ffd700", "#ffb700", "#fbbf24", "#f59e0b", "#d97706",
    "#fcd34d", "#fde68a", "#fff7ed", "#ff8c00", "#e11d48",
    "#facc15", "#fef08a", "#faf089",
  ],
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const particles = computed<Particle[]>(() => {
  const count = PARTICLE_COUNT[props.rarity] ?? 0;
  const colors = PARTICLE_COLORS[props.rarity] ?? [];
  if (count === 0) return [];

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + randomBetween(-15, 15);
    const rad = (angle * Math.PI) / 180;
    const distance = randomBetween(120, 300);
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;
    const color = colors[i % colors.length];
    const size = props.rarity === "legendary"
      ? randomBetween(6, 14)
      : randomBetween(4, 9);
    const duration = randomBetween(0.8, 1.6);
    const delay = randomBetween(0.05, 0.3);
    const isCircle = Math.random() > 0.4;

    return {
      style: {
        "--tx": `${tx}px`,
        "--ty": `${ty}px`,
        "--size": `${size}px`,
        "--color": color,
        "--duration": `${duration}s`,
        "--delay": `${delay}s`,
        "--is-circle": isCircle ? "1" : "0",
      } as Record<string, string>,
    };
  });
});
</script>

<style scoped>
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* ===== 中心爆发光球 ===== */
.burst-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  animation: burst-core-anim 0.6s ease-out forwards;
}

.core-rare {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.9) 0%, rgba(124, 58, 237, 0.4) 50%, transparent 70%);
  box-shadow: 0 0 80px rgba(168, 85, 247, 0.6), 0 0 160px rgba(168, 85, 247, 0.3);
}

.core-epic {
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(192, 132, 252, 1) 0%, rgba(168, 85, 247, 0.6) 40%, rgba(109, 40, 217, 0.3) 70%, transparent 85%);
  box-shadow: 0 0 100px rgba(168, 85, 247, 0.7), 0 0 200px rgba(139, 92, 246, 0.4), 0 0 300px rgba(109, 40, 217, 0.2);
}

.core-legendary {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 215, 0, 1) 0%, rgba(255, 140, 0, 0.7) 40%, rgba(255, 100, 0, 0.3) 70%, transparent 85%);
  box-shadow: 0 0 100px rgba(255, 215, 0, 0.8), 0 0 200px rgba(255, 140, 0, 0.5), 0 0 300px rgba(255, 100, 0, 0.3);
}

@keyframes burst-core-anim {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

/* ===== 粒子 ===== */
.particle {
  position: absolute;
  top: calc(50% - var(--size) / 2);
  left: calc(50% - var(--size) / 2);
  width: var(--size);
  height: var(--size);
  border-radius: calc(var(--is-circle) * 50%);
  background: var(--color);
  box-shadow: 0 0 calc(var(--size) * 1.5) var(--color), 0 0 calc(var(--size) * 3) var(--color);
  animation: particle-fly var(--duration) ease-out var(--delay) both;
  opacity: 0;
}

@keyframes particle-fly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  60% {
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0.3);
    opacity: 0;
  }
}
</style>
