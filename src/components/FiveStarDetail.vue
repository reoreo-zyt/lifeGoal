<template>
  <div class="five-star-detail" :class="{ entering: isEntering }">
    <div class="detail-bg"></div>
    <div class="detail-inner">
      <div class="detail-3d-effect">
        <div class="card-large">
          <div class="card-banner">
            <span class="banner-stars">★★★★★</span>
            <span class="banner-label">{{ rarityName }}</span>
          </div>
          <div class="card-portrait" :style="{ backgroundImage: `url(${avatarUrl})` }"></div>
          <div class="card-name-large">{{ general.name }}</div>
          <div class="card-subtitle">{{ general.leadership }}c {{ general.command }}c</div>
        </div>
      </div>
      <div class="detail-stats">
        <div class="stats-title">属性</div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">攻击</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar attack" :style="{ width: getStatPercent(general.attack) + '%' }"></div>
            </div>
            <span class="stat-val">{{ general.attack }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">防御</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar defense" :style="{ width: getStatPercent(general.defense) + '%' }"></div>
            </div>
            <span class="stat-val">{{ general.defense }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">谋略</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar strategy" :style="{ width: getStatPercent(general.strategy) + '%' }"></div>
            </div>
            <span class="stat-val">{{ general.strategy }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">速度</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar speed" :style="{ width: getStatPercent(general.speed) + '%' }"></div>
            </div>
            <span class="stat-val">{{ general.speed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">攻城</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar siege" :style="{ width: getStatPercent(general.siege) + '%' }"></div>
            </div>
            <span class="stat-val">{{ general.siege }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="detail-particles">
      <div
        v-for="n in 30"
        :key="n"
        class="detail-sparkle"
        :style="getSparkleStyle(n)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import type { General, GeneralRarity } from "../skills/types";
import { RARITY_CONFIG } from "../skills/types";

const props = defineProps<{
  general: General;
  rarity: GeneralRarity;
}>();

const isEntering = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isEntering.value = true;
  });
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const avatarUrl = computed(() => {
  if (props.general.avatar) {
    return API_BASE_URL + props.general.avatar;
  }
  return API_BASE_URL + `/public/images/ancient_character_${props.general.gender === "女" ? "women" : "men"}.webp`;
});

const rarityName = computed(() => {
  return RARITY_CONFIG[props.rarity]?.name ?? "";
});

const getStatPercent = (val: number): number => {
  return Math.min(100, Math.max(0, (val / 150) * 100));
};

const getSparkleStyle = (n: number): Record<string, string> => {
  const angle = (n / 30) * 360;
  const distance = 100 + Math.random() * 150;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const delay = Math.random() * 1;
  const size = 3 + Math.random() * 6;
  const duration = 2 + Math.random() * 2;
  return {
    "--dx": `${x}px`,
    "--dy": `${y}px`,
    "--delay": `${delay}s`,
    "--size": `${size}px`,
    "--duration": `${duration}s`,
  };
};
</script>

<style scoped>
.five-star-detail {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.7) rotateY(-30deg);
  width: 500px;
  z-index: 200;
  pointer-events: auto;
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.five-star-detail.entering {
  transform: translate(-50%, -50%) scale(1) rotateY(0deg);
  opacity: 1;
}

.detail-bg {
  position: absolute;
  inset: -20px;
  background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, rgba(26, 15, 5, 0.98) 70%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 24px;
  box-shadow:
    0 0 60px rgba(255, 215, 0, 0.4),
    0 0 120px rgba(255, 215, 0, 0.2),
    inset 0 0 40px rgba(255, 215, 0, 0.1);
  backdrop-filter: blur(4px);
}

.detail-inner {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 24px;
  padding: 24px;
  align-items: flex-start;
}

.detail-3d-effect {
  flex-shrink: 0;
  perspective: 800px;
}

.card-large {
  width: 200px;
  padding: 16px;
  background: linear-gradient(145deg, #2d2416, #1a1208);
  border: 3px solid #ffd700;
  border-radius: 16px;
  box-shadow:
    0 0 30px rgba(255, 215, 0, 0.6),
    0 0 60px rgba(255, 215, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: cardFloat 3s ease-in-out infinite;
  transform-style: preserve-3d;
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0) rotateX(0deg); }
  50% { transform: translateY(-8px) rotateX(3deg); }
}

.card-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.banner-stars {
  font-size: 14px;
  color: #ffd700;
  letter-spacing: 2px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
}

.banner-label {
  font-size: 12px;
  color: #ffd700;
  font-weight: bold;
  letter-spacing: 3px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.card-portrait {
  width: 160px;
  height: 200px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  border: 2px solid #8b6914;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.card-title-bg {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 30px;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%);
  border-radius: 0 0 8px 8px;
}

.card-name-large {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8);
  letter-spacing: 4px;
  text-align: center;
}

.card-subtitle {
  font-size: 12px;
  color: #c9a96e;
  letter-spacing: 2px;
}

/* 属性面板 */
.detail-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-title {
  font-size: 16px;
  color: #ffd700;
  font-weight: bold;
  letter-spacing: 4px;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  border-bottom: 1px solid rgba(139, 105, 20, 0.4);
  padding-bottom: 8px;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-label {
  width: 36px;
  font-size: 13px;
  color: #c9a96e;
  letter-spacing: 1px;
}

.stat-bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(0,0,0,0.4);
  border-radius: 4px;
  border: 1px solid rgba(139, 105, 20, 0.4);
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease-out;
}

.stat-bar.attack { background: linear-gradient(90deg, #ef4444, #f87171); }
.stat-bar.defense { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.stat-bar.strategy { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.stat-bar.speed { background: linear-gradient(90deg, #22c55e, #4ade80); }
.stat-bar.siege { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

.stat-val {
  width: 30px;
  font-size: 13px;
  color: #f5f5dc;
  text-align: right;
  font-weight: bold;
}

/* 粒子效果 */
.detail-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.detail-sparkle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: radial-gradient(circle, #ffd700, #ff8c00);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  opacity: 0;
  animation: detailSparkle var(--duration) ease-out var(--delay) infinite;
}

@keyframes detailSparkle {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.2);
  }
}
</style>