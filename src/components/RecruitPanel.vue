<template>
  <Teleport to="body">
    <div v-if="isVisible" class="recruit-overlay" :class="{ closing: isClosing }" @click="onOverlayClick">

      <!-- 全屏五星特效 -->
      <Transition name="five-fx">
        <div v-if="showFullScreenFiveFx && fiveStarTarget" class="five-star-cinematic">
          <!-- 背景 -->
          <div class="fx-bg"></div>
          <div class="fx-particles">
            <div v-for="n in 40" :key="n" class="fx-particle" :style="getFxParticleStyle(n)"></div>
          </div>

          <!-- 左侧：3D卡牌 -->
          <div class="fx-card-zone">
            <div class="fx-card-scene">
              <div class="fx-card-3d" :class="{ entering: cardEntered }">
                <!-- 卡背 -->
                <div class="fx-card-face fx-card-back"></div>
                <!-- 卡面 -->
                <div class="fx-card-face fx-card-front">
                  <div class="fx-card-banner">
                    <span class="fx-banner-stars">★★★★★</span>
                    <span class="fx-banner-label">五星级武将</span>
                  </div>
                  <div class="fx-card-portrait" :style="{ backgroundImage: `url(${fiveStarTarget.avatarUrl})` }"></div>
                  <div class="fx-card-name">{{ fiveStarTarget.name }}</div>
                  <div class="fx-card-subtitle">{{ fiveStarTarget.general.leadership }}c {{ fiveStarTarget.general.command }}c</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：属性与战法 -->
          <div class="fx-stats-zone">
            <div class="fx-stats-inner" :class="{ entering: statsEntered }">
              <div class="fx-stats-title">战法</div>
              <div class="fx-skill-name">{{ fiveStarTarget.general.name }}</div>
              <div class="fx-skill-desc">
                {{ fiveStarTarget.general.skills?.[0]?.description || '上古兵法，奥妙无穷，统领三军，攻无不克。' }}
              </div>
              <div class="fx-attr-section">
                <div class="fx-attr-title">属性</div>
                <div class="fx-attr-grid">
                  <div class="fx-attr-row">
                    <span class="fx-attr-label att">攻击</span>
                    <div class="fx-attr-bar-wrap">
                      <div class="fx-attr-bar att" :style="{ width: getAttrPct(fiveStarTarget.general.attack) + '%' }"></div>
                    </div>
                    <span class="fx-attr-val">{{ fiveStarTarget.general.attack }}</span>
                  </div>
                  <div class="fx-attr-row">
                    <span class="fx-attr-label def">防御</span>
                    <div class="fx-attr-bar-wrap">
                      <div class="fx-attr-bar def" :style="{ width: getAttrPct(fiveStarTarget.general.defense) + '%' }"></div>
                    </div>
                    <span class="fx-attr-val">{{ fiveStarTarget.general.defense }}</span>
                  </div>
                  <div class="fx-attr-row">
                    <span class="fx-attr-label str">谋略</span>
                    <div class="fx-attr-bar-wrap">
                      <div class="fx-attr-bar str" :style="{ width: getAttrPct(fiveStarTarget.general.strategy) + '%' }"></div>
                    </div>
                    <span class="fx-attr-val">{{ fiveStarTarget.general.strategy }}</span>
                  </div>
                  <div class="fx-attr-row">
                    <span class="fx-attr-label spd">速度</span>
                    <div class="fx-attr-bar-wrap">
                      <div class="fx-attr-bar spd" :style="{ width: getAttrPct(fiveStarTarget.general.speed) + '%' }"></div>
                    </div>
                    <span class="fx-attr-val">{{ fiveStarTarget.general.speed }}</span>
                  </div>
                  <div class="fx-attr-row">
                    <span class="fx-attr-label seg">攻城</span>
                    <div class="fx-attr-bar-wrap">
                      <div class="fx-attr-bar seg" :style="{ width: getAttrPct(fiveStarTarget.general.siege) + '%' }"></div>
                    </div>
                    <span class="fx-attr-val">{{ fiveStarTarget.general.siege }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 大字特效 -->
          <div class="fx-text-zone">
            <div class="fx-line fx-line-1" :class="{ popping: textEntered }">{{ fxLine1 }}</div>
            <div class="fx-line fx-line-2" :class="{ popping: textEntered }">{{ fxLine2 }}</div>
            <div class="fx-line fx-line-3" :class="{ popping: textEntered }">{{ fxLine3 }}</div>
          </div>

          <!-- 点击关闭 -->
          <div class="fx-hint">点击任意处继续</div>
        </div>
      </Transition>

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
      <button class="recruit-close" @click.stop="closePanel">×</button>

      <!-- 主内容区 -->
      <div class="recruit-main" @click.stop>

        <!-- 揭示完成界面：点击返回idle -->
        <div v-if="phase === 'done'" class="done-overlay" @click="onDoneClick">
          <div class="done-content">
            <div class="done-title">招募完成</div>
            <div class="done-hint">点击返回招募界面</div>
          </div>
        </div>

        <!-- 招募模式选择（idle阶段） -->
        <div class="recruit-modes" v-if="phase === 'idle'">
          <div class="fast-toggle">
            <span class="fast-label">快速抽卡</span>
            <button
              class="fast-switch"
              :class="{ active: fastMode }"
              @click="fastMode = !fastMode"
            >
              <span class="fast-thumb"></span>
            </button>
          </div>

          <div class="mode-cards-row">
            <div class="mode-card single" @click="startRecruit('single')" :class="{ disabled: localMoney < RECRUIT_SINGLE_COST }">
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

            <div class="mode-card ten" @click="startRecruit('ten')" :class="{ disabled: localMoney < RECRUIT_TEN_COST }">
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
        </div>

        <!-- 揭示区域 -->
        <div class="reveal-area" :class="phase">

          <!-- 单抽揭示 -->
          <div v-if="mode === 'single' && currentResult && phase === 'revealing'" class="single-reveal">
            <div
              class="card-scene"
              @mouseenter="onSingleHoverEnter"
            >
              <div class="card-3d" :class="{ flipped: singleFlipped }">
                <!-- 背面：翻面状态 -->
                <div class="card-face card-back" :class="currentResult.rarity">
                  <div class="back-pattern">
                    <div class="back-center">
                      <div class="back-rarity-text">{{ getRarityName(currentResult.rarity) }}</div>
                      <div class="back-hint">悬停揭示</div>
                    </div>
                  </div>
                  <div class="back-border-glow"></div>
                </div>
                <!-- 正面：揭示后 -->
                <div class="card-face card-front" :class="currentResult.rarity">
                  <div class="card-glow" :class="currentResult.rarity"></div>
                  <div class="card-frame">
                    <div class="card-stars">
                      <span
                        v-for="i in starLimit"
                        :key="i"
                        class="star"
                        :class="{ active: singleStars >= i }"
                      >★</span>
                    </div>
                    <div class="card-avatar" :style="{ backgroundImage: `url(${currentResult.avatarUrl})` }"></div>
                    <div class="card-name">{{ currentResult.name }}</div>
                    <div class="card-rarity-label">{{ rarityName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 十连揭示：2行5列 -->
          <div v-else-if="mode === 'ten' && tenResults.length > 0 && phase === 'revealing'" class="ten-reveal">
            <div class="ten-grid">
              <div
                v-for="(general, index) in tenResults"
                :key="index"
                class="card-scene"
                :style="{ '--row': Math.floor(index / 5), '--col': index % 5 }"
              >
                <div
                  class="card-3d"
                  :class="{ flipped: flippedIndices.has(index) }"
                  @mouseenter="onCardHoverEnter(index, general)"
                >
                  <!-- 背面：翻面状态 -->
                  <div class="card-face card-back" :class="general.rarity">
                    <div class="back-pattern">
                      <div class="back-center">
                        <div class="back-rarity-text">{{ getRarityName(general.rarity) }}</div>
                        <div class="back-hint">悬停揭示</div>
                      </div>
                    </div>
                    <div class="back-border-glow"></div>
                  </div>

                  <!-- 正面：揭示后 -->
                  <div class="card-face card-front" :class="general.rarity">
                    <div class="card-glow" :class="general.rarity"></div>
                    <div class="card-frame">
                      <div class="card-stars">
                        <span
                          v-for="i in getStarLimit(general.rarity)"
                          :key="i"
                          class="star"
                          :class="{ active: (starMap[index] ?? 0) >= i }"
                        >★</span>
                      </div>
                      <div class="card-avatar" :style="{ backgroundImage: `url(${general.avatarUrl})` }"></div>
                      <div class="card-name">{{ general.name }}</div>
                      <div class="card-rarity-label">{{ getRarityName(general.rarity) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
const RECRUIT_TEN_COST = 900;

const props = defineProps<{
  pityCount: number;
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
  (e: "update:pityCount", value: number): void;
  (e: "close"): void;
  (e: "recruit-done", results: RecruitResult[]): void;
}>();

// 本地金币状态
const localMoney = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// 状态
const isVisible = ref(false);
const isClosing = ref(false);
const phase = ref<"idle" | "revealing" | "done">("idle");
const mode = ref<"single" | "ten">("single");
const fastMode = ref(false);
const currentResult = ref<RecruitResult | null>(null);
const tenResults = ref<RecruitResult[]>([]);

// 揭示状态
const singleFlipped = ref(false);
const singleStars = ref(0);
const flippedIndices = ref(new Set<number>());
const starMap = ref<Record<number, number>>({});

// 全屏五星特效
const showFullScreenFiveFx = ref(false);
const fiveStarTarget = ref<RecruitResult | null>(null);
const cardEntered = ref(false);
const statsEntered = ref(false);
const textEntered = ref(false);

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
  fastMode.value = false;
  currentResult.value = null;
  tenResults.value = [];
  singleFlipped.value = false;
  singleStars.value = 0;
  flippedIndices.value = new Set();
  starMap.value = {};
  showFullScreenFiveFx.value = false;
  fiveStarTarget.value = null;
  cardEntered.value = false;
  statsEntered.value = false;
  textEntered.value = false;
};

// 获取武将头像URL
const getAvatarUrl = (general: General): string => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
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

// 属性百分比
const getAttrPct = (val: number): number => {
  return Math.min(100, (val / 150) * 100);
};

// 粒子样式
const getFxParticleStyle = (_n: number): Record<string, string> => {
  const angle = Math.random() * 360;
  const distance = 200 + Math.random() * 300;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const delay = Math.random() * 0.8;
  const size = 3 + Math.random() * 8;
  const duration = 2 + Math.random() * 2;
  return {
    "--tx": `${x}px`,
    "--ty": `${y}px`,
    "--delay": `${delay}s`,
    "--size": `${size}px`,
    "--duration": `${duration}s`,
  };
};

// 更新保底计数（揭示时逐步累加）
const addPityCount = (count: number) => {
  emit("update:pityCount", Math.min(props.pityCount + count, PITY_GOLD_TRIGGER));
};

// 重置保底
const resetPityCount = () => {
  emit("update:pityCount", 0);
};

// 开始招募
const startRecruit = async (m: "single" | "ten") => {
  const cost = m === "single" ? RECRUIT_SINGLE_COST : RECRUIT_TEN_COST;
  if (localMoney.value < cost) return;

  localMoney.value -= cost;
  mode.value = m;

  // 重置揭示状态
  singleFlipped.value = false;
  singleStars.value = 0;
  flippedIndices.value = new Set();
  starMap.value = {};
  showFullScreenFiveFx.value = false;
  fiveStarTarget.value = null;
  cardEntered.value = false;
  statsEntered.value = false;
  textEntered.value = false;

  // 抽取
  if (m === "single") {
    currentResult.value = await doSingleRecruit();
    tenResults.value = [];
  } else {
    currentResult.value = null;
    tenResults.value = await doTenRecruit();
  }

  // 快速模式：全部立即揭示
  if (fastMode.value) {
    if (m === "single" && currentResult.value) {
      singleFlipped.value = true;
      singleStars.value = getStarLimit(currentResult.value.rarity);
      if (currentResult.value.rarity === "legendary") {
        fiveStarTarget.value = currentResult.value;
        showFullScreenFiveFx.value = true;
        playFiveStarCinematic(currentResult.value);
      }
    } else {
      tenResults.value.forEach((g, i) => {
        flippedIndices.value = new Set([...flippedIndices.value, i]);
        starMap.value[i] = getStarLimit(g.rarity);
      });
      const hasFive = tenResults.value.some((g) => g.rarity === "legendary");
      if (hasFive) {
        const firstFive = tenResults.value.find((g) => g.rarity === "legendary")!;
        fiveStarTarget.value = firstFive;
        showFullScreenFiveFx.value = true;
        playFiveStarCinematic(firstFive);
      }
    }
    phase.value = "done";
  } else {
    phase.value = "revealing";
  }

  emit("recruit-done", m === "single" && currentResult.value ? [currentResult.value] : tenResults.value);
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
    const allConfig = RECRUIT_CONFIG[Math.floor(Math.random() * RECRUIT_CONFIG.length)];
    targetRarity = allConfig.rarity;
  }

  const finalConfig = RECRUIT_CONFIG.filter((g) => g.rarity === targetRarity);
  const chosen = finalConfig[Math.floor(Math.random() * finalConfig.length)];

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
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
  const pityCount = props.pityCount;
  let hasGuaranteedRare = false;

  for (let i = 0; i < 10; i++) {
    let targetRarity: GeneralRarity = "common";

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

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
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

// 单抽悬停进入
const onSingleHoverEnter = async () => {
  if (!currentResult.value || singleFlipped.value) return;
  singleFlipped.value = true;
  await playStarReveal("single", currentResult.value.rarity);

  // 五星触发全屏特效
  if (currentResult.value.rarity === "legendary") {
    fiveStarTarget.value = currentResult.value;
    showFullScreenFiveFx.value = true;
    await playFiveStarCinematic(currentResult.value);
    // 五星重置保底
    resetPityCount();
    if (mode.value === "single") {
      phase.value = "done";
    }
  } else if (currentResult.value.rarity === "rare") {
    // 紫色保底被消费，重置保底
    resetPityCount();
    if (mode.value === "single") {
      phase.value = "done";
    }
  } else {
    // 非五星非紫色（白/绿）：累加保底
    addPityCount(1);
    if (mode.value === "single") {
      phase.value = "done";
    }
  }
};

// 单抽星级揭晓动画
const playStarReveal = async (type: "single" | "ten", rarity: GeneralRarity) => {
  const limit = getStarLimit(rarity);
  if (type === "single") {
    for (let i = 1; i <= limit; i++) {
      singleStars.value = i;
      await sleep(300);
    }
  }
};

// 十连卡悬停进入
const onCardHoverEnter = async (index: number, general: RecruitResult) => {
  if (flippedIndices.value.has(index)) return;

  // 检查是否五星（需要触发保底更新）
  const isFiveStar = general.rarity === "legendary";

  const newSet = new Set(flippedIndices.value);
  newSet.add(index);
  flippedIndices.value = newSet;
  starMap.value = { ...starMap.value, [index]: 0 };

  const limit = getStarLimit(general.rarity);
  for (let s = 1; s <= limit; s++) {
    starMap.value = { ...starMap.value, [index]: s };
    await sleep(250);
  }

  // 五星：先播放全屏特效再更新保底
  if (isFiveStar) {
    fiveStarTarget.value = general;
    showFullScreenFiveFx.value = true;
    await playFiveStarCinematic(general);
    // 五星重置保底
    resetPityCount();
  } else if (general.rarity === "rare") {
    // 紫色抽到，重置保底（触发紫色保底后不再继续累加）
    resetPityCount();
  } else {
    // 白/绿：累加保底
    addPityCount(1);
  }

  // 检查是否全部揭示
  checkRevealComplete();
};

// 五星全屏特效时序
const playFiveStarCinematic = async (_target: RecruitResult) => {
  cardEntered.value = false;
  statsEntered.value = false;
  textEntered.value = false;

  await sleep(100);
  textEntered.value = true;
  await sleep(400);
  cardEntered.value = true;
  await sleep(600);
  statsEntered.value = true;
};

// 全屏五星点击关闭
const closeFullScreenFx = () => {
  showFullScreenFiveFx.value = false;
  fiveStarTarget.value = null;
  cardEntered.value = false;
  statsEntered.value = false;
  textEntered.value = false;

  // 五星重置保底
  resetPityCount();

  // 检查是否全部揭示完毕
  checkRevealComplete();
};

// 检查揭示是否全部完成
const checkRevealComplete = () => {
  if (mode.value === "ten") {
    const allRevealed = tenResults.value.every((_, i) => flippedIndices.value.has(i));
    if (allRevealed) {
      phase.value = "done";
    }
  }
};

// done阶段点击返回idle
const onDoneClick = () => {
  phase.value = "idle";
  reset();
};

// 遮罩点击（如果有未揭示卡片则全部揭示）
const onOverlayClick = () => {
  // 全屏特效层先关闭
  if (showFullScreenFiveFx.value) {
    closeFullScreenFx();
    return;
  }

  if (phase.value === "done") {
    onDoneClick();
  }
};

// 计算属性
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

.pity-label { color: #c9a96e; font-size: 14px; }

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
  position: absolute; left: 0; top: 0; height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  transition: width 0.3s; z-index: 1;
}

.pity-gold {
  position: absolute; left: 0; top: 0; height: 100%;
  background: linear-gradient(90deg, #b45309, #f59e0b);
  transition: width 0.3s; z-index: 2;
}

.pity-text { display: flex; gap: 16px; font-size: 12px; }
.purple-text { color: #a855f7; }
.gold-text { color: #f59e0b; }

/* 关闭按钮 */
.recruit-close {
  position: absolute;
  top: 20px; right: 30px; z-index: 20;
  width: 40px; height: 40px;
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

/* done覆盖层：提示点击返回 */
.done-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  cursor: pointer;
}

.done-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.done-title {
  font-size: 28px;
  color: #ffd700;
  font-weight: bold;
  letter-spacing: 4px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.done-hint {
  font-size: 16px;
  color: #c9a96e;
  letter-spacing: 2px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ========================================
   模式选择区
   ======================================== */
.recruit-modes {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* 快速抽卡开关 */
.fast-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: rgba(0,0,0,0.4);
  border: 1px solid #5a4520;
  border-radius: 30px;
}

.fast-label {
  color: #c9a96e;
  font-size: 15px;
  letter-spacing: 2px;
}

.fast-switch {
  position: relative;
  width: 48px;
  height: 26px;
  background: #3a2a10;
  border: 2px solid #5a4520;
  border-radius: 13px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.fast-switch.active {
  background: #7c3aed;
  border-color: #a855f7;
}

.fast-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #c9a96e;
  border-radius: 50%;
  transition: all 0.3s;
}

.fast-switch.active .fast-thumb {
  left: 24px;
  background: #fff;
}

.mode-cards-row {
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

.mode-card.disabled { opacity: 0.5; cursor: not-allowed; }

.mode-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: bold;
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
  display: flex; align-items: center; gap: 6px;
  color: #c9a96e; font-size: 16px;
}

.cost-icon { width: 20px; height: 20px; }

.mode-desc { font-size: 13px; color: #8b7355; }

/* ========================================
   揭示区域
   ======================================== */
.reveal-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

/* ========================================
   单抽揭示
   ======================================== */
.single-reveal {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========================================
   十连揭示：2行5列网格
   ======================================== */
.ten-reveal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.ten-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  max-width: 960px;
  width: 100%;
}

.ten-grid .card-scene {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========================================
   3D翻转卡片系统
   ======================================== */
.card-scene {
  width: 160px;
  height: 230px;
  perspective: 1000px;
}

.card-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
  cursor: pointer;
}

.card-3d.flipped {
  transform: rotateY(180deg);
}

/* 卡片两面 */
.card-face {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 正面 */
.card-front {
  transform: rotateY(180deg);
  background: linear-gradient(145deg, #2d2416, #1a1208);
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

/* 背面：翻面状态 */
.card-back {
  background: linear-gradient(145deg, #1f1a10, #141008);
  border: 3px solid transparent;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

/* 背面呼吸光效 */
.back-border-glow {
  position: absolute;
  inset: -3px;
  border-radius: 15px;
  opacity: 0;
  transition: opacity 0.3s;
}

/* 未揭示时有呼吸光效 */
.card-3d:not(.flipped) .back-border-glow {
  opacity: 1;
  animation: breathGlow 2s ease-in-out infinite;
}

.card-back.common .back-border-glow {
  border: 3px solid rgba(156, 163, 175, 0.6);
  box-shadow: 0 0 15px rgba(156, 163, 175, 0.4) inset, 0 0 20px rgba(156, 163, 175, 0.2);
}

.card-back.uncommon .back-border-glow {
  border: 3px solid rgba(34, 197, 94, 0.7);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5) inset, 0 0 25px rgba(34, 197, 94, 0.25);
}

.card-back.rare .back-border-glow {
  border: 3px solid rgba(168, 85, 247, 0.8);
  box-shadow: 0 0 25px rgba(168, 85, 247, 0.6) inset, 0 0 30px rgba(168, 85, 247, 0.3);
}

.card-back.legendary .back-border-glow {
  border: 3px solid rgba(255, 215, 0, 0.9);
  box-shadow: 0 0 35px rgba(255, 215, 0, 0.7) inset, 0 0 40px rgba(255, 215, 0, 0.35);
}

@keyframes breathGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 背面图案 */
.back-pattern {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(139, 105, 20, 0.08) 0px,
      rgba(139, 105, 20, 0.08) 2px,
      transparent 2px,
      transparent 8px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(139, 105, 20, 0.06) 0px,
      rgba(139, 105, 20, 0.06) 2px,
      transparent 2px,
      transparent 8px
    );
}

.back-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
  border: 1px solid rgba(139, 105, 20, 0.3);
  border-radius: 8px;
  background: rgba(0,0,0,0.3);
}

.back-rarity-text {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 3px;
}

.card-back.common .back-rarity-text { color: #9ca3af; }
.card-back.uncommon .back-rarity-text { color: #4ade80; }
.card-back.rare .back-rarity-text { color: #c084fc; }
.card-back.legendary .back-rarity-text { color: #fbbf24; }

.back-hint {
  font-size: 12px;
  color: rgba(201, 169, 110, 0.6);
  letter-spacing: 2px;
}

/* 揭示后的稀有度边框光效 */
.card-glow {
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  opacity: 0.9;
  z-index: 0;
}

.card-glow.common { box-shadow: 0 0 15px rgba(156, 163, 175, 0.5); }
.card-glow.uncommon { box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
.card-glow.rare { box-shadow: 0 0 25px rgba(168, 85, 247, 0.7); }
.card-glow.legendary { box-shadow: 0 0 40px rgba(245, 158, 11, 0.9), 0 0 80px rgba(245, 158, 11, 0.4); }

/* 五星揭示后脉冲 */
.card-3d.flipped .card-glow.legendary {
  animation: legendaryPulse 2s ease-in-out infinite;
}

@keyframes legendaryPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 60px rgba(255, 215, 0, 0.9), 0 0 100px rgba(255, 165, 0, 0.5); }
}

/* 卡片框架内容 */
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

.card-stars { display: flex; gap: 2px; }

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

.card-avatar {
  width: 90px; height: 110px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  border: 2px solid #8b6914;
}

.card-name {
  color: #f5f5dc;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.card-rarity-label {
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

.card-face.card-front.common .card-rarity-label { color: #9ca3af; }
.card-face.card-front.uncommon .card-rarity-label { color: #22c55e; }
.card-face.card-front.rare .card-rarity-label { color: #a855f7; }
.card-face.card-front.legendary .card-rarity-label {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

/* ========================================
   全屏五星特效
   ======================================== */
.five-star-cinematic {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.fx-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(50, 30, 5, 0.97) 0%, rgba(10, 5, 0, 0.99) 100%);
  animation: fxBgPulse 0.6s ease-out;
}

@keyframes fxBgPulse {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 1; }
}

/* 粒子 */
.fx-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.fx-particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: radial-gradient(circle, #ffd700, #ff8c00);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  opacity: 0;
  animation: fxParticleBurst var(--duration) ease-out var(--delay) infinite;
}

@keyframes fxParticleBurst {
  0% { opacity: 0; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0.3); }
}

/* 大字特效区 */
.fx-text-zone {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  pointer-events: none;
}

.fx-line {
  font-weight: bold;
  letter-spacing: 8px;
  opacity: 0;
  color: #ffd700;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.9), 2px 2px 4px rgba(0,0,0,0.8);
}

.fx-line.popping {
  animation: fxLinePop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.fx-line-1 {
  font-size: 36px;
  transform: scale(0);
}
.fx-line-1.popping {
  animation-name: fxLinePop1;
}

.fx-line-2 {
  font-size: 64px;
  background: linear-gradient(180deg, #ffd700 0%, #ff8c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.9));
  transform: scale(0);
}
.fx-line-2.popping {
  animation-name: fxLinePop2;
}

.fx-line-3 {
  font-size: 28px;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  transform: scale(0);
}
.fx-line-3.popping {
  animation-name: fxLinePop3;
}

@keyframes fxLinePop1 {
  0% { opacity: 0; transform: scale(0) rotate(-10deg); }
  60% { opacity: 1; transform: scale(1.15) rotate(2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

@keyframes fxLinePop2 {
  0% { opacity: 0; transform: scale(0) rotate(-5deg); }
  60% { opacity: 1; transform: scale(1.1) rotate(1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

@keyframes fxLinePop3 {
  0% { opacity: 0; transform: scale(0) rotate(-8deg); }
  60% { opacity: 1; transform: scale(1.1) rotate(1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

/* 左侧卡牌区 */
.fx-card-zone {
  position: absolute;
  left: 8%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  perspective: 1200px;
}

.fx-card-scene {
  width: 280px;
  height: 400px;
}

.fx-card-3d {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: translateY(200px) rotateY(-60deg) scale(0.5);
  opacity: 0;
  transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fx-card-3d.entering {
  transform: translateY(0) rotateY(-15deg) scale(0.9);
  opacity: 1;
  animation: fxCardFloat 4s ease-in-out 1s infinite;
}

@keyframes fxCardFloat {
  0%, 100% { transform: translateY(0) rotateY(-15deg) scale(0.9); }
  50% { transform: translateY(-10px) rotateY(-10deg) scale(0.9); }
}

.fx-card-face {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  backface-visibility: hidden;
}

.fx-card-front {
  transform: rotateY(180deg);
  background: linear-gradient(145deg, #2d2416, #1a1208);
  border: 4px solid #ffd700;
  box-shadow: 0 0 60px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 215, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 12px;
}

.fx-card-back {
  background: linear-gradient(145deg, #3d2a10, #1a1208);
  border: 3px solid #8b6914;
}

.fx-card-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.fx-banner-stars {
  font-size: 20px;
  color: #ffd700;
  letter-spacing: 3px;
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
}

.fx-banner-label {
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
  letter-spacing: 4px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.fx-card-portrait {
  width: 200px;
  height: 250px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  border: 3px solid #8b6914;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
}

.fx-card-name {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8);
  letter-spacing: 6px;
  text-align: center;
}

.fx-card-subtitle {
  font-size: 16px;
  color: #c9a96e;
  letter-spacing: 3px;
}

/* 右侧属性面板 */
.fx-stats-zone {
  position: absolute;
  right: 8%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 360px;
}

.fx-stats-inner {
  background: linear-gradient(145deg, rgba(30, 20, 5, 0.95), rgba(15, 8, 0, 0.98));
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.2);
  opacity: 0;
  transform: translateX(100px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.fx-stats-inner.entering {
  opacity: 1;
  transform: translateX(0);
}

.fx-stats-title {
  font-size: 20px;
  color: #ffd700;
  font-weight: bold;
  letter-spacing: 6px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  border-bottom: 1px solid rgba(139, 105, 20, 0.5);
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.fx-skill-name {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  letter-spacing: 6px;
  text-align: center;
  margin-bottom: 12px;
}

.fx-skill-desc {
  font-size: 15px;
  color: #d4c5a0;
  line-height: 1.8;
  letter-spacing: 1px;
  text-align: center;
  margin-bottom: 24px;
  padding: 12px;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  border: 1px solid rgba(139, 105, 20, 0.3);
}

.fx-attr-section {
  margin-top: 8px;
}

.fx-attr-title {
  font-size: 14px;
  color: #c9a96e;
  letter-spacing: 4px;
  margin-bottom: 12px;
  text-align: center;
}

.fx-attr-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fx-attr-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fx-attr-label {
  width: 40px;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
}

.fx-attr-label.att { color: #f87171; }
.fx-attr-label.def { color: #60a5fa; }
.fx-attr-label.str { color: #a78bfa; }
.fx-attr-label.spd { color: #4ade80; }
.fx-attr-label.seg { color: #fbbf24; }

.fx-attr-bar-wrap {
  flex: 1;
  height: 10px;
  background: rgba(0,0,0,0.5);
  border-radius: 5px;
  border: 1px solid rgba(139, 105, 20, 0.4);
  overflow: hidden;
}

.fx-attr-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fx-attr-bar.att { background: linear-gradient(90deg, #dc2626, #f87171); }
.fx-attr-bar.def { background: linear-gradient(90deg, #2563eb, #60a5fa); }
.fx-attr-bar.str { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
.fx-attr-bar.spd { background: linear-gradient(90deg, #16a34a, #4ade80); }
.fx-attr-bar.seg { background: linear-gradient(90deg, #d97706, #fbbf24); }

.fx-attr-val {
  width: 36px;
  font-size: 14px;
  color: #f5f5dc;
  text-align: right;
  font-weight: bold;
}

/* 提示文字 */
.fx-hint {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  font-size: 14px;
  color: rgba(201, 169, 110, 0.7);
  letter-spacing: 3px;
  animation: hintBlink 2s ease-in-out infinite;
}

@keyframes hintBlink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* 全屏特效过渡动画 */
.five-fx-enter-active {
  animation: fiveFxIn 0.3s ease-out;
}

.five-fx-leave-active {
  animation: fiveFxOut 0.4s ease-in forwards;
}

@keyframes fiveFxIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fiveFxOut {
  to { opacity: 0; }
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