<template>
  <Teleport to="body">
    <div v-if="isVisible" class="recruit-overlay" :class="{ closing: isClosing }">
      <!-- 背景层：古典卷轴质感 -->
      <div class="recruit-bg"></div>

      <!-- 顶部标题栏 -->
      <div class="recruit-header">
        <h2 class="recruit-title">招募武将</h2>
        <div class="pity-bar">
          <span class="pity-label">保底进度</span>
          <div class="pity-track">
            <div class="pity-purple" :style="{ width: purplePityPercent + '%' }"></div>
            <div class="pity-gold" :style="{ width: goldPityPercent + '%' }"></div>
          </div>
          <div class="pity-text">
            <span class="purple-text">紫 {{ pityCount }}/{{ PITY_PURPLE_TRIGGER }}</span>
            <span class="gold-text">金 {{ pityCount }}/{{ PITY_GOLD_TRIGGER }}</span>
          </div>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <button class="recruit-close" @click="closePanel">×</button>

      <!-- 主内容区 -->
      <div class="recruit-main">

        <!-- 招募模式选择 -->
        <div class="recruit-modes" v-if="phase === 'idle'">
          <div class="mode-card single" @click="startRecruit('single')" :class="{ disabled: money < RECRUIT_SINGLE_COST }">
            <div class="mode-icon">单</div>
            <div class="mode-info">
              <div class="mode-name">单次招募</div>
              <div class="mode-cost">
                <img src="/assets/money.webp" alt="金币" class="cost-icon">
                <span>{{ RECRUIT_SINGLE_COST }}</span>
              </div>
            </div>
            <div class="mode-desc">获得随机武将</div>
          </div>

          <div class="mode-card ten" @click="startRecruit('ten')" :class="{ disabled: money < RECRUIT_TEN_COST }">
            <div class="mode-icon">十</div>
            <div class="mode-info">
              <div class="mode-name">十连招募</div>
              <div class="mode-cost">
                <img src="/assets/money.webp" alt="金币" class="cost-icon">
                <span>{{ RECRUIT_TEN_COST }}</span>
              </div>
            </div>
            <div class="mode-desc">必出紫色及以上</div>
          </div>
        </div>

        <!-- 遮罩层 -->
        <div class="recruit-mask" :class="{ revealed: maskRevealed }">
          <div class="mask-glow"></div>
        </div>

        <!-- 结果展示区 -->
        <div class="recruit-result" :class="phase">

          <!-- 单抽结果 -->
          <div v-if="mode === 'single' && currentResult" class="single-result">
            <div
              class="general-card-reveal"
              :class="[currentResult.rarity, { animating: isAnimating, revealed: cardRevealed }]"
            >
              <div class="card-glow"></div>
              <div class="card-frame">
                <div class="card-stars">
                  <span
                    v-for="i in starLimit"
                    :key="i"
                    class="star"
                    :class="{ active: i <= revealedStars }"
                  >★</span>
                </div>
                <div class="card-avatar" :style="{ backgroundImage: `url(${currentResult.avatarUrl})` }"></div>
                <div class="card-name">{{ currentResult.name }}</div>
                <div class="card-rarity">{{ rarityName }}</div>
              </div>
            </div>

            <!-- 五星特效 -->
            <div v-if="currentResult.rarity === 'legendary'" class="five-star-fx" :class="{ active: showFiveStarFx }">
              <div class="light-beam-container">
                <div class="light-beam"></div>
                <div class="light-beam beam-2"></div>
                <div class="light-beam beam-3"></div>
              </div>
              <div class="sparkle-container">
                <div
                  v-for="n in 24"
                  :key="n"
                  class="sparkle-particle"
                  :style="getSparkleStyle(n)"
                ></div>
              </div>
              <div class="fx-text-container">
                <div class="fx-text fx-text-1">{{ fxLine1 }}</div>
                <div class="fx-text fx-text-2">{{ fxLine2 }}</div>
                <div class="fx-text fx-text-3">{{ fxLine3 }}</div>
              </div>
              <div class="screen-flash"></div>
            </div>

            <!-- 四星特效 -->
            <div v-if="currentResult.rarity === 'rare'" class="four-star-fx" :class="{ active: showFourStarFx }">
              <div class="purple-glow"></div>
              <div class="fx-text-rare">{{ fxLine2 }}</div>
            </div>
          </div>

          <!-- 十连结果 -->
          <div v-else-if="mode === 'ten' && tenResults.length > 0" class="ten-result">
            <div
              v-for="(general, index) in tenResults"
              :key="index"
              class="general-card-reveal"
              :class="[general.rarity, {
                animating: isAnimating,
                revealed: revealedIndices.includes(index),
                'legendary-animating': general.rarity === 'legendary' && revealedIndices.includes(index),
              }]"
              :style="{ animationDelay: getRevealDelay(index) + 'ms' }"
            >
              <div class="card-glow" :class="general.rarity"></div>
              <div class="card-frame">
                <div class="card-stars">
                  <span
                    v-for="i in getStarLimit(general.rarity)"
                    :key="i"
                    class="star"
                    :class="{ active: revealedStarMap[index] >= i }"
                  >★</span>
                </div>
                <div class="card-avatar" :style="{ backgroundImage: `url(${general.avatarUrl})` }"></div>
                <div class="card-name">{{ general.name }}</div>
                <div class="card-rarity">{{ getRarityName(general.rarity) }}</div>
              </div>

              <!-- 五星个人特效 -->
              <div v-if="general.rarity === 'legendary'" class="mini-five-fx">
                <div class="mini-beam"></div>
                <div class="mini-text">{{ fxLine2 }}</div>
              </div>
            </div>
          </div>

        </div>

        <!-- 底部操作 -->
        <div class="recruit-footer" v-if="phase === 'done'">
          <button class="btn-continue" @click="resetAndClose">确定</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { General, GeneralRarity } from "../skills/types";
import { RARITY_CONFIG } from "../skills/types";
import { RECRUIT_CONFIG, pickRarity } from "../skills/index";

interface RecruitResult {
  general: General;
  rarity: GeneralRarity;
  name: string;
  avatarUrl: string;
  synthStar: number;
}

const PITY_PURPLE_TRIGGER = 10;
const PITY_GOLD_TRIGGER = 30;
const RECRUIT_SINGLE_COST = 100;
const RECRUIT_TEN_COST = 1000;

const props = defineProps<{
  pityCount: number;
  money: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "recruit-done", result: RecruitResult): void;
}>();

// 状态
const isVisible = ref(false);
const isClosing = ref(false);
const phase = ref<"idle" | "animating" | "done">("idle");
const mode = ref<"single" | "ten">("single");
const isAnimating = ref(false);
const maskRevealed = ref(false);
const cardRevealed = ref(false);
const revealedStars = ref(0);
const showFiveStarFx = ref(false);
const showFourStarFx = ref(false);
const revealedIndices = ref<number[]>([]);
const revealedStarMap = ref<Record<number, number>>({});
const currentResult = ref<RecruitResult | null>(null);
const tenResults = ref<RecruitResult[]>([]);

// 常量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const rarityName = computed(() => {
  if (!currentResult.value) return "";
  return RARITY_CONFIG[currentResult.value.rarity]?.name ?? "";
});

const starLimit = computed(() => {
  if (!currentResult.value) return 5;
  return RARITY_CONFIG[currentResult.value.rarity]?.starLimit ?? 5;
});

const purplePityPercent = computed(() => {
  return Math.min(100, (props.pityCount / PITY_PURPLE_TRIGGER) * 100);
});

const goldPityPercent = computed(() => {
  return Math.min(100, (props.pityCount / PITY_GOLD_TRIGGER) * 100);
});

// 五星特效文案
const fxLine1 = "天降祥瑞";
const fxLine2 = "天命所归";
const fxLine3 = "★特授予★";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 打开面板
const open = () => {
  isVisible.value = true;
  isClosing.value = false;
  phase.value = "idle";
  reset();
};

// 关闭面板
const closePanel = () => {
  isClosing.value = true;
  setTimeout(() => {
    isVisible.value = false;
    isClosing.value = false;
    emit("close");
  }, 300);
};

// 重置状态
const reset = () => {
  phase.value = "idle";
  mode.value = "single";
  isAnimating.value = false;
  maskRevealed.value = false;
  cardRevealed.value = false;
  revealedStars.value = 0;
  showFiveStarFx.value = false;
  showFourStarFx.value = false;
  revealedIndices.value = [];
  revealedStarMap.value = {};
  currentResult.value = null;
  tenResults.value = [];
};

// 获取武将头像URL
const getAvatarUrl = (general: General): string => {
  if (general.avatar) {
    return API_BASE_URL + general.avatar;
  }
  return (
    API_BASE_URL +
    `/public/images/ancient_character_${general.gender === "女" ? "women" : "men"}.webp`
  );
};

// 获取星级上限
const getStarLimit = (rarity: GeneralRarity): number => {
  return RARITY_CONFIG[rarity]?.starLimit ?? 5;
};

// 获取稀有度名称
const getRarityName = (rarity: GeneralRarity): string => {
  return RARITY_CONFIG[rarity]?.name ?? "";
};

// 计算十连揭示延迟（按稀有度排序：legendary > rare > uncommon > common）
const getRevealDelay = (index: number): number => {
  const general = tenResults.value[index];
  if (!general) return index * 150;
  const delayMap: Record<GeneralRarity, number> = {
    legendary: 0,
    rare: 200,
    uncommon: 400,
    common: 600,
  };
  const baseDelay = delayMap[general.rarity] ?? 800;
  // 同稀有度内按index顺序
  return baseDelay + index * 80;
};

// 粒子样式
const getSparkleStyle = (n: number): Record<string, string> => {
  const angle = (n / 24) * 360;
  const distance = 80 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const delay = Math.random() * 0.5;
  const size = 4 + Math.random() * 8;
  return {
    "--tx": `${x}px`,
    "--ty": `${y}px`,
    "--delay": `${delay}s`,
    "--size": `${size}px`,
  };
};

// 开始招募
const startRecruit = async (m: "single" | "ten") => {
  const cost = m === "single" ? RECRUIT_SINGLE_COST : RECRUIT_TEN_COST;
  if (props.money < cost) return;

  mode.value = m;
  phase.value = "animating";
  isAnimating.value = true;
  maskRevealed.value = false;
  cardRevealed.value = false;
  revealedStars.value = 0;
  showFiveStarFx.value = false;
  showFourStarFx.value = false;
  revealedIndices.value = [];
  revealedStarMap.value = {};

  // 抽取
  if (m === "single") {
    const result = await doSingleRecruit();
    currentResult.value = result;
    tenResults.value = [];
    await playSingleAnimation(result);
  } else {
    currentResult.value = null;
    tenResults.value = await doTenRecruit();
    await playTenAnimation();
  }

  phase.value = "done";
  isAnimating.value = false;
};

// 单抽逻辑
const doSingleRecruit = async (): Promise<RecruitResult> => {
  let targetRarity: GeneralRarity = "common";
  const pityCount = props.pityCount;

  if (pityCount >= PITY_GOLD_TRIGGER) {
    targetRarity = "legendary";
  } else if (pityCount >= PITY_PURPLE_TRIGGER) {
    targetRarity = "rare";
  } else {
    targetRarity = pickRarity();
  }

  const config = RECRUIT_CONFIG.find((g) => g.rarity === targetRarity);
  if (!config) {
    // fallback
    const allConfig = RECRUIT_CONFIG[Math.floor(Math.random() * RECRUIT_CONFIG.length)];
    targetRarity = allConfig.rarity;
  }

  const finalConfig = RECRUIT_CONFIG.filter((g) => g.rarity === targetRarity);
  const chosen = finalConfig[Math.floor(Math.random() * finalConfig.length)];

  let general: General | null = null;
  try {
    const mod = await import(`../skills/${chosen.moduleName}`);
    const fetchFn = mod[chosen.fetchFnName as keyof typeof mod] as (url: string) => Promise<General | null>;
    general = await fetchFn(API_BASE_URL);
  } catch {
    general = null;
  }

  if (!general) {
    general = {
      id: chosen.id,
      name: chosen.name,
      rarity: targetRarity,
      attack: 50, defense: 50, strategy: 50, speed: 50,
      attackGrowth: 1, defenseGrowth: 1, strategyGrowth: 1, speedGrowth: 1,
      siege: 50, siegeGrowth: 1, troops: 500, maxTroops: 500,
      level: 1, command: 50, commandGrowth: 1, leadership: 2,
      isDead: false,
    } as General;
  }

  return {
    general,
    rarity: targetRarity,
    name: general.name,
    avatarUrl: getAvatarUrl(general),
    synthStar: 0,
  };
};

// 十连逻辑
const doTenRecruit = async (): Promise<RecruitResult[]> => {
  const results: RecruitResult[] = [];
  let pityCount = props.pityCount;
  let hasGuaranteedRare = false;

  for (let i = 0; i < 10; i++) {
    let targetRarity: GeneralRarity = "common";

    // 前9抽保证至少1个紫色
    if (i === 9 && !hasGuaranteedRare) {
      targetRarity = "rare";
    } else if (pityCount >= PITY_GOLD_TRIGGER) {
      targetRarity = "legendary";
    } else if (pityCount >= PITY_PURPLE_TRIGGER) {
      targetRarity = "rare";
    } else {
      targetRarity = pickRarity();
    }

    if (targetRarity === "rare" || targetRarity === "legendary") {
      hasGuaranteedRare = true;
    }

    const pool = RECRUIT_CONFIG.filter((g) => g.rarity === targetRarity);
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    let general: General | null = null;
    try {
      const mod = await import(`../skills/${chosen.moduleName}`);
      const fetchFn = mod[chosen.fetchFnName as keyof typeof mod] as (url: string) => Promise<General | null>;
      general = await fetchFn(API_BASE_URL);
    } catch {
      general = null;
    }

    if (!general) {
      general = {
        id: chosen.id,
        name: chosen.name,
        rarity: targetRarity,
        attack: 50, defense: 50, strategy: 50, speed: 50,
        attackGrowth: 1, defenseGrowth: 1, strategyGrowth: 1, speedGrowth: 1,
        siege: 50, siegeGrowth: 1, troops: 500, maxTroops: 500,
        level: 1, command: 50, commandGrowth: 1, leadership: 2,
        isDead: false,
      } as General;
    }

    results.push({
      general,
      rarity: targetRarity,
      name: general.name,
      avatarUrl: getAvatarUrl(general),
      synthStar: 0,
    });
  }

  return results;
};

// 单抽动画
const playSingleAnimation = async (result: RecruitResult) => {
  // 阶段1: 遮罩出现
  await sleep(200);
  maskRevealed.value = true;
  await sleep(600);

  // 阶段2: 卡片翻转入场
  cardRevealed.value = true;
  await sleep(800);

  // 阶段3: 星级逐个揭晓
  const limit = getStarLimit(result.rarity);
  for (let i = 1; i <= limit; i++) {
    revealedStars.value = i;
    await sleep(300);
  }

  // 阶段4: 稀有度特效
  if (result.rarity === "legendary") {
    await sleep(200);
    showFiveStarFx.value = true;
  } else if (result.rarity === "rare") {
    await sleep(200);
    showFourStarFx.value = true;
  }
};

// 十连动画
const playTenAnimation = async () => {
  // 按稀有度分组揭示
  const rarityOrder: GeneralRarity[] = ["legendary", "rare", "uncommon", "common"];

  for (const rarity of rarityOrder) {
    const indices = tenResults.value
      .map((r, i) => (r.rarity === rarity ? i : -1))
      .filter((i) => i >= 0);

    for (const idx of indices) {
      revealedIndices.value = [...revealedIndices.value, idx];
      revealedStarMap.value[idx] = 0;

      // 播放星级揭示
      const limit = getStarLimit(rarity);
      await sleep(300);
      for (let s = 1; s <= limit; s++) {
        revealedStarMap.value[idx] = s;
        await sleep(200);
      }
      await sleep(400);
    }
  }
};

// 重置并关闭
const resetAndClose = () => {
  reset();
  closePanel();
};

// 暴露方法
defineExpose({
  open,
  close: closePanel,
});
</script>

<style scoped>
/* ========================================
   基础布局
   ======================================== */
.recruit-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.recruit-overlay.closing {
  animation: overlayFadeOut 0.3s ease forwards;
}

@keyframes overlayFadeOut {
  to { opacity: 0; }
}

/* 背景：古典卷轴质感 */
.recruit-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(139, 90, 43, 0.3) 0%, transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(101, 67, 33, 0.4) 0%, transparent 50%),
    linear-gradient(180deg, #1a0f05 0%, #2d1f0f 40%, #1a0f05 100%);
  z-index: 0;
}

/* 顶部标题栏 */
.recruit-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px 40px;
  width: 100%;
  background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%);
}

.recruit-title {
  font-size: 32px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 2px 2px 4px rgba(0,0,0,0.8);
  margin: 0;
  letter-spacing: 4px;
}

/* 保底进度条 */
.pity-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pity-label {
  color: #c9a96e;
  font-size: 14px;
}

.pity-track {
  width: 200px;
  height: 8px;
  background: rgba(0,0,0,0.5);
  border-radius: 4px;
  border: 1px solid #8b6914;
  overflow: hidden;
  position: relative;
}

.pity-purple {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  transition: width 0.3s;
  z-index: 1;
}

.pity-gold {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #b45309, #f59e0b);
  transition: width 0.3s;
  z-index: 2;
}

.pity-text {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.purple-text { color: #a855f7; }
.gold-text { color: #f59e0b; }

/* 关闭按钮 */
.recruit-close {
  position: absolute;
  top: 20px;
  right: 30px;
  z-index: 20;
  width: 40px;
  height: 40px;
  background: rgba(0,0,0,0.5);
  border: 2px solid #8b6914;
  border-radius: 50%;
  color: #c9a96e;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.recruit-close:hover {
  background: rgba(139, 105, 20, 0.6);
  color: #ffd700;
  border-color: #ffd700;
}

/* 主内容区 */
.recruit-main {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 30px;
  padding: 20px;
}

/* ========================================
   模式选择卡片
   ======================================== */
.recruit-modes {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.mode-card {
  width: 220px;
  padding: 30px 24px;
  background: linear-gradient(145deg, #2a1f0f 0%, #1a1208 100%);
  border: 2px solid #8b6914;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.mode-card:hover:not(.disabled) {
  transform: translateY(-4px);
  border-color: #ffd700;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2), 0 0 20px rgba(255, 215, 0, 0.1);
}

.mode-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.mode-card.single .mode-icon {
  background: linear-gradient(145deg, #4a7c23, #2d5016);
  box-shadow: 0 0 16px rgba(74, 124, 35, 0.5);
}

.mode-card.ten .mode-icon {
  background: linear-gradient(145deg, #7c3aed, #5b21b6);
  box-shadow: 0 0 16px rgba(124, 58, 237, 0.5);
}

.mode-name {
  font-size: 20px;
  color: #ffd700;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.mode-cost {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #c9a96e;
  font-size: 16px;
}

.cost-icon {
  width: 20px;
  height: 20px;
}

.mode-desc {
  font-size: 13px;
  color: #8b7355;
}

/* ========================================
   遮罩层
   ======================================== */
.recruit-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.28) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: opacity 0.6s ease;
}

.recruit-mask.revealed {
  opacity: 0;
}

.mask-glow {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
  animation: maskPulse 1.5s ease-in-out infinite;
}

@keyframes maskPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* ========================================
   结果展示区
   ======================================== */
.recruit-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 400px;
  width: 100%;
}

/* 单抽结果 */
.single-result {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 十连结果 */
.ten-result {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  max-width: 900px;
}

/* ========================================
   武将卡片揭示
   ======================================== */
.general-card-reveal {
  position: relative;
  width: 160px;
  height: 220px;
  border-radius: 12px;
  background: linear-gradient(145deg, #2d2416, #1a1208);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.general-card-reveal.revealed {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 稀有度边框光效 */
.card-glow {
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s;
}

.general-card-reveal.revealed .card-glow {
  opacity: 1;
}

.card-glow.common {
  box-shadow: 0 0 15px rgba(156, 163, 175, 0.5);
}
.card-glow.uncommon {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
}
.card-glow.rare {
  box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);
}
.card-glow.legendary {
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.9), 0 0 80px rgba(245, 158, 11, 0.4);
}

/* 卡片边框 */
.card-frame {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 6px;
}

/* 星级 */
.card-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 18px;
  color: #555;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.star.active {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  transform: scale(1.3);
}

/* 头像 */
.card-avatar {
  width: 90px;
  height: 110px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  border: 2px solid #8b6914;
}

/* 名字 */
.card-name {
  color: #f5f5dc;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

/* 稀有度标签 */
.card-rarity {
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

.general-card-reveal.common .card-rarity { color: #9ca3af; }
.general-card-reveal.uncommon .card-rarity { color: #22c55e; }
.general-card-reveal.rare .card-rarity { color: #a855f7; }
.general-card-reveal.legendary .card-rarity {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* 传奇卡片脉冲动画 */
.general-card-reveal.legendary.revealed {
  animation: legendaryPulse 2s ease-in-out infinite;
}

@keyframes legendaryPulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 20px rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 60px rgba(255, 215, 0, 0.9), 0 0 100px rgba(255, 165, 0, 0.5);
  }
}

/* ========================================
   五星金将特效（重点）
   ======================================== */
.five-star-fx {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  display: none;
}

.five-star-fx.active {
  display: block;
}

/* 光柱爆发 */
.light-beam-container {
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
}

.light-beam {
  width: 8px;
  height: 0;
  background: linear-gradient(to top, rgba(255, 215, 0, 0.9), rgba(255, 165, 0, 0.6), transparent);
  border-radius: 4px;
  animation: lightBeamBurst 1.2s ease-out forwards;
  transform-origin: bottom center;
}

.beam-2 {
  width: 6px;
  opacity: 0.7;
  animation-delay: 0.1s;
}

.beam-3 {
  width: 4px;
  opacity: 0.5;
  animation-delay: 0.2s;
}

@keyframes lightBeamBurst {
  0% { height: 0; opacity: 1; transform: scaleY(0); }
  30% { height: 400px; opacity: 1; transform: scaleY(1.2); }
  60% { height: 500px; opacity: 0.9; transform: scaleY(1); }
  100% { height: 600px; opacity: 0; transform: scaleY(1); }
}

/* 粒子散落 */
.sparkle-container {
  position: absolute;
  bottom: 35%;
  left: 50%;
  transform: translateX(-50%);
}

.sparkle-particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: radial-gradient(circle, #ffd700, #ff8c00);
  border-radius: 50%;
  opacity: 0;
  animation: sparkleFall 1.5s ease-out forwards;
  animation-delay: var(--delay);
  transform: translate(0, 0);
}

@keyframes sparkleFall {
  0% {
    opacity: 1;
    transform: translate(0, -100px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), calc(-100px + var(--ty) + 400px)) scale(0.3) rotate(360deg);
  }
}

/* 大字弹出 */
.fx-text-container {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.fx-text {
  font-size: 48px;
  font-weight: bold;
  letter-spacing: 8px;
  opacity: 0;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8);
}

.fx-text-1 {
  animation: fxTextPop 0.8s ease-out 0.3s forwards;
}

.fx-text-2 {
  font-size: 72px;
  background: linear-gradient(180deg, #ffd700 0%, #ff8c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.9));
  animation: fxTextPop 0.8s ease-out 0.6s forwards;
}

.fx-text-3 {
  font-size: 36px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  animation: fxTextPop 0.8s ease-out 0.9s forwards;
}

@keyframes fxTextPop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* 屏幕闪烁 */
.screen-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
  animation: screenFlash 0.8s ease-out 0.2s forwards;
}

@keyframes screenFlash {
  0% { opacity: 0; }
  20% { opacity: 1; }
  100% { opacity: 0; }
}

/* ========================================
   四星紫将特效
   ======================================== */
.four-star-fx {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  display: none;
}

.four-star-fx.active {
  display: block;
}

.purple-glow {
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%);
  animation: purpleGlowPulse 1s ease-out forwards;
}

@keyframes purpleGlowPulse {
  0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
  50% { transform: translateX(-50%) scale(1.2); opacity: 1; }
  100% { transform: translateX(-50%) scale(1.5); opacity: 0; }
}

.fx-text-rare {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  font-weight: bold;
  color: #a855f7;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.8), 2px 2px 4px rgba(0,0,0,0.8);
  letter-spacing: 6px;
  animation: fxTextPop 0.8s ease-out 0.3s forwards;
  opacity: 0;
}

/* ========================================
   十连中的迷你五星特效
   ======================================== */
.mini-five-fx {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: hidden;
  pointer-events: none;
}

.mini-beam {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(to top, rgba(255, 215, 0, 0.9), transparent);
  animation: miniBeamBurst 0.8s ease-out forwards;
}

@keyframes miniBeamBurst {
  0% { height: 0; opacity: 1; }
  50% { height: 150px; opacity: 0.8; }
  100% { height: 200px; opacity: 0; }
}

.mini-text {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
  white-space: nowrap;
  animation: miniTextPop 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes miniTextPop {
  0% { transform: translateX(-50%) scale(0); opacity: 0; }
  60% { transform: translateX(-50%) scale(1.1); opacity: 1; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

/* ========================================
   底部操作按钮
   ======================================== */
.recruit-footer {
  position: relative;
  z-index: 10;
  padding: 20px;
}

.btn-continue {
  padding: 12px 48px;
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  background: linear-gradient(145deg, #2d1f0f, #1a1208);
  border: 2px solid #ffd700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 4px;
}

.btn-continue:hover {
  background: linear-gradient(145deg, #3d2f1f, #2a1f08);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  transform: translateY(-2px);
}
</style>