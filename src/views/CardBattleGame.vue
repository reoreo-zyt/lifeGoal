<template>
  <div class="card-battle-game">
    <!-- 没登录的时候会弹出提示框需要进行登录 -->
    <div v-if="!isLoggedIn" class="login-required">
      <div class="login-modal">
        <h2>游戏开始</h2>
        <p>请先进行注册登录</p>
        <button @click="openAuthModal" class="start-button">登录/注册</button>
      </div>
      <!-- AuthModal 在登录提示区域内显示 -->
      <AuthModal v-if="showAuthModal" :is-login="isLogin" @close="showAuthModal = false" @login="handleLogin" />
    </div>

    <!-- 游戏开始界面 -->
    <div v-else-if="!gameLoaded" class="game-start-screen">
      <div class="game-start-bg" style="background-image: url('/assets/game_cover_bg_1920x1080.jpg');"></div>
      <div class="game-start-overlay"></div>
      <div class="game-start-content">
        <div class="title-wrapper">
          <div class="title-decoration left"></div>
          <div class="title-main">
            <h1 class="game-title">史策<span class="rogue-text">ROGUE</span></h1>
            <p class="game-subtitle">历史乱世 · 武将羁绊 · 策略</p>
          </div>
          <div class="title-decoration right"></div>
        </div>
      </div>
      <div class="progress-footer">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
        </div>
        <div class="progress-text">{{ loadingProgress }}%</div>
      </div>
    </div>

    <!-- 登录后游戏主界面 -->
    <div v-else class="game-container" :class="{ 'screen-shake': isScreenShaking }">
      <div class="game-header">
        <!-- 游戏顶部信息 -->
        <!-- 顶部状态栏 -->
        <div class="ui-top-bar-status">
          <div class="game-info">
            <div class="info-item" @mouseenter="showHeaderTooltip($event, 'money')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/money.webp" alt="金额" class="info-icon">
              <span class="info-value">{{ money }}</span>
            </div>
            <div class="info-item" @mouseenter="showHeaderTooltip($event, 'wave')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/turn.webp" alt="波次" class="info-icon">
              <span class="info-value">{{ currentWave }}/{{ totalWaves }}</span>
            </div>
            <div class="info-item" :class="{ 'command-warning': currentCommand > maxCommand }"
              @mouseenter="showHeaderTooltip($event, 'command')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/command.webp" alt="统率" class="info-icon">
              <span class="info-value">{{ currentCommand }}/{{ maxCommand }}</span>
            </div>
            <div class="info-item" @mouseenter="showHeaderTooltip($event, 'conscript')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/command.webp" alt="征召兵" class="info-icon">
              <span class="info-value">{{ displayAvailableConscripts }}/{{ displayTotalConscripts }}</span>
            </div>
          </div>
        </div>

        <!-- 悬浮提示框 -->
        <div v-show="tooltip.visible" class="tooltip-popup" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
          {{ tooltip.text }}
        </div>

        <div class="game-area">
          <!-- 初始遗物选择 -->
          <RewardSelector
            :visible="showRelicSelector"
            title="请选择本局遗物（3选1）"
            :dialog-line="cuiJueRelicDialogLine"
            :portrait="cuiJuePortrait"
            :candidates="playerRelicCandidates"
            mode="relic"
            @select="selectPlayerRelic"
          />
          <!-- 战斗胜利奖励选择 -->
          <RewardSelector
            :visible="showVictoryRewardSelector"
            title="战斗胜利 · 崔珏裁赏（三选一）"
            :dialog-line="cuiJueRewardDialogLine"
            :portrait="cuiJuePortrait"
            :candidates="victoryRewardOptions"
            mode="reward"
            @select="selectVictoryReward"
          />
          <!-- 层完成奖励选择 -->
          <RewardSelector
            :visible="showLayerRewardSelector"
            :title="`第 ${currentAct} 层完成 · 崔珏犒赏`"
            :dialog-line="layerRewardDialogLine"
            :portrait="cuiJuePortrait"
            :candidates="layerRewardOptions"
            mode="reward"
            @select="selectLayerReward"
          />
          <RelicAcquisitionModal
            :visible="showRelicAcquisitionModal"
            :relic="acquiringRelic"
            @close="showRelicAcquisitionModal = false"
          />
          <div v-for="(damageText, index) in damageTexts" :key="index" class="damage-text"
            :class="[`damage-${damageText.kind || 'normal'}`, { crit: !!damageText.critical }]" :style="{
            left: damageText.x + 'px',
            top: damageText.y + 'px',
            animationDelay: damageText.delay + 's',
          }">
            <span v-if="damageText.tag" class="damage-tag">{{ damageText.tag }}</span>{{ damageText.text }}
          </div>
          <div v-for="(quoteText, index) in quoteTexts" :key="index" class="quote-text" :style="{
            left: quoteText.x + 'px',
            top: quoteText.y + 'px',
            animationDelay: quoteText.delay + 's',
          }">
            {{ quoteText.text }}
          </div>
          <div v-if="!showBattleBoard" class="middle-hub">
            <div class="middle-hub-left">
              <RunMap
                :run-map="runMap"
                :current-map-floor="currentMapFloor"
                :pending-node-id="pendingNodeId"
                :map-node-icon-by-type="mapNodeIconByType"
                :node-type-title="nodeTypeTitle"
                :map-legend-items="mapLegendItems"
                :is-map-legend-collapsed="isMapLegendCollapsed"
                @select-node="selectEventNode"
                @toggle-legend="toggleMapLegend"
              />
            </div>
            <div class="middle-hub-right">
              <BattleReport :reports="battleReports" />
            </div>
          </div>
          <button
            v-if="showBattleBoard"
            class="map-toggle-btn"
            @click="showBattleMapDrawer = !showBattleMapDrawer"
          >
            {{ showBattleMapDrawer ? "收起事件树" : "展开事件树" }}
          </button>
          <div v-if="showBattleBoard" class="battle-map-drawer" :class="{ open: showBattleMapDrawer }">
            <RunMap
              :run-map="runMap"
              :current-map-floor="currentMapFloor"
              :pending-node-id="pendingNodeId"
              :map-node-icon-by-type="mapNodeIconByType"
              :node-type-title="nodeTypeTitle"
              :map-legend-items="mapLegendItems"
              :is-map-legend-collapsed="isMapLegendCollapsed"
              in-drawer
              @select-node="selectEventNode"
              @toggle-legend="toggleMapLegend"
            />
          </div>
          <div v-if="showBattleBoard" class="battle-stage">
            <FormationPanel
              side="player"
              :formation="playerFormation"
              :relics="playerRelics"
              :selected-slot="selectedSlot"
              :attacking-card="attackingCard"
              :is-battle-active="isBattleActive"
              :api-base-url="API_BASE_URL"
              @select-slot="({ side, position }) => selectSlot(side, position)"
              @show-tooltip="(slotKey, event) => showTooltip(slotKey, event)"
              @hide-tooltip="hideTooltip"
              @troops-bar-mousedown="(position, event) => handleTroopsBarMouseDown(position, event)"
            />
          <BattleReport :reports="battleReports" />
          <BattleStats
            v-if="showBattleStatsPanel"
            :stats="battleStats"
            :player-formation="playerFormation"
            :enemy-formation="enemyFormation"
            @close="showBattleStatsPanel = false"
          />
          <!-- 战斗场景 -->
            <FormationPanel
              side="enemy"
              :formation="enemyFormation"
              :relics="enemyRelics"
              :selected-slot="selectedSlot"
              :attacking-card="attackingCard"
              :is-battle-active="isBattleActive"
              :api-base-url="API_BASE_URL"
              @select-slot="({ side, position }) => selectSlot(side, position)"
              @show-tooltip="(slotKey, event) => showTooltip(slotKey, event)"
              @hide-tooltip="hideTooltip"
            />
          </div>
        </div>

        <!-- 选择武将界面 -->
        <GeneralList v-if="showGeneralList" :generals="generals" :API_BASE_URL="API_BASE_URL"
          :deployed-general-ids="deployedGeneralIds"
          :active-slot-general-id="activeSlotGeneralId"
          :rest-rounds-by-id="playerRecoveryRounds"
          @close="closeGeneralList" @select="(general) => {
            deployGeneral(general);
            hideTooltip();
          }" @show-tooltip="showGeneralTooltip" />

        <!-- 武将信息 -->
        <GeneralTooltip v-if="tooltipData" :general="tooltipData" :team-generals="tooltipTeamGenerals" @close="hideTooltip" />

        <!-- 底部操作按钮 -->
        <div v-if="showBattleBoard" class="game-footer">
          <button
            class="relic-auto-btn"
            :disabled="isBattleActive"
            @click="autoAllocateTroopsEvenly"
          >
            自动分配兵力
          </button>
          <button class="action-button recruit" @click="recruitCard" :disabled="money < RECRUIT_SINGLE_COST || isBattleActive"
            @mouseenter="showHeaderTooltip($event, 'recruit')" @mouseleave="hideHeaderTooltip">
            <img src="/assets/open.webp" alt="招募" class="button-icon">
            <span class="recruit-label">招募</span>
          </button>
          <button class="action-button end-turn" @click="endTurn"
            @mouseenter="showBattleControlTooltip($event)" @mouseleave="hideHeaderTooltip">
            <img :src="battleControlIcon" :alt="battleControlAlt" class="button-icon">
          </button>
          <div class="speed-controls">
            <button v-for="speed in speedOptions" :key="speed" class="speed-btn"
              :class="{ active: battleSpeed === speed }" @click="setBattleSpeed(speed)">
              {{ speed }}x
            </button>
            <button class="speed-btn skip-toggle" :class="{ active: skipBattleAnimation }" @click="toggleSkipBattle">
              {{ skipBattleAnimation ? "跳过战斗:开" : "跳过战斗:关" }}
            </button>
          </div>
        </div>

        <!-- 地图选择阶段底部操作按钮（仅招募） -->
        <div v-if="gamePhase === 'map_select' && gameLoaded" class="map-select-footer">
          <button class="action-button recruit" @click="recruitCard">
            <img src="/assets/open.webp" alt="招募" class="button-icon">
            <span class="recruit-label">招募</span>
          </button>
        </div>
      </div>

      <RecruitPanel
        ref="recruitPanel"
        v-model="money"
        v-model:purple-pity-count="purplePityCount"
        v-model:gold-pity-count="goldPityCount"
        @close="handleRecruitPanelClose"
        @recruit-done="handleRecruitDone"
        @auto-allocate-troops="autoAllocateTroopsEvenly"
      />

      <!-- 新手教程提示对话框 -->
      <div v-if="showTutorialPrompt" class="tutorial-prompt-overlay">
        <div class="tutorial-prompt-modal">
          <h2>是否需要新手教程？</h2>
          <p>学习游戏基本操作</p>
          <div class="tutorial-prompt-actions">
            <button class="tutorial-btn yes" @click="startTutorial">是</button>
            <button class="tutorial-btn no" @click="skipTutorial">否</button>
          </div>
        </div>
      </div>

      <!-- 新手教程弹窗 -->
      <TutorialModal
        :visible="tutorialActive"
        :step="currentTutorialStep"
        :current-step-index="tutorialStepIndex"
        :total-steps="TUTORIAL_STEPS.length"
        :can-skip="true"
        @skip="skipTutorial"
        @next="advanceTutorial"
      />
      <EventPanel
        :visible="showEventPanel"
        :event="currentEvent"
        @select="selectEventChoice"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import AuthModal from "../components/AuthModal.vue";
import GeneralTooltip from "../components/GeneralTooltip.vue";
import GeneralList from "../components/GeneralList.vue";
import BattleReport from "../components/BattleReport.vue";
import BattleStats from "../components/BattleStats.vue";
import FormationPanel from "../components/FormationPanel.vue";
import RunMap from "../components/RunMap.vue";
import RecruitPanel from "../components/RecruitPanel.vue";
import RewardSelector from "../components/RewardSelector.vue";
import TutorialModal from "../components/TutorialModal.vue";
import EventPanel from "../components/EventPanel.vue";
import RelicAcquisitionModal from "../components/relic/RelicAcquisitionModal.vue";
import type { General, GeneralRarity, FormationPosition } from "../skills/types";
import { RARITY_CONFIG } from "../skills/types";
import type {
  GamePhase,
  NodeType,
  MapNode,
  RunMap as RunMapType,
  VictoryRewardOption,
  GeneralBattleSnapshot,
} from "../types/game";
import { RELIC_POOL, getEnemyWaveRelic, pickWeightedRelics, type Relic } from "../relics";
import { RECRUIT_CONFIG, getFetchFunctionBase, activateBonds } from '../skills/index';
import { EVENTS_DATA } from '../events/events-data';
import type { MapEvent, EventChoice, Effect } from '../events/event-types';

// ========== 认证与初始化 ==========
// 是否已登录（通过 localStorage 中的 user 数据判断）
const isLoggedIn = ref(false);
// 是否显示登录/注册弹窗
const showAuthModal = ref(false);
// 弹窗模式：true=登录，false=注册
const isLogin = ref(true);

// ========== 游戏加载状态 ==========
// 游戏主界面是否已加载完成（false=显示加载动画，true=显示游戏内容）
const gameLoaded = ref(false);
// 游戏加载进度（0-100），用于显示加载条
const loadingProgress = ref(0);

// ========== 悬浮提示 ==========
// 顶部状态栏的悬浮提示（控制显隐、文本、位置）
const tooltip = ref({
  visible: false,
  text: '',
  x: 0,
  y: 0,
});

// 各状态项对应的中文说明文本
const tooltipTexts: Record<string, string> = {
  money: '当前金币数量',
  wave: '当前波次/总波次',
  command: '当前统率/最大统率',
  conscript: '可分配征召兵/总征召兵（开局3000）',
  recruit: '消耗100金币单抽招募武将，已拥有则升星',
  recruitTen: '消耗1000金币十连招募，必出紫色及以上稀有度，已拥有升星，超限返金币',
  start: '开始战斗',
  next: '进入下一轮战斗',
};

// 显示顶部状态栏悬浮提示（根据 key 查找对应文本）
const showHeaderTooltip = (event: MouseEvent, key: string) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  tooltip.value = {
    visible: true,
    text: tooltipTexts[key] || '',
    x: rect.left + rect.width / 2,
    y: rect.bottom + 10,
  };
};

// 隐藏顶部状态栏悬浮提示
const hideHeaderTooltip = () => {
  tooltip.value.visible = false;
};

// 显示战斗控制按钮的悬浮提示（开始/继续/暂停）
const showBattleControlTooltip = (event: MouseEvent) => {
  const text = !isBattleActive.value
    ? "开始战斗"
    : isBattlePaused.value
      ? "继续战斗"
      : "暂停战斗";
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  tooltip.value = {
    visible: true,
    text,
    x: rect.left + rect.width / 2,
    y: rect.bottom + 10,
  };
};

// ========== 游戏初始数据 ==========
// 游戏各数值的初始值（resetGame 时恢复使用）
const initialGameData = {
  money: 0,
  currentYear: -2070,
  currentWave: 1,
};

// 当前金币数量
const money = ref(initialGameData.money);
// 当前游戏年份（显示用）
const currentYear = ref(initialGameData.currentYear);
// 当前波次（与地图层数对应）
const currentWave = ref(initialGameData.currentWave);
// 总波次数（游戏通关目标）
const totalWaves = ref(300);
// 当前战斗回合数（每场战斗共 8 回合）
const currentTurn = ref(0);
// ========== 招募消耗与保底 ==========
// 单抽消耗金币（10连抽 = 消耗 * 10，保底触发时只扣单抽费用）
const RECRUIT_SINGLE_COST = 100;
// 当前保底计数器（保底触发后独立清零）
const purplePityCount = ref(0);
const goldPityCount = ref(0);

// 玩家最大统率上限
const maxCommand = ref(100);
// 当前上阵武将的统率消耗总和
const currentCommand = ref(0);
// 每种稀有度武将的最高星级上限
const MAX_STAR_BY_RARITY: Record<string, number> = {
  common: 5,
  uncommon: 5,
  rare: 5,
  legendary: 5,
};
// 征召兵上限（固定 3000）
const maxConscripts = 3000;
// 当前总征召兵数量（含已分配和可分配的）
const totalConscripts = ref(maxConscripts);

// API 根地址（从环境变量读取，开发环境默认 localhost:3000）
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ========== 人物数据 ==========
// 从后端获取的原始人物数据列表（用于生成敌方队伍）
const characters = ref<any[]>([]);
// 是否正在加载人物数据
const loadingCharacters = ref(false);

// ========== 兵种克制关系 ==========
// 克制规则：攻击方兵种克制目标兵种时，伤害额外 +30%
const soldierType克制 = {
  骑兵: "步兵",
  步兵: "弓兵",
  弓兵: "骑兵",
};

// ========== 新手教程系统 ==========
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  actionHint?: string;
  targetSelector?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  effect?: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro-ui',
    title: '界面介绍',
    description: '这里是顶部状态栏，显示你的金钱、波次、统率等信息。顶部还有征召兵数量。',
    targetSelector: '.ui-top-bar-status',
    tooltipPosition: 'bottom'
  },
  {
    id: 'click-battle-node',
    title: '选择战斗节点',
    description: '点击地图上的战斗节点进入战斗。首先需要选择地图上的战斗节点。',
    targetSelector: '.event-node-btn.type-battle',
    tooltipPosition: 'right'
  },
  {
    id: 'trigger-battle',
    title: '进入战斗',
    description: '遭遇战斗！战斗开始前需要上阵武将。',
    tooltipPosition: 'bottom'
  },
  {
    id: 'need-general',
    title: '上阵武将',
    description: '上阵一位武将到大营位置才可以开始战斗。让我们先进行招募获取武将！',
    targetSelector: '.map-select-footer .action-button.recruit',
    tooltipPosition: 'top'
  },
  {
    id: 'recruit-no-gold',
    title: '金币不足',
    description: '金币不足无法招募！系统赠送900金币作为新手奖励！',
    effect: () => {
      money.value += 900;
      addReport('教程赠送金币 +900');
    }
  },
  {
    id: 'ten-recruit',
    title: '十连招募',
    description: '现在进行十连招募，必出紫色及以上品质的武将！点击十连按钮。',
    targetSelector: '.mode-card.ten',
    tooltipPosition: 'left'
  },
  {
    id: 'deploy',
    title: '上阵武将',
    description: '将招募到的武将拖拽或点击到大营位置。',
    targetSelector: '.player-side .card-slot:first-child',
    tooltipPosition: 'right'
  },
  {
    id: 'auto-allocate',
    title: '自动分配兵力',
    description: '点击自动分配兵力，为武将分配征召兵。',
    targetSelector: '.game-footer .relic-auto-btn',
    tooltipPosition: 'top'
  },
  {
    id: 'speed',
    title: '战斗速度',
    description: '设置战斗速度和跳过动画。可以使用2倍速度并跳过战斗动画。',
    targetSelector: '.game-footer .speed-controls',
    tooltipPosition: 'top'
  },
  {
    id: 'start-battle',
    title: '开始战斗',
    description: '一切准备就绪！点击开始战斗按钮，正式进入战斗！',
    targetSelector: '.game-footer .action-button.end-turn',
    tooltipPosition: 'top'
  }
];

const showTutorialPrompt = ref(false);
const tutorialActive = ref(false);
const tutorialStepIndex = ref(0);

const currentTutorialStep = computed(() =>
  tutorialActive.value ? TUTORIAL_STEPS[tutorialStepIndex.value] : null
);

const startTutorial = () => {
  showTutorialPrompt.value = false;
  tutorialActive.value = true;
  tutorialStepIndex.value = 0;
};

const skipTutorial = () => {
  showTutorialPrompt.value = false;
  tutorialActive.value = false;
};

const advanceTutorial = () => {
  console.log('advanceTutorial called, currentStep:', currentTutorialStep.value?.id);
  // 第二步（click-battle-node）需要等待点击战斗节点
  const currentStep = currentTutorialStep.value;
  if (currentStep?.id === 'click-battle-node') {
    addReport('请先点击地图上的战斗节点');
    return;
  }

  if (tutorialStepIndex.value < TUTORIAL_STEPS.length - 1) {
    tutorialStepIndex.value++;
    const step = TUTORIAL_STEPS[tutorialStepIndex.value];
    console.log('Advanced to step:', tutorialStepIndex.value, step?.id);
    if (step.effect) {
      step.effect();
    }
  } else {
    completeTutorial();
  }
};

const completeTutorial = () => {
  tutorialActive.value = false;
  addReport('新手教程完成！');
};

// 监听金币变化用于触发赠送金币步骤后的自动推进
watch(money, (newMoney, oldMoney) => {
  if (!tutorialActive.value) return;
  const step = currentTutorialStep.value;
  if (step?.id === 'recruit-no-gold' && newMoney > oldMoney && newMoney >= 900) {
    advanceTutorial();
  }
});

// ========== 游戏状态监听 ==========
// 监听登录状态变化：登录成功后自动开始游戏加载流程
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    startGameLoading();
  }
});

// 启动游戏加载动画（模拟加载过程，进度从 0 增长到 100）
const startGameLoading = () => {
  loadingProgress.value = 0;
  gameLoaded.value = false;

  const loadingInterval = setInterval(() => {
    loadingProgress.value += 50;
    if (loadingProgress.value >= 100) {
      clearInterval(loadingInterval);
      setTimeout(() => {
        gameLoaded.value = true;
        // 每次游戏加载完成后都显示教程提示
        showTutorialPrompt.value = true;
      }, 500);
    }
  }, 150);
};

// ========== 组件挂载 ==========
// 组件挂载时：检查登录状态 → 获取人物数据 → 重置地图进度
onMounted(() => {
  if (isLoggedIn.value) {
    startGameLoading();
  }
});

// ========== 获取人物数据 ==========
// 从后端 API 获取人物列表（用于生成敌方武将）
const fetchCharacters = async () => {
  try {
    loadingCharacters.value = true;
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 分页获取前 50 个人物数据
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("pageSize", "50");

    const response = await fetch(
      `${API_BASE_URL}/characters?${params.toString()}`,
      {
        headers,
      },
    );

    if (!response.ok) {
      throw new Error("获取人物列表失败");
    }

    const data = await response.json();
    characters.value = data.data || [];
    console.log("获取到人物:", characters.value.length);
  } catch (error) {
    console.error("获取人物失败:", error);
  } finally {
    loadingCharacters.value = false;
  }
};

// ========== 队伍编成 ==========
// 玩家阵营的三位置编成（大营/中军/前锋），null 表示空位
const playerFormation = ref({
  大营: null as General | null,
  中军: null as General | null,
  前锋: null as General | null,
});

// 敌方阵营的三位置编成
const enemyFormation = ref({
  大营: null as General | null,
  中军: null as General | null,
  前锋: null as General | null,
});

// ========== 战斗快照 ==========
// 战斗开始时的状态快照（用于战后恢复：保留/恢复兵力、清除战斗中的状态变化）
const battleStartSnapshot = ref<{
  player: Record<FormationPosition, GeneralBattleSnapshot | null>;
  enemy: Record<FormationPosition, GeneralBattleSnapshot | null>;
}>({
  player: { 大营: null, 中军: null, 前锋: null },
  enemy: { 大营: null, 中军: null, 前锋: null },
});

// 从武将对象创建战斗快照数据
const createGeneralSnapshot = (
  general: General | null,
): GeneralBattleSnapshot | null => {
  if (!general) return null;
  return {
    attack: general.attack,
    defense: general.defense,
    strategy: general.strategy,
    speed: general.speed,
    siege: general.siege,
    troops: general.troops,
    maxTroops: general.maxTroops,
    isDead: general.isDead,
    skillEffects: { ...(general.skillEffects || {}) },
  };
};

// 捕获当前编成状态为快照（战斗开始时调用）
const captureBattleStartSnapshot = () => {
  (Object.keys(playerFormation.value) as FormationPosition[]).forEach((position) => {
    battleStartSnapshot.value.player[position] = createGeneralSnapshot(
      playerFormation.value[position],
    );
    battleStartSnapshot.value.enemy[position] = createGeneralSnapshot(
      enemyFormation.value[position],
    );
  });
};

// 从快照恢复武将状态（preserveTroops=true 时保留当前兵力，否则恢复满兵）
const restoreGeneralFromSnapshot = (
  general: General | null,
  snapshot: GeneralBattleSnapshot | null,
  options?: { preserveTroops?: boolean },
) => {
  if (!general || !snapshot) return;
  const preserveTroops = !!options?.preserveTroops;
  const currentTroops = general.troops;
  const currentIsDead = general.isDead;

  general.attack = snapshot.attack;
  general.defense = snapshot.defense;
  general.strategy = snapshot.strategy;
  general.speed = snapshot.speed;
  general.siege = snapshot.siege;
  general.maxTroops = snapshot.maxTroops;
  if (preserveTroops) {
    general.troops = Math.max(0, Math.min(currentTroops, snapshot.maxTroops));
    general.isDead = currentIsDead || general.troops <= 0;
  } else {
    general.troops = snapshot.maxTroops;
    general.isDead = false;
  }
  general.skillEffects = {};
};

// 将双方编成恢复到战斗开始时的状态
const restoreBattleStateToInitial = (options?: { preserveTroops?: boolean }) => {
  (Object.keys(playerFormation.value) as FormationPosition[]).forEach((position) => {
    restoreGeneralFromSnapshot(
      playerFormation.value[position],
      battleStartSnapshot.value.player[position],
      options,
    );
    restoreGeneralFromSnapshot(
      enemyFormation.value[position],
      battleStartSnapshot.value.enemy[position],
      options,
    );
  });
};

// ========== 武将数据 ==========
// 玩家拥有的武将列表（招募获得，可上阵/下阵）
const generals = ref<General[]>([]);
// 武将休整记录：key=武将ID，value=还需休整的回合数（阵亡后进入休整）
const playerRecoveryRounds = ref<Record<number, number>>({});
// 当前选中的编成槽位（格式："player-大营"）
const selectedSlot = ref<string | null>(null);
// 是否显示武将列表弹窗
const showGeneralList = ref(false);
// 战斗播报信息列表（显示在 BattleReport 组件中）
const battleReports = ref<string[]>([]);
// ========== 战斗系统 ==========
// 战斗是否进行中（影响兵力分配、动画等）
const isBattleActive = ref(false);
// 战斗是否已暂停
const isBattlePaused = ref(false);
// 战斗是否正在启动中（防止重复启动）
const isBattleStarting = ref(false);
// 战斗速度倍率（1/2/4/8x）
const battleSpeed = ref(1);
// 是否跳过战斗动画（直接结算，跳过过程动画）
const skipBattleAnimation = ref(false);
// 可选的战斗速度选项
const speedOptions = [1, 2, 4, 8];
// 战斗控制按钮图标（根据状态显示开始/暂停图标）
const battleControlIcon = computed(() => {
  if (!isBattleActive.value || isBattlePaused.value) return "/assets/start.webp";
  return "/assets/pause_btn.png";
});
// 战斗控制按钮的辅助文字
const battleControlAlt = computed(() => {
  if (!isBattleActive.value) return "开始";
  return isBattlePaused.value ? "继续" : "暂停";
});

// ========== 战斗统计 ==========
// 战斗统计面板数据
interface BattleStats {
  dealt: {
    player: { 大营: number; 中军: number; 前锋: number };
    enemy: { 大营: number; 中军: number; 前锋: number };
  };
  healing: {
    player: { 大营: number; 中军: number; 前锋: number };
    enemy: { 大营: number; 中军: number; 前锋: number };
  };
}
const battleStats = ref<BattleStats>({
  dealt: {
    player: { 大营: 0, 中军: 0, 前锋: 0 },
    enemy: { 大营: 0, 中军: 0, 前锋: 0 },
  },
  healing: {
    player: { 大营: 0, 中军: 0, 前锋: 0 },
    enemy: { 大营: 0, 中军: 0, 前锋: 0 },
  },
});
// 是否显示战斗统计面板
const showBattleStatsPanel = ref(false);

// ========== 征召兵管理 ==========
// 已提交到上阵武将的征召兵总量
const committedConscripts = ref(0);
// 战斗锁定后保存的已用征召兵数量
const battleLockedUsedConscripts = ref<number | null>(null);
// 战斗锁定后可分配征召兵数量快照
const battleLockedAvailableConscripts = ref<number | null>(null);
// 战斗锁定后总征召兵数量快照
const battleLockedTotalConscripts = ref<number | null>(null);

// 将 committedConscripts 同步为当前上阵武将的兵力总和
const syncCommittedConscriptsFromFormation = () => {
  committedConscripts.value = calculateUsedConscripts();
};

// 锁定征召兵快照（战斗开始时调用，保存当前分配状态）
const lockBattleConscriptSnapshot = () => {
  const used = committedConscripts.value;
  battleLockedUsedConscripts.value = used;
  battleLockedAvailableConscripts.value = Math.max(0, totalConscripts.value - used);
  battleLockedTotalConscripts.value = totalConscripts.value;
};

// 解除征召兵锁定（战斗结束后调用）
const unlockBattleConscriptSnapshot = () => {
  battleLockedUsedConscripts.value = null;
  battleLockedAvailableConscripts.value = null;
  battleLockedTotalConscripts.value = null;
};

// 计算当前上阵武将已使用的征召兵总量
const calculateUsedConscripts = () =>
  Object.values(playerFormation.value).reduce((sum, general) => {
    if (!general) return sum;
    return sum + Math.max(0, general.troops || 0);
  }, 0);

// 已使用的征召兵（用于显示）
const usedConscripts = computed(() => {
  return Math.max(0, committedConscripts.value);
});

// 可分配的征召兵数量（战斗中取快照值，战斗外实时计算）
const availableConscripts = computed(() => {
  if (
    isBattleActive.value &&
    battleLockedAvailableConscripts.value !== null
  ) {
    return battleLockedAvailableConscripts.value;
  }
  return Math.max(0, totalConscripts.value - usedConscripts.value);
});

// 界面上显示的可分配征召兵（战斗中取快照值）
const displayAvailableConscripts = computed(() => {
  if (
    isBattleActive.value &&
    battleLockedAvailableConscripts.value !== null
  ) {
    return battleLockedAvailableConscripts.value;
  }
  return availableConscripts.value;
});

// 界面上显示的总征召兵（战斗中取快照值）
const displayTotalConscripts = computed(() => {
  if (
    isBattleActive.value &&
    battleLockedTotalConscripts.value !== null
  ) {
    return battleLockedTotalConscripts.value;
  }
  return totalConscripts.value;
});
// ========== 伤害与特效 ==========
// 战斗中显示的伤害数值列表（绝对定位在卡牌上，2秒后自动移除）
const damageTexts = ref<any[]>([]);
// 战斗中显示的武将台词列表（绝对定位在卡牌上，3秒后自动移除）
const quoteTexts = ref<any[]>([]);
// 当前正在攻击的卡牌标识（格式："player-大营"，用于控制攻击动画样式）
const attackingCard = ref<string | null>(null);
// 战斗特效等级（影响动画时长、震动幅度等）
const battleFxLevel = ref<"low" | "medium" | "high">("medium");
// 屏幕震动效果开关
const isScreenShaking = ref(false);

// ========== 战斗特效配置 ==========
// 不同特效等级下的动画参数（windup=前摇,dash=冲刺,recover=恢复,hit=受击）
const FX_PROFILES = {
  low: {
    windupMs: 60,
    dashMs: 90,
    recoverMs: 120,
    hitShakeMs: 90,
    hitFlashMs: 70,
    hitOutlineMs: 130,
    hitThrottleMs: 120,
    dashDistance: 56,
    highDamageRatio: 0.1,
    critDamageRatio: 0.18,
  },
  medium: {
    windupMs: 80,
    dashMs: 120,
    recoverMs: 180,
    hitShakeMs: 140,
    hitFlashMs: 110,
    hitOutlineMs: 220,
    hitThrottleMs: 80,
    dashDistance: 96,
    highDamageRatio: 0.08,
    critDamageRatio: 0.16,
  },
  high: {
    windupMs: 90,
    dashMs: 140,
    recoverMs: 220,
    hitShakeMs: 180,
    hitFlashMs: 140,
    hitOutlineMs: 260,
    hitThrottleMs: 70,
    dashDistance: 120,
    highDamageRatio: 0.07,
    critDamageRatio: 0.14,
  },
} as const;

type FxProfile = (typeof FX_PROFILES)[keyof typeof FX_PROFILES];

// 获取当前特效等级的参数配置
const getFxProfile = (): FxProfile => FX_PROFILES[battleFxLevel.value];

// 活跃特效定时器集合（key=卡牌标识，value=定时器ID列表，用于清除）
const activeFxTimers = new Map<string, number[]>();
// 上次受击时间记录（用于节流，避免同一目标受击动画过于频繁）
const targetHitLastAt = new Map<string, number>();

// 清除指定卡牌的所有特效定时器
const clearFxTimers = (key: string) => {
  const timers = activeFxTimers.get(key);
  if (!timers) return;
  timers.forEach((timerId) => window.clearTimeout(timerId));
  activeFxTimers.delete(key);
};

// 清除所有战斗特效（战斗结束时调用，清除所有定时器和动画状态）
const clearAllBattleFx = () => {
  for (const key of activeFxTimers.keys()) {
    clearFxTimers(key);
  }
  targetHitLastAt.clear();
  isScreenShaking.value = false;
  attackingCard.value = null;
  (["player", "enemy"] as const).forEach((side) => {
    (["大营", "中军", "前锋"] as const).forEach((position) => {
      clearAttackerPhase(side, position);
      const card = getCardElement(side, position);
      if (!card) return;
      card.classList.remove(
        "target-hit-shake",
        "target-hit-flash",
        "target-hit-outline",
        "target-hit-heavy",
      );
    });
  });
};

// 注册特效定时器（将定时器ID关联到卡牌key，便于统一清除）
const registerFxTimer = (key: string, timerId: number) => {
  const timers = activeFxTimers.get(key) || [];
  timers.push(timerId);
  activeFxTimers.set(key, timers);
};

// 根据 side 和 position 查找对应卡牌的 DOM 元素
const getCardElement = (side: "player" | "enemy", position: string) =>
  document.querySelector(
    `[data-card-side="${side}"][data-card-position="${position}"]`,
  ) as HTMLElement | null;

// ========== 攻击动画阶段控制 ==========
// 设置攻击方动画阶段（windup=前摇,dash=冲刺,recover=恢复），驱动 CSS 动画
const markAttackerPhase = (
  side: "player" | "enemy",
  position: string,
  phase: "windup" | "dash" | "recover",
) => {
  const key = `${side}-${position}`;
  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove("attacker-windup", "attacker-dash", "attacker-recover");
  card.style.removeProperty("--dash-distance");
  card.style.removeProperty("--dash-direction");
  if (phase === "dash") {
    const direction = side === "player" ? 1 : -1;
    card.style.setProperty("--dash-distance", `${getFxProfile().dashDistance}px`);
    card.style.setProperty("--dash-direction", `${direction}`);
  }
  card.classList.add(`attacker-${phase}`);
  attackingCard.value = key;
};

// 清除攻击方动画阶段（攻击结束后调用）
const clearAttackerPhase = (side: "player" | "enemy", position: string) => {
  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove("attacker-windup", "attacker-dash", "attacker-recover");
  card.style.removeProperty("--dash-distance");
  card.style.removeProperty("--dash-direction");
  attackingCard.value = null;
};

// ========== 受击动画 ==========
// 触发目标受击反应（抖动+闪白+描边），高伤害时额外加重
const triggerTargetHitReaction = (
  side: "player" | "enemy",
  position: string,
  isHighDamage: boolean,
) => {
  const key = `${side}-${position}`;
  const now = Date.now();
  // 节流：同一目标短时间内不重复触发动画
  if (now - (targetHitLastAt.get(key) || 0) < getFxProfile().hitThrottleMs) {
    return;
  }
  targetHitLastAt.set(key, now);
  clearFxTimers(key);

  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove(
    "target-hit-shake",
    "target-hit-flash",
    "target-hit-outline",
    "target-hit-heavy",
  );
  void card.offsetWidth;
  card.classList.add("target-hit-shake", "target-hit-flash", "target-hit-outline");
  if (isHighDamage) {
    card.classList.add("target-hit-heavy");
  }

  // 分阶段清除各类动画效果
  registerFxTimer(
    key,
    window.setTimeout(() => {
      card.classList.remove("target-hit-shake", "target-hit-heavy");
    }, getFxProfile().hitShakeMs),
  );
  registerFxTimer(
    key,
    window.setTimeout(() => {
      card.classList.remove("target-hit-flash");
    }, getFxProfile().hitFlashMs),
  );
  registerFxTimer(
    key,
    window.setTimeout(() => {
      card.classList.remove("target-hit-outline");
      clearFxTimers(key);
    }, getFxProfile().hitOutlineMs),
  );
};

// ========== 遗物系统 ==========
// 遗物选择候选列表（三选一界面显示）
const playerRelicCandidates = ref<Relic[]>([]);
// 玩家当前持有的遗物列表
const playerRelics = ref<Relic[]>([]);
// 敌方当前持有的遗物列表（每波从配置中读取）
const enemyRelics = ref<Relic[]>([]);
// 是否显示遗物选择弹窗（开局时触发）
const showRelicSelector = ref(false);
// 遗物获得动画弹窗状态
const showRelicAcquisitionModal = ref(false);
const acquiringRelic = ref<Relic | null>(null);
// ========== 奖励系统 ==========
// 是否显示战斗胜利奖励选择弹窗
const showVictoryRewardSelector = ref(false);
// 战斗胜利时的三个可选奖励
const victoryRewardOptions = ref<VictoryRewardOption[]>([]);
// 是否正在处理奖励（防止重复触发）
const isResolvingVictoryReward = ref(false);
// 崔珏裁赏胜利奖励阶段的台词
const cuiJueRewardDialogLine = ref("此战有功，生死簿前，许你择其一赏。");

// ========== 游戏阶段与地图 ==========
// 当前游戏阶段（map_select=选节点, encounter_resolve=处理事件, reward_resolve=奖励选择等）
const gamePhase = ref<GamePhase>("map_select");
// 是否显示事件地图
const showEventMap = ref(true);
// 当前整局跑图数据（包含所有楼层和节点）
const runMap = ref<RunMapType | null>(null);
// 招募面板引用
const recruitPanel = ref<{ open: () => void } | null>(null);
// 待处理的节点ID（已选择但尚未完成事件）
const pendingNodeId = ref<string | null>(null);
// 待处理节点的战斗类型（battle/elite/boss，null=非战斗节点）
const pendingBattleNodeType = ref<NodeType | null>(null);
// 当前处于第几幕/几层（击败Boss后递增）
const currentAct = ref(1);
// 层完成奖励的三个可选项
const layerRewardOptions = ref<VictoryRewardOption[]>([]);
// 是否显示层完成奖励选择弹窗
const showLayerRewardSelector = ref(false);
// 层奖励选择时崔珏的台词
const layerRewardDialogLine = ref("");

// ========== 事件系统状态 ==========
// 已禁用的事件ID集合（选择后会禁用某些事件）
const disabledEvents = ref<Set<string>>(new Set());
// 全局标记（影响事件权重和后续事件触发）
const eventFlags = ref<Set<string>>(new Set());
// 当前展示的事件
const currentEvent = ref<MapEvent | null>(null);
// 是否显示事件选择面板
const showEventPanel = ref(false);
// 待添加的武将队列（addGeneral 效果需要异步获取）
const pendingGeneralAdditions = ref<string[]>([]);

// ========== 地图配置 ==========
// 地图生成参数（楼层数、每层节点数、连接规则等）
const MAP_CONFIG = {
  minFloors: 8,
  maxFloors: 10,
  minNodesPerFloor: 2,
  maxNodesPerFloor: 4,
  maxConnectionsPerNode: 2,
  defaultNodePool: ["battle", "event", "treasure", "rest", "shop"] as NodeType[],
} as const;

// ========== 崔琰台词 ==========
// 崔琰（游戏中的判官NPC）在各场景下的随机台词
const cuiJueQuotes = {
  newRun: [  // 开局/重新开始时
    "生死簿上，名字又添一笔。这一世，你打算如何书写？",
    "我见过无数魂魄来来去去，却少有人能真正改写命数。你，会是例外吗？",
    "又回到起点了。记住，每一步选择，都在命运的天平上。",
  ],
  relic: [  // 遗物选择时
    "这些是前人留下的痕迹。有的带着荣耀，有的染着遗憾——你选哪个？",
    "命运从不免费馈赠，每一次获得，背后都有代价。想清楚了吗？",
  ],
  battle: [  // 战斗开始时
    "前方凶险，但你心中自有明灯。去吧，判官看着你呢。",
    "我判过无数善恶，却判不出你的命数——因为那在你自己手中。",
  ],
  defeat: [  // 战斗失败时
    "又一个轮回落幕……但故事未完。休息片刻，再重新开始吧。",
    "虚负凌云万丈才，一生襟抱未曾开——你还有机会，别让这句话成真。",
  ],
  victory: [  // 战斗胜利时
    "这一局，你赢了。生死簿上，又多了一个传奇。",
    "判官见证过无数成败，而你——值得被记住。",
  ],
};

// 是否已显示过开局崔琰台词（防止重复显示）
const hasShownNewRunQuote = ref(false);
// 崔琰头像图片路径
const cuiJuePortrait = "/assets/cui_jue.webp";
// 遗物选择时崔琰的台词
const cuiJueRelicDialogLine = ref("这些是前人留下的痕迹。有的带着荣耀，有的染着遗憾——你选哪个？");

// ========== 监听游戏事件自动推进教程 ==========
watch(gamePhase, (phase) => {
  console.log('gamePhase watch triggered:', phase, 'tutorialActive:', tutorialActive.value, 'currentStep:', currentTutorialStep.value?.id);
  if (!tutorialActive.value) return;
  const step = currentTutorialStep.value;
  // 点击战斗节点后进入 encounter_resolve
  if (step?.id === 'click-battle-node' && phase === 'encounter_resolve') {
    console.log('Advancing from step 2 to step 3');
    advanceTutorial();
  }
});

watch(isBattleActive, (active, prevActive) => {
  if (!tutorialActive.value) return;
  const step = currentTutorialStep.value;
  // 只有从 false 变成 true 时才触发（避免初始状态已为 true 时误触发）
  if (active && !prevActive) {
    if (step?.id === 'trigger-battle') {
      advanceTutorial();
    }
    if (step?.id === 'start-battle') {
      advanceTutorial();
    }
  }
});

// ========== 地图节点配置 ==========
// 各类型节点对应的图标路径
const mapNodeIconByType: Record<NodeType, string> = {
  event: "/assets/icon_event.png",
  battle: "/assets/icon_sword.png",
  treasure: "/assets/icon_treasure.png",
  shop: "/assets/wallet_icon.png",
  rest: "/assets/campfire_single.png",
  elite: "/assets/emenry_load.png",
  boss: "/assets/crown_icon.png",
};

// 各类型节点的鼠标悬停提示文字
const nodeTypeTitle: Record<NodeType, string> = {
  battle: "普通战斗",
  elite: "精英战斗",
  event: "随机事件",
  treasure: "宝物节点",
  rest: "休整节点",
  shop: "商店节点",
  boss: "Boss战",
};

// ========== 地图生成（确定性随机） ==========
// 哈希种子函数：将一个数字转换为确定性随机数生成器（用于服务端可复现的随机）
const hashSeed = (seed: number) => {
  let h = seed >>> 0;
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// 在 [min, max] 范围内生成一个整数（使用给定 RNG）
const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

// 根据楼层权重随机决定节点类型（最后层=Boss，中层有一定概率精英）
const pickWeightedNodeType = (rng: () => number, floor: number, totalFloors: number): NodeType => {
  if (floor === totalFloors) return "boss";
  const eliteWeight = floor >= 3 && floor <= totalFloors - 2 ? 0.2 : 0.08;
  const roll = rng();
  if (roll < eliteWeight) return "elite";
  const pool = MAP_CONFIG.defaultNodePool;
  return pool[Math.floor(rng() * pool.length)];
};

// 将左右两层节点以不交叉的方式连接（左右各取中点附近配对，再随机额外连接）
const connectTwoFloorsNoCross = (left: MapNode[], right: MapNode[], rng: () => number) => {
  const edges = new Set<string>();
  const leftCount = left.length;
  const rightCount = right.length;
  const addEdge = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || fromIdx >= leftCount || toIdx < 0 || toIdx >= rightCount) return;
    edges.add(`${fromIdx}-${toIdx}`);
  };
  const parseEdge = (edge: string) => edge.split("-").map(Number) as [number, number];

  // 基础连接：每个左节点连接到对应右节点（按比例映射）
  for (let i = 0; i < leftCount; i++) {
    const j =
      leftCount === 1
        ? Math.floor((rightCount - 1) / 2)
        : Math.round((i * (rightCount - 1)) / (leftCount - 1));
    addEdge(i, j);
  }

  // 基础连接：每个右节点连接到对应左节点（按比例映射）
  for (let j = 0; j < rightCount; j++) {
    const i =
      rightCount === 1
        ? Math.floor((leftCount - 1) / 2)
        : Math.round((j * (leftCount - 1)) / (rightCount - 1));
    addEdge(i, j);
  }

  // 额外连接：随机为部分节点添加额外路径（保证地图可选性）
  for (let i = 0; i < leftCount; i++) {
    const currentTargets = [...edges]
      .map(parseEdge)
      .filter(([fromIdx]) => fromIdx === i)
      .map(([, toIdx]) => toIdx);
    if (currentTargets.length >= MAP_CONFIG.maxConnectionsPerNode) continue;
    if (rng() > 0.45) continue;
    const primary = currentTargets.length
      ? currentTargets[0]
      : Math.round((i * (rightCount - 1)) / Math.max(1, leftCount - 1));
    const candidates = [primary - 1, primary + 1].filter((toIdx) => toIdx >= 0 && toIdx < rightCount);
    // 过滤掉会导致边交叉的候选节点
    const safeCandidates = candidates.filter((cand) => {
      for (const edge of edges) {
        const [existingFrom, existingTo] = parseEdge(edge);
        if (existingFrom === i) continue;
        if ((existingFrom < i && existingTo > cand) || (existingFrom > i && existingTo < cand)) {
          return false;
        }
      }
      return true;
    });
    if (safeCandidates.length > 0) {
      const pick = safeCandidates[randInt(rng, 0, safeCandidates.length - 1)];
      addEdge(i, pick);
    }
  }

  // 将边信息写入节点的 linksTo 字段
  for (const edge of edges) {
    const [fromIdx, toIdx] = parseEdge(edge);
    left[fromIdx].linksTo.push(right[toIdx].id);
  }
};

// ========== 地图生成 ==========
// 生成整张跑图地图（使用时间戳作为随机种子）
const generateRunMap = (seed?: number): RunMapType => {
  const baseSeed = typeof seed === "number" ? seed : Date.now();
  const rng = hashSeed(baseSeed);
  const floorCount = randInt(rng, MAP_CONFIG.minFloors, MAP_CONFIG.maxFloors);
  const nodes: MapNode[] = [];
  const floorNodes: MapNode[][] = [];

  for (let floor = 1; floor <= floorCount; floor++) {
    const isBossFloor = floor === floorCount;
    const nodeCount = isBossFloor
      ? 1
      : randInt(rng, MAP_CONFIG.minNodesPerFloor, MAP_CONFIG.maxNodesPerFloor);
    const thisFloorNodes: MapNode[] = [];
    for (let lane = 0; lane < nodeCount; lane++) {
      const node: MapNode = {
        id: `f${floor}-l${lane}`,
        floor,
        lane,
        yOffset: (rng() - 0.5) * 8,
        type: pickWeightedNodeType(rng, floor, floorCount),
        linksTo: [],
        visited: false,
      };
      thisFloorNodes.push(node);
      nodes.push(node);
    }
    floorNodes.push(thisFloorNodes);
  }

  // 依次连接相邻楼层
  for (let floor = 0; floor < floorNodes.length - 1; floor++) {
    connectTwoFloorsNoCross(floorNodes[floor], floorNodes[floor + 1], rng);
  }

  const map: RunMapType = {
    act: 1,
    floors: floorCount,
    lanes: MAP_CONFIG.maxNodesPerFloor,
    nodes,
    currentNodeId: "start",
  };
  return map;
};

// ========== 无限层生成 ==========
// 当玩家击败一层Boss后，在已有地图基础上追加新楼层节点
const generateNextLayerNodes = (existingNodes: MapNode[]): MapNode[] => {
  const newFloor = existingNodes.reduce((m, n) => Math.max(m, n.floor), 0) + 1;
  const newNodes: MapNode[] = [];
  const nodeCount = 1;  // 新楼层只有1个Boss节点

  for (let lane = 0; lane < nodeCount; lane++) {
    const node: MapNode = {
      id: `f${newFloor}-l${lane}`,
      floor: newFloor,
      lane,
      yOffset: 0,
      type: "boss",
      linksTo: [],
      visited: false,
    };
    newNodes.push(node);
  }

  // 将上一层的Boss节点连接到新楼层节点
  const prevFloorNodes = existingNodes.filter((n) => n.floor === newFloor - 1);
  for (const prevNode of prevFloorNodes) {
    const nextNode = newNodes.find((n) => n.floor === newFloor && n.lane === 0);
    if (nextNode) {
      prevNode.linksTo.push(nextNode.id);
    }
  }

  return newNodes;
};

// ========== 地图进度重置 ==========
// 重置整局跑图进度（游戏初始化或重新开始时调用）
const resetRunProgress = () => {
  runMap.value = generateRunMap(Date.now());
  gamePhase.value = "map_select";
  showEventMap.value = true;
  pendingNodeId.value = null;
  pendingBattleNodeType.value = null;
  if (battleReports.value.length === 0) {
    addReport("请选择事件树中的节点开始旅程。");
  }
};

// 根据节点ID查找节点对象
const getNodeById = (id: string) =>
  runMap.value?.nodes.find((node) => node.id === id) || null;

// ========== 地图节点计算属性 ==========
// 当前楼层编号（起始节点时显示第1层，已访问节点后显示下一层）
const currentMapFloor = computed(() => {
  if (!runMap.value) return 1;
  if (runMap.value.currentNodeId === "start") return 1;
  const node = getNodeById(runMap.value.currentNodeId);
  return node ? Math.min(runMap.value.floors, node.floor + 1) : 1;
});

// 当前楼层的所有节点列表
const currentFloorNodes = computed(() => {
  if (!runMap.value) return [] as MapNode[];
  return runMap.value.nodes.filter((node) => node.floor === currentMapFloor.value);
});

// 当前可选的下一批节点ID列表（允许玩家点击选择）
const allowedNextNodeIds = computed(() => {
  if (!runMap.value) return [] as string[];
  if (runMap.value.currentNodeId === "start") {
    return currentFloorNodes.value.map((node) => node.id);
  }
  const node = getNodeById(runMap.value.currentNodeId);
  return node ? node.linksTo : [];
});

// 判断某节点是否可选中
const canSelectMapNode = (node: MapNode) =>
  gamePhase.value === "map_select" &&
  allowedNextNodeIds.value.includes(node.id);

// ========== UI显示状态 ==========
// 是否显示战斗面板（有待处理战斗节点或战斗进行中时为true）
const showBattleBoard = computed(
  () => !!pendingBattleNodeType.value || isBattleActive.value || isBattleStarting.value,
);
// 战斗中显示/收起地图抽屉
const showBattleMapDrawer = ref(false);
// 地图图例是否折叠
const isMapLegendCollapsed = ref(false);

// 切换地图图例折叠状态
const toggleMapLegend = () => {
  isMapLegendCollapsed.value = !isMapLegendCollapsed.value;
};

// 监听战斗面板显隐：当进入战斗时收起地图抽屉
watch(showBattleBoard, (active, prevActive) => {
  if (active && !prevActive) {
    showBattleMapDrawer.value = false;
  }
  if (!active) {
    showBattleMapDrawer.value = false;
  }
});

// 监听战斗状态：进入战斗时锁定征召兵快照，退出时解除
watch(isBattleActive, (active) => {
  if (active) {
    lockBattleConscriptSnapshot();
    return;
  }
  unlockBattleConscriptSnapshot();
});

// ========== 叙事事件系统 ==========
// 获取 addGeneral 效果类型的值含义
const getAddGeneralEffectValue = (value: number): string => {
  const map: Record<number, string> = { 1: '随机瓦岗武将（秦琼/程咬金）', 2: '裴行俨', 3: '随机隋将' };
  return map[value] || `类型${value}`;
};

// 应用单个效果到游戏状态
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyEffect = (effect: Effect) => {
  // 统一处理 addGeneral 类型（扩展类型，非 EffectType 成员）
  if ((effect as any).type === 'addGeneral') {
    if (effect.value === 1) {
      const candidates = ['秦琼', '程咬金'].filter(n => !generals.value.some(g => g.name === n));
      if (candidates.length > 0) {
        const name = candidates[Math.floor(Math.random() * candidates.length)];
        const cfg = RECRUIT_CONFIG.find(c => c.name === name);
        if (cfg) pendingGeneralAdditions.value.push(cfg.name);
      }
    } else if (effect.value === 2) {
      if (!generals.value.some(g => g.name === '裴行俨')) {
        const cfg = RECRUIT_CONFIG.find(c => c.name === '裴行俨');
        if (cfg) pendingGeneralAdditions.value.push(cfg.name);
      }
    }
    return;
  }

  switch (effect.type) {
    case 'gold':
      money.value += effect.value;
      break;
    case 'conscript':
      totalConscripts.value = Math.min(
        maxConscripts,
        Math.max(0, totalConscripts.value + effect.value),
      );
      break;
    case 'attributePercent': {
      const pct = effect.value / 100;
      generals.value.forEach(g => {
        g.attack = Math.round(g.attack * (1 + pct));
        g.defense = Math.round(g.defense * (1 + pct));
        g.strategy = Math.round(g.strategy * (1 + pct));
        g.speed = Math.round(g.speed * (1 + pct));
      });
      break;
    }
    case 'attack': {
      const pct = effect.value / 100;
      if (effect.target === 'specific' && effect.targetName) {
        const g = generals.value.find(x => x.name === effect.targetName);
        if (g) g.attack = Math.round(g.attack * (1 + pct));
      } else {
        generals.value.forEach(g => { g.attack = Math.round(g.attack * (1 + pct)); });
      }
      break;
    }
    case 'defense': {
      const pct = effect.value / 100;
      if (effect.duration && effect.duration > 0) {
        // 持续debuff：设置 skillEffects，由战斗系统处理
        const reduction = Math.abs(pct);
        generals.value.forEach(g => {
          if (!g.skillEffects) g.skillEffects = {};
          g.skillEffects.defenseReduction = reduction;
          g.skillEffects.defenseReductionDuration = effect.duration!;
          g.skillEffects.defenseReductionSource = '事件效果';
        });
        addReport(`全体武将防御降低${(reduction * 100).toFixed(0)}%（持续${effect.duration}回合）`);
      } else if (effect.target === 'specific' && effect.targetName) {
        const g = generals.value.find(x => x.name === effect.targetName);
        if (g) g.defense = Math.round(g.defense * (1 + pct));
      } else {
        generals.value.forEach(g => { g.defense = Math.round(g.defense * (1 + pct)); });
      }
      break;
    }
    case 'speed': {
      const pct = effect.value / 100;
      if (effect.duration && effect.duration > 0) {
        // 持续debuff：设置 skillEffects.speedReduction，由 getAdjustedSpeed 处理
        const reduction = Math.abs(pct);
        generals.value.forEach(g => {
          if (!g.skillEffects) g.skillEffects = {};
          g.skillEffects.speedReduction = reduction;
          g.skillEffects.speedReductionDuration = effect.duration!;
        });
        addReport(`全体武将速度降低${(reduction * 100).toFixed(0)}%（持续${effect.duration}回合）`);
      } else if (effect.target === 'specific' && effect.targetName) {
        const g = generals.value.find(x => x.name === effect.targetName);
        if (g) g.speed = Math.round(g.speed * (1 + pct));
      } else {
        generals.value.forEach(g => { g.speed = Math.round(g.speed * (1 + pct)); });
      }
      break;
    }
    case 'strategy': {
      const pct = effect.value / 100;
      if (effect.target === 'specific' && effect.targetName) {
        const g = generals.value.find(x => x.name === effect.targetName);
        if (g) g.strategy = Math.round(g.strategy * (1 + pct));
      } else {
        generals.value.forEach(g => { g.strategy = Math.round(g.strategy * (1 + pct)); });
      }
      break;
    }
    case 'moral':
      addReport(`士气 ${effect.value >= 0 ? '+' : ''}${effect.value}`);
      break;
    case 'specialBuff':
    case 'specialDebuff':
      break;
  }
};

// 格式化效果为战斗报告文字
const formatEffectReport = (effect: Effect): string => {
  const sign = effect.value >= 0 ? '+' : '';
  const pct = ['attack', 'defense', 'speed', 'strategy', 'attributePercent', 'moral'].includes(effect.type) ? '%' : '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((effect as any).type === 'addGeneral') {
    return `获得武将：${getAddGeneralEffectValue(effect.value)}`;
  }
  if (effect.type === 'gold') return `金币${sign}${effect.value}`;
  if (effect.type === 'conscript') return `征召兵${sign}${effect.value}`;
  const labels: Record<string, string> = {
    attack: '攻击', defense: '防御', speed: '速度', strategy: '谋略',
    attributePercent: '全属性', moral: '士气', specialBuff: '特殊增益', specialDebuff: '特殊减益',
  };
  return `${labels[effect.type] || effect.type}${sign}${effect.value}${pct}`;
};

// 计算单个事件的权重
const calculateEventWeight = (event: MapEvent): number => {
  if (disabledEvents.value.has(event.id)) return 0;

  // 通用事件：基础权重 0.5，按上下文加成
  if (event.requiredGenerals.length === 0) {
    let weight = 0.5;
    if (generals.value.length > 3) weight += 0.3;
    if (money.value < 500) weight += 0.5; // 粮草不济时通用事件权重提升
    return weight;
  }

  // 专属事件：必须有对应武将
  const ownedNames = generals.value.map(g => g.name);
  const hasRequired = event.requiredGenerals.some(name => ownedNames.includes(name));
  if (!hasRequired) return 0;
  let weight = 1.0;
  event.requiredGenerals.forEach(name => {
    if (ownedNames.includes(name)) {
      weight += event.weightBonus[name] ?? 0.5;
    }
  });
  eventFlags.value.forEach(flag => {
    if (event.id.includes(flag)) weight += 0.5;
  });
  return weight;
};

// 从事件池抽取一个事件
const drawRandomEvent = (): MapEvent | null => {
  const candidates = EVENTS_DATA.map(event => ({
    event,
    weight: calculateEventWeight(event),
  })).filter(c => c.weight > 0);
  if (candidates.length === 0) {
    // 兜底：强制抽取通用事件
    const universalEvents = EVENTS_DATA.filter(e => e.requiredGenerals.length === 0);
    if (universalEvents.length === 0) return null;
    return universalEvents[Math.floor(Math.random() * universalEvents.length)];
  }
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.event;
  }
  return candidates[candidates.length - 1].event;
};

// 应用完整选项
const applyEventChoice = (choice: EventChoice) => {
  addReport(`你选择了「${choice.label}」：${choice.description}`);
  choice.effects.forEach(effect => {
    applyEffect(effect);
    addReport(formatEffectReport(effect));
  });
  choice.disablesEvents?.forEach(id => disabledEvents.value.add(id));
  choice.enablesEvents?.forEach(id => disabledEvents.value.delete(id));
  choice.flags?.forEach(flag => eventFlags.value.add(flag));
};

// 处理事件选项选择
const selectEventChoice = (choice: 'A' | 'B') => {
  const event = currentEvent.value;
  if (!event) return;
  showEventPanel.value = false;
  const selectedChoice = choice === 'A' ? event.choiceA : event.choiceB;
  applyEventChoice(selectedChoice);
  currentEvent.value = null;
  gamePhase.value = 'map_select';
  showEventMap.value = true;
};

// ========== 地图图例 ==========
// 地图图例项列表（用于显示各节点类型的图标和名称）
const mapLegendItems = computed(() => [
  { type: "event" as NodeType, label: "事件", icon: mapNodeIconByType.event },
  { type: "battle" as NodeType, label: "战斗", icon: mapNodeIconByType.battle },
  { type: "treasure" as NodeType, label: "宝箱", icon: mapNodeIconByType.treasure },
  { type: "shop" as NodeType, label: "商店", icon: mapNodeIconByType.shop },
  { type: "rest" as NodeType, label: "休息", icon: mapNodeIconByType.rest },
  { type: "elite" as NodeType, label: "精英", icon: mapNodeIconByType.elite },
  { type: "boss" as NodeType, label: "Boss", icon: mapNodeIconByType.boss },
]);

// ========== 节点解析 ==========
// 处理战斗类型节点：生成敌方队伍，精英/Boss属性强化
const resolveBattleNode = async (type: NodeType) => {
  pendingBattleNodeType.value = type;
  showEventMap.value = true;
  gamePhase.value = "encounter_resolve";
  if (type === "elite") {
    addReport("遭遇精英战！敌军士气高涨。");
  } else if (type === "boss") {
    addReport("Boss 战开启！敌军主帅亲临。");
  } else {
    addReport("遭遇普通战斗。");
  }
  await generateEnemyTeam();
  // 精英×1.18倍、Boss×1.35倍属性强化
  if (type === "elite" || type === "boss") {
    const ratio = type === "elite" ? 1.18 : 1.35;
    (Object.keys(enemyFormation.value) as (keyof typeof enemyFormation.value)[]).forEach(
      (position) => {
        const general = enemyFormation.value[position];
        if (!general) return;
        general.attack = Math.floor(general.attack * ratio);
        general.defense = Math.floor(general.defense * ratio);
        general.strategy = Math.floor(general.strategy * ratio);
        general.maxTroops = Math.floor(general.maxTroops * ratio);
        general.troops = Math.min(general.maxTroops, Math.floor(general.troops * ratio));
      },
    );
    addReport(type === "elite" ? "精英敌军获得属性强化！" : "Boss 敌军获得高额强化！");
  }
};

// 处理随机事件节点：从事件池随机抽取一个并应用
const resolveEventNode = () => {
  const event = drawRandomEvent();
  if (!event) {
    addReport("当前无适合触发的事件。");
    gamePhase.value = "map_select";
    showEventMap.value = true;
    return;
  }
  currentEvent.value = event;
  showEventPanel.value = true;
};

// 处理宝物节点：随机获取一个遗物，或折算为金币
const resolveTreasureNode = () => {
  if (RELIC_POOL.length > 0) {
    const relic = pickWeightedRelics(1)[0];
    if (!relic) {
      money.value += 150;
      addReport("宝物节点：获得金币 +150。");
      gamePhase.value = "map_select";
      showEventMap.value = true;
      return;
    }
    const isNew = !playerRelics.value.some((item) => item.id === relic.id);
    if (isNew) {
      playerRelics.value.push(relic);
    }
    addReport(`宝物节点：获得遗物【${relic.name}】。`);
    if (isNew && (relic.rarity === "rare" || relic.rarity === "epic" || relic.rarity === "legendary")) {
      acquiringRelic.value = relic;
      showRelicAcquisitionModal.value = true;
    }
  } else {
    money.value += 150;
    addReport("宝物节点：获得金币 +150。");
  }
  gamePhase.value = "map_select";
  showEventMap.value = true;
};

// 处理休整节点：恢复征召兵，并随机减少一名武将的休整轮次
const resolveRestNode = () => {
  const before = totalConscripts.value;
  totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 600);
  const recovered = totalConscripts.value - before;
  const ids = Object.keys(playerRecoveryRounds.value)
    .map((id) => Number(id))
    .filter((id) => (playerRecoveryRounds.value[id] || 0) > 0);
  if (ids.length > 0) {
    const targetId = ids[Math.floor(Math.random() * ids.length)];
    playerRecoveryRounds.value[targetId] = Math.max(0, playerRecoveryRounds.value[targetId] - 1);
    if (playerRecoveryRounds.value[targetId] === 0) {
      delete playerRecoveryRounds.value[targetId];
    }
    addReport(`营地休整：征召兵 +${recovered}，并减少 1 名武将休整轮次。`);
  } else {
    addReport(`营地休整：征召兵 +${recovered}。`);
  }
  gamePhase.value = "map_select";
  showEventMap.value = true;
};

// 处理商店节点：花费金币购买征召兵
const resolveShopNode = () => {
  if (money.value >= 180) {
    money.value -= 180;
    totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 500);
    addReport("商店交易：花费 180 金币，恢复征召兵 +500。");
  } else {
    addReport("商店节点：金币不足，仅获得征召兵 +220。");
    totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 220);
  }
  gamePhase.value = "map_select";
  showEventMap.value = true;
};

// ========== 统一节点解析入口 ==========
// 根据节点类型分发到对应解析函数
const resolveNode = async (node: MapNode) => {
  if (!runMap.value) return;
  runMap.value.currentNodeId = node.id;
  currentWave.value = node.floor;
  node.visited = true;
  pendingNodeId.value = node.id;
  if (node.type === "battle" || node.type === "elite" || node.type === "boss") {
    await resolveBattleNode(node.type);
    return;
  }
  gamePhase.value = "encounter_resolve";
  if (node.type === "event") resolveEventNode();
  else if (node.type === "treasure") resolveTreasureNode();
  else if (node.type === "rest") resolveRestNode();
  else if (node.type === "shop") resolveShopNode();
};

// ========== 节点选择 ==========
// 玩家点击地图节点时触发（需满足可选择条件）
const selectEventNode = async (node: MapNode) => {
  console.log('selectEventNode called:', node.type, 'gamePhase:', gamePhase.value);
  if (!canSelectMapNode(node)) {
    console.log('canSelectMapNode returned false, gamePhase:', gamePhase.value);
    return;
  }
  await resolveNode(node);
};




const deployedGeneralIds = computed(() =>
  Object.values(playerFormation.value)
    .filter((g): g is General => !!g)
    .map((g) => g.id),
);

const activeSlotGeneralId = computed(() => {
  if (!selectedSlot.value) return null;
  const [, position] = selectedSlot.value.split("-");
  return playerFormation.value[position as keyof typeof playerFormation.value]?.id ?? null;
});

const updateCurrentCommand = () => {
  let total = 0;
  Object.values(playerFormation.value).forEach((g) => {
    if (g) total += g.leadership;
  });
  currentCommand.value = total;
};

watch(gameLoaded, (loaded) => {
  if (loaded && playerRelics.value.length === 0) {
    startRelicSelection();
  }
});

onMounted(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    isLoggedIn.value = true;
  }
  // 先获取人物数据，再生成敌方队伍
  fetchCharacters().then(() => {
    resetRunProgress();
  });
});

const openAuthModal = () => {
  isLogin.value = true;
  showAuthModal.value = true;
};

const handleLogin = (loginData: any) => {
  isLoggedIn.value = true;
  localStorage.setItem("user", JSON.stringify(loginData));
  showAuthModal.value = false;
  addReport("欢迎来到夏朝！开始你的征程吧！");
  startGameLoading();
};

const selectSlot = (side: "player" | "enemy", position: string) => {
  if (side === "player" && !isBattleActive.value) {
    selectedSlot.value = `${side}-${position}`;
    showGeneralList.value = true;
  }
};

const tooltipData = ref<General | null>(null);
const tooltipTeamGenerals = ref<General[]>([]);

let tooltipTimer: number | null = null;

const showTooltip = (slotKey: string, event?: MouseEvent) => {
  // 阻止默认的右键菜单
  if (event) {
    event.preventDefault();
  }

  // 清除之前的定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }

  // 立即显示tooltip
  const [side, position] = slotKey.split("-");
  const formation =
    side === "player" ? playerFormation.value : enemyFormation.value;
  const general = formation[position as keyof typeof formation];
  if (general) {
    tooltipData.value = general;
    tooltipTeamGenerals.value = Object.values(formation).filter(Boolean) as General[];
  }
};

const hideTooltip = () => {
  // 清除定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
  tooltipData.value = null;
  tooltipTeamGenerals.value = [];
};

// ========== UI 状态 ==========
// 显示武将详情悬浮提示
const showGeneralTooltip = (general: General, event?: MouseEvent) => {
  // 阻止默认的右键菜单
  if (event) {
    event.preventDefault();
  }

  // 清除之前的定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }

  // 立即显示tooltip
  tooltipData.value = general;
  tooltipTeamGenerals.value = Object.values(playerFormation.value).filter(Boolean) as General[];
};

// 关闭武将列表浮层
const closeGeneralList = () => {
  showGeneralList.value = false;
  selectedSlot.value = null;
  hideTooltip();
};

// 部署武将到指定阵位（阵位满员则替换，统率不足时阻止部署）
const deployGeneral = (general: General) => {
  if (selectedSlot.value) {
    const restRounds = playerRecoveryRounds.value[general.id] || 0;
    if (restRounds > 0) {
      addReport(`【${general.name}】正在休整，还需 ${restRounds} 轮战斗后可再次上阵。`);
      return;
    }
    const [, position] = selectedSlot.value.split("-");
    const targetPosition = position as keyof typeof playerFormation.value;
    const oldGeneral = playerFormation.value[position as keyof typeof playerFormation.value];
    const oldTroopsInSlot = oldGeneral ? Math.max(0, oldGeneral.troops || 0) : 0;
    const oldCommand = oldGeneral ? oldGeneral.leadership : 0;
    const newTotalCommand = currentCommand.value - oldCommand + general.leadership;

    if (newTotalCommand > maxCommand.value) {
      addReport(
        `统率不足！当前统率: ${currentCommand.value}/${maxCommand.value}，需要: ${newTotalCommand}`,
      );
      return;
    }

    const existingPosition = (Object.keys(playerFormation.value) as (keyof typeof playerFormation.value)[])
      .find((key) => playerFormation.value[key]?.id === general.id);
    if (existingPosition && existingPosition !== targetPosition) {
      playerFormation.value[existingPosition] = null;
    }

    if (oldGeneral && oldGeneral.id !== general.id) {
      oldGeneral.troops = 0;
      oldGeneral.isDead = false;
      oldGeneral.skillEffects = {};
    }

    playerFormation.value[targetPosition] = general;
    if (!oldGeneral || oldGeneral.id !== general.id) {
      const desiredTroops = Math.max(0, Math.min(general.troops || 0, general.maxTroops));
      const budgetByPool = oldTroopsInSlot + availableConscripts.value;
      general.troops = Math.min(desiredTroops, budgetByPool);
      if (!isBattleActive.value && !isBattleStarting.value) {
        const nextCommitted =
          committedConscripts.value - oldTroopsInSlot + Math.max(0, general.troops || 0);
        committedConscripts.value = Math.max(0, Math.min(totalConscripts.value, nextCommitted));
      }
    }
    updateCurrentCommand();
    addReport(
      `【${general.name}】已上阵至【${targetPosition}】！统率: ${currentCommand.value}/${maxCommand.value}`,
    );
    closeGeneralList();
  }
};

// 为上阵武将设置兵力分配（通过征召兵分配界面）
const setGeneralTroops = (
  position: keyof typeof playerFormation.value,
  targetTroops: number,
) => {
  if (isBattleActive.value) return;
  const general = playerFormation.value[position];
  if (!general) return;
  const maxAllowedByPool = Math.min(
    general.maxTroops,
    general.troops + availableConscripts.value,
  );
  const next = Math.max(0, Math.min(Math.floor(targetTroops), maxAllowedByPool));
  general.troops = next;
  syncCommittedConscriptsFromFormation();
};

// 鼠标按下兵力条时记录初始值和已分配量，用于拖拽调整
const handleTroopsBarMouseDown = (
  position: keyof typeof playerFormation.value,
  event: MouseEvent,
) => {
  if (isBattleActive.value) return;
  const bar = event.currentTarget as HTMLElement | null;
  if (!bar) return;

  const applyFromClientX = (clientX: number) => {
    const general = playerFormation.value[position];
    if (!general) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const requested = Math.floor(general.maxTroops * ratio);
    setGeneralTroops(position, requested);
  };

  applyFromClientX(event.clientX);
  const onMove = (e: MouseEvent) => applyFromClientX(e.clientX);
  const onUp = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
};

// 将剩余可分配征召兵平均分配给所有上阵武将（优先补满兵力的）
const autoAllocateTroopsEvenly = () => {
  if (isBattleActive.value) return;
  const deployed = Object.values(playerFormation.value).filter(
    (g): g is General => !!g,
  );
  if (deployed.length === 0) {
    addReport("请先上阵武将，再进行自动分配。");
    return;
  }
  let remaining = Math.max(0, availableConscripts.value);
  if (remaining <= 0) {
    addReport("当前没有可分配征召兵。");
    return;
  }
  const totalNeedToFull = deployed.reduce(
    (sum, g) => sum + Math.max(0, g.maxTroops - (g.troops || 0)),
    0,
  );
  if (remaining >= totalNeedToFull) {
    deployed.forEach((general) => {
      general.troops = general.maxTroops;
    });
    committedConscripts.value += totalNeedToFull;
    addReport("征召兵充足，已将我方上阵武将全部补至满兵。");
    return;
  }
  const canReceive = deployed.filter((g) => g.troops < g.maxTroops);
  while (remaining > 0 && canReceive.length > 0) {
    let progressed = false;
    for (const general of canReceive) {
      if (remaining <= 0) break;
      if (general.troops >= general.maxTroops) continue;
      general.troops += 1;
      remaining -= 1;
      progressed = true;
    }
    if (!progressed) break;
  }
  committedConscripts.value += Math.max(0, availableConscripts.value - remaining);
  addReport("已自动均分征召兵到我方上阵武将。");
};

// 战斗结束后：阵亡武将进入4轮休整，从阵型中移除并播报
const applyPlayerRecoveryForDeaths = () => {
  (Object.keys(playerFormation.value) as (keyof typeof playerFormation.value)[]).forEach(
    (position) => {
      const general = playerFormation.value[position];
      if (!general || !general.isDead) return;
      playerRecoveryRounds.value[general.id] = Math.max(
        playerRecoveryRounds.value[general.id] || 0,
        4,
      );
      playerFormation.value[position] = null;
      addReport(`【${general.name}】阵亡，进入 3 轮休整。`);
    },
  );
  updateCurrentCommand();
};

// 判断我方所有武将是否都在休整中（全部休整时游戏结束）
const areAllOwnedGeneralsResting = () => {
  if (generals.value.length === 0) return false;
  return generals.value.every((general) => (playerRecoveryRounds.value[general.id] || 0) > 0);
};

// 招募配置数组：id为武将在数据库中的ID，probability为招募概率（所有概率之和应等于1）
// 自动生成：在 skills/index.ts 的 RECRUIT_CONFIG 中添加新武将即可
const probability = 1 / RECRUIT_CONFIG.length;
const RECRUIT_CONFIG_BASE = RECRUIT_CONFIG.map(item => ({
  id: item.id,
  probability: Math.round(probability * 1000) / 1000,
}));

// 获取武将的fetch函数映射（使用 skills/index.ts 中定义的配置）
const getFetchFunction = (id: number) => {
  return getFetchFunctionBase(id, API_BASE_URL);
};

const designedGeneralIds = () => RECRUIT_CONFIG_BASE.map((c) => c.id);

// 深拷贝敌方武将（保留技能和台词的独立副本）
const cloneGeneralForEnemy = (g: General): General => ({
  ...g,
  skills: g.skills?.map((s) => ({ ...s })),
  skillEffects: g.skillEffects ? { ...g.skillEffects } : undefined,
  quotes: g.quotes
    ? { skill: [...g.quotes.skill], death: [...g.quotes.death] }
    : undefined,
});

// Fisher-Yates 洗牌：返回所有预设武将ID的随机排列顺序
const shuffleDesignedGeneralIds = (): number[] => {
  const ids = [...designedGeneralIds()];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
};

// 生成敌方队伍：从预设武将池中洗牌抽取3名布置到大营/中军/前锋，并配置敌方遗物
const generateEnemyTeam = async () => {
  const positions: (keyof typeof enemyFormation.value)[] = [
    "大营",
    "中军",
    "前锋",
  ];
  const idPool = shuffleDesignedGeneralIds();
  let poolIndex = 0;

  for (const position of positions) {
    let placed: General | null = null;
    while (poolIndex < idPool.length && !placed) {
      const id = idPool[poolIndex++];
      const fetchFn = getFetchFunction(id);
      let general: General | null = null;
      if (fetchFn) {
        try {
          general = await fetchFn();
        } catch {
          general = null;
        }
      }
      if (general) {
        const copy = cloneGeneralForEnemy(general);
        copy.isDead = false;
        setSynthStar(copy, 0);
        placed = copy;
      }
    }

    if (placed) {
      enemyFormation.value[position] = placed;
      addReport(`敌方${position}：【${placed.name}】`);
    } else {
      addReport(`敌方${position}：未能从已设计武将中生成，请检查网络或配置。`);
      enemyFormation.value[position] = null;
    }
  }

  const enemyRelic = getEnemyWaveRelic(currentWave.value);
  enemyRelics.value = enemyRelic ? [enemyRelic] : [];
  if (enemyRelic) {
    addReport(`本波敌军携带遗物【${enemyRelic.name}】。`);
  } else {
    addReport("本波敌军未配置遗物。");
  }
  addReport("敌方队伍已集结完毕！");
};

// ========== 武将升级与合成 ==========
// 格式化武将信息并输出到战斗报告（获取武将时调用）
const formatGeneralReport = (general: General) => {
  addReport(`恭喜获得【${general.name}】！等级:${general.level} 攻:${general.attack} 防:${general.defense} 策:${general.strategy} 速:${general.speed} 兵:${general.troops} 距:${general.attackRange} 统御:${general.command} 统率:${general.leadership} 兵种:${general.soldierType}`);
  if (general.skills && general.skills.length > 0) {
    addReport(`【${general.name}】自带战法：${general.skills[0].description}`);
  }
};

// 获取武将的合成星级（0~5，超出范围截断）
const getSynthStar = (general: General | null | undefined) => {
  if (!general) return 0;
  const star = (general as General & { synthStar?: number }).synthStar;
  return typeof star === "number" ? Math.max(0, Math.min(5, star)) : 0;
};

// 设置武将的合成星级（0~5，超出范围截断）
const setSynthStar = (general: General, value: number) => {
  (general as General & { synthStar?: number }).synthStar = Math.max(
    0,
    Math.min(5, value),
  );
};

// 重复招募已拥有武将时执行升星逻辑：属性成长、满兵、清除负面状态
const promoteExistingGeneral = (general: General) => {
  const beforeStar = getSynthStar(general);
  const nextStar = Math.min(5, beforeStar + 1);
  if (nextStar > beforeStar) {
    general.attack = Math.round(general.attack + (general.attackGrowth || 0));
    general.defense = Math.round(general.defense + (general.defenseGrowth || 0));
    general.strategy = Math.round(general.strategy + (general.strategyGrowth || 0));
    general.speed = Math.round(general.speed + (general.speedGrowth || 0));
    general.siege = Math.round(general.siege + (general.siegeGrowth || 0));
    general.command = Math.round(general.command + (general.commandGrowth || 0));
    general.maxTroops += 100;
  }
  setSynthStar(general, nextStar);
  general.troops = general.maxTroops;
  general.isDead = false;
  general.skillEffects = {};

  if (nextStar > beforeStar) {
    addReport(`重复招募【${general.name}】，已合成升阶至 ${nextStar} 星并恢复满兵力！`);
  } else {
    addReport(`重复招募【${general.name}】，已达满星，转换为满兵力整备。`);
  }
};

// 崔珏奖励武将升星：与普通升星相同，但播报文案不同
const promoteGeneralByReward = (general: General) => {
  const beforeStar = getSynthStar(general);
  const nextStar = Math.min(5, beforeStar + 1);
  if (nextStar > beforeStar) {
    general.attack = Math.round(general.attack + (general.attackGrowth || 0));
    general.defense = Math.round(general.defense + (general.defenseGrowth || 0));
    general.strategy = Math.round(general.strategy + (general.strategyGrowth || 0));
    general.speed = Math.round(general.speed + (general.speedGrowth || 0));
    general.siege = Math.round(general.siege + (general.siegeGrowth || 0));
    general.command = Math.round(general.command + (general.commandGrowth || 0));
    general.maxTroops += 100;
    setSynthStar(general, nextStar);
    general.troops = general.maxTroops;
    general.isDead = false;
    general.skillEffects = {};
    addReport(`崔珏嘉奖：【${general.name}】合成升阶至 ${nextStar} 星！`);
  } else {
    addReport(`崔珏嘉奖：【${general.name}】已满星，改为整备兵力。`);
    general.troops = general.maxTroops;
    general.skillEffects = {};
  }
};

// 构建战斗胜利奖励选项：军资、征召兵、升星三选一
const buildVictoryRewardOptions = (): VictoryRewardOption[] => {
  const goldValue = [120, 150, 180][Math.floor(Math.random() * 3)];
  const conscriptValue = [600, 800, 1000][Math.floor(Math.random() * 3)];
  const options: VictoryRewardOption[] = [
    {
      id: `gold-${Date.now()}`,
      type: "gold",
      icon: "💰",
      name: "军资补给",
      description: `获得金币 +${goldValue}`,
      value: goldValue,
    },
    {
      id: `conscript-${Date.now()}`,
      type: "conscript",
      icon: "🪖",
      name: "征召补员",
      description: `恢复固定征召兵 +${conscriptValue}`,
      value: conscriptValue,
    },
    {
      id: `promote-${Date.now()}`,
      type: "promote",
      icon: "⭐",
      name: "生死簿赐阶",
      description: "随机我方武将合成星 +1",
      value: 1,
    },
  ];
  return options;
};

// 构建层Boss奖励选项：军资、征召兵、全员疗伤三选一
const buildLayerRewardOptions = (): VictoryRewardOption[] => {
  const goldValue = 300 + currentAct.value * 150;
  const conscriptValue = 500 + currentAct.value * 200;
  const options: VictoryRewardOption[] = [
    {
      id: `layer-gold-${Date.now()}`,
      type: "gold",
      icon: "💰",
      name: "军资嘉奖",
      description: `获得金币 +${goldValue}`,
      value: goldValue,
    },
    {
      id: `layer-conscript-${Date.now()}`,
      type: "conscript",
      icon: "🪖",
      name: "征召犒赏",
      description: `恢复征召兵 +${conscriptValue}`,
      value: conscriptValue,
    },
    {
      id: `layer-heal-${Date.now()}`,
      type: "layerHeal",
      icon: "❤️",
      name: "全员疗伤",
      description: "所有上阵武将恢复至满兵力",
      value: 0,
    },
  ];
  return options;
};

// 应用战斗胜利奖励（金币/征召兵/升星）
const applyVictoryReward = (reward: VictoryRewardOption) => {
  if (reward.type === "gold") {
    money.value += reward.value;
    addReport(`崔珏赏赐军资：金币 +${reward.value}。`);
    return;
  }
  if (reward.type === "conscript") {
    const beforeAvailable = availableConscripts.value;
    const before = totalConscripts.value;
    totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + reward.value);
    const actualRecovered = totalConscripts.value - before;
    if (actualRecovered > 0) {
      const afterAvailable = availableConscripts.value;
      addReport(
        `崔珏补发兵员：征召兵 +${actualRecovered}（上限 ${maxConscripts}），可分配由 ${beforeAvailable} 提升至 ${afterAvailable}。`,
      );
      return;
    }
    const getPlayerBattleStartTroops = (general: General) => {
      const positions = Object.keys(playerFormation.value) as FormationPosition[];
      for (const position of positions) {
        if (playerFormation.value[position]?.id !== general.id) continue;
        const snapshot = battleStartSnapshot.value.player[position];
        if (!snapshot) return general.troops;
        return Math.max(0, Math.min(snapshot.troops, general.maxTroops));
      }
      return general.troops;
    };
    const healTargets = (Object.keys(playerFormation.value) as FormationPosition[])
      .map((position) => playerFormation.value[position])
      .filter((general): general is General => !!general && !general.isDead && general.troops < general.maxTroops)
      .map((general) => {
        const currentTroops = Math.max(0, general.troops);
        // 回血上限：不超过本场开战时的当前兵力值
        const battleStartTroopsCap = getPlayerBattleStartTroops(general);
        const healCap = Math.max(0, battleStartTroopsCap - currentTroops);
        return {
          general,
          healCap,
          healed: 0,
        };
      })
      .filter((item) => item.healCap > 0);
    let healRemaining = reward.value;
    let healedTotal = 0;
    while (healRemaining > 0 && healTargets.length > 0) {
      let progressed = false;
      for (const item of healTargets) {
        if (healRemaining <= 0) break;
        if (item.healed >= item.healCap) continue;
        item.general.troops += 1;
        item.healed += 1;
        healRemaining -= 1;
        healedTotal += 1;
        progressed = true;
      }
      if (!progressed) break;
    }
    if (healedTotal > 0) {
      addReport(`征召兵已达上限，崔珏改为直接回血：我方上阵武将兵力恢复 ${healedTotal}。`);
      return;
    }
    const reclaimed = Math.min(reward.value, committedConscripts.value);
    if (reclaimed > 0) {
      committedConscripts.value = Math.max(0, committedConscripts.value - reclaimed);
      const afterAvailable = availableConscripts.value;
      addReport(
        `征召兵已达上限且无可恢复目标，崔珏改为回补可分配额度 +${reclaimed}，当前可分配 ${afterAvailable}。`,
      );
      return;
    }
    addReport(`崔珏补发兵员：征召兵 +0（上限 ${maxConscripts}），且当前无可回补额度。`);
    return;
  }
  if (reward.type === "promote") {
    if (generals.value.length === 0) {
      addReport("当前无可提升武将，奖励转为金币 +120。");
      money.value += 120;
      return;
    }
    const target = generals.value[Math.floor(Math.random() * generals.value.length)];
    promoteGeneralByReward(target);
  }
  if (reward.type === "layerHeal") {
    let healed = 0;
    (Object.keys(playerFormation.value) as FormationPosition[]).forEach((position) => {
      const general = playerFormation.value[position];
      if (!general || general.isDead) return;
      if (general.troops < general.maxTroops) {
        healed++;
        general.troops = general.maxTroops;
      }
    });
    addReport(`崔珏施法：${healed} 名武将恢复至满兵力！`);
  }
};

// 应用层Boss奖励（目前与战斗奖励相同）
const applyLayerReward = (reward: VictoryRewardOption) => {
  applyVictoryReward(reward);
};

// ========== 奖励选择 ==========
// 打开层Boss奖励选择界面（崔珏裁赏）
const openLayerRewardSelector = () => {
  layerRewardOptions.value = buildLayerRewardOptions();
  layerRewardDialogLine.value = getRandomLine(cuiJueQuotes.victory);
  showLayerRewardSelector.value = true;
  gamePhase.value = "reward_resolve";
  addReport(`【崔珏】${layerRewardDialogLine.value}`);
  addReport(`第 ${currentAct.value} 层已完成！崔珏现身裁赏。`);
};

// 玩家选择层奖励后：应用奖励、生成下一层、切换到地图选择阶段
const selectLayerReward = async (reward: VictoryRewardOption) => {
  if (isResolvingVictoryReward.value) return;
  isResolvingVictoryReward.value = true;
  try {
    showLayerRewardSelector.value = false;
    applyLayerReward(reward);

    // 重新生成下一层
    if (!runMap.value) {
      resetRunProgress();
      return;
    }
    const existingNodes = runMap.value.nodes;
    const newNodes = generateNextLayerNodes(existingNodes);
    runMap.value.nodes.push(...newNodes);
    runMap.value.currentNodeId = "start";
    currentAct.value += 1;

    addReport(`第 ${currentAct.value - 1} 层崔珏裁赏完毕！第 ${currentAct.value} 层已开启。`);
    gamePhase.value = "map_select";
    showEventMap.value = true;
  } finally {
    isResolvingVictoryReward.value = false;
  }
};

// 奖励选择完成后返回地图继续前进
const enterNextBattleAfterReward = async () => {
  gamePhase.value = "map_advance";
  pendingBattleNodeType.value = null;
  pendingNodeId.value = null;
  showEventMap.value = true;
  addReport("崔珏裁赏已落定，返回事件树继续前进。");
};

// 打开战斗胜利奖励界面（崔珏现身裁赏）
const openVictorySettlement = () => {
  unlockBattleConscriptSnapshot();
  const currentNode = pendingNodeId.value ? getNodeById(pendingNodeId.value) : null;
  if (currentNode?.type === "boss") {
    openLayerRewardSelector();
    return;
  }
  showVictoryRewardSelector.value = true;
  gamePhase.value = "reward_resolve";
  victoryRewardOptions.value = buildVictoryRewardOptions();
  cuiJueRewardDialogLine.value = "此战有功，生死簿前，许你择其一赏。";
  addReport("崔珏现身，进入战后裁赏。");
};

// 玩家选择战斗胜利奖励：应用奖励、进入下一场战斗
const selectVictoryReward = async (reward: VictoryRewardOption) => {
  if (isResolvingVictoryReward.value) return;
  isResolvingVictoryReward.value = true;
  try {
    showVictoryRewardSelector.value = false;
    applyVictoryReward(reward);
    await enterNextBattleAfterReward();
    gamePhase.value = "map_select";
  } finally {
    isResolvingVictoryReward.value = false;
  }
};

// 从给定台词数组中随机抽取一条（崔珏对话）
const getRandomLine = (lines: string[]) =>
  lines[Math.floor(Math.random() * lines.length)];

const addCuiJueQuote = (
  scene: keyof typeof cuiJueQuotes,
  extraPrefix = "",
) => {
  const line = getRandomLine(cuiJueQuotes[scene]);
  addReport(`${extraPrefix}【崔珏】${line}`);
  return line;
};

// ========== 遗物系统 ==========
// 获取指定阵营持有的全部遗物列表
const getRelicsBySide = (side: "player" | "enemy"): Relic[] =>
  side === "player" ? playerRelics.value : enemyRelics.value;

// 统计指定阵营遗物效果数值之和（如：防御加成百分比、伤害加成百分比等）
const getRelicEffectValue = (
  side: "player" | "enemy",
  key: string,
): number => {
  const relics = getRelicsBySide(side);
  if (relics.length === 0) return 0;
  return relics.reduce((sum, relic) => {
    const val = key in (relic.effects ?? {}) ? (relic.effects as Record<string, unknown>)[key] : 0;
    return sum + (typeof val === "number" ? val : 0);
  }, 0);
};

// 判断某武将是否满足低兵力防御加成条件（兵力低于上限的指定比例时生效）
const hasLowTroopsDefenseBonus = (
  side: "player" | "enemy",
  general: General,
): boolean => {
  const relics = getRelicsBySide(side);
  if (relics.length === 0) return false;
  const threshold = Math.max(...relics.map((relic) => {
    const e = relic.effects;
    return Number((e && typeof e === 'object' && 'lowTroopsThreshold' in e) ? e.lowTroopsThreshold : 0);
  }));
  if (threshold <= 0) return false;
  return general.maxTroops > 0 && general.troops / general.maxTroops < threshold;
};

// 计算武将实际速度（基础速度 × 遗物百分比加成 × 速度降幅debuff，骑兵额外有加成）
const getAdjustedSpeed = (general: General, side: "player" | "enemy") => {
  let speed = general.speed;
  speed *= 1 + getRelicEffectValue(side, "speedPct");
  if (general.soldierType === "骑兵") {
    speed *= 1 + getRelicEffectValue(side, "cavalrySpeedPct");
  }
  if (general.skillEffects?.speedReduction) {
    speed *= 1 - general.skillEffects.speedReduction;
  }
  return speed;
};

// 回合开始时：若遗物提供debuff抵抗率，以指定概率清除该武将身上的持续debuff效果
const applyRelicDebuffResist = (unit: {
  general: General;
  side: "player" | "enemy";
}) => {
  const resistChance = getRelicEffectValue(unit.side, "debuffResistChance");
  if (resistChance <= 0 || !unit.general.skillEffects) return;
  if (Math.random() >= resistChance) return;

  const effects = unit.general.skillEffects;
  if (effects.damageOutputReductionDuration > 0) {
    effects.damageOutputReductionDuration = 0;
    effects.damageOutputReduction = 0;
    addReport(`【${unit.general.name}】受遗物庇佑，抵消了降攻效果！`);
    return;
  }
  if (effects.skillTriggerReductionDuration > 0) {
    effects.skillTriggerReductionDuration = 0;
    effects.skillTriggerReduction = 0;
    addReport(`【${unit.general.name}】受遗物庇佑，抵消了降率效果！`);
    return;
  }
  if (effects.defenseReductionDuration > 0) {
    effects.defenseReductionDuration = 0;
    effects.defenseReduction = 0;
    addReport(`【${unit.general.name}】受遗物庇佑，抵消了降防效果！`);
    return;
  }
  if (effects.speedReductionDuration > 0) {
    effects.speedReductionDuration = 0;
    effects.speedReduction = 0;
    addReport(`【${unit.general.name}】受遗物庇佑，抵消了减速效果！`);
    return;
  }
  if (effects.cannotNormalAttackDuration > 0) {
    effects.cannotNormalAttackDuration = 0;
    effects.cannotNormalAttack = false;
    addReport(`【${unit.general.name}】受遗物庇佑，摆脱了怯战效果！`);
  }
};

// 回合结束时：所有存活武将触发遗物回血效果；若有资源类遗物额外获得金币
const applyEndTurnRelicEffects = () => {
  const allAliveGenerals = getAllGenerals().filter((g) => !g.general.isDead);
  allAliveGenerals.forEach((generalData) => {
    const healPct = getRelicEffectValue(generalData.side, "turnEndHealPct");
    if (healPct > 0) {
      const healAmount = Math.max(
        1,
        Math.floor(generalData.general.maxTroops * healPct),
      );
      const oldTroops = generalData.general.troops;
      generalData.general.troops = Math.min(
        generalData.general.maxTroops,
        generalData.general.troops + healAmount,
      );
      const actualHeal = generalData.general.troops - oldTroops;
      if (actualHeal > 0) {
        addReport(`【${generalData.general.name}】受到遗物效果恢复${actualHeal}点兵力。`);
        battleStats.value.healing[generalData.side][generalData.position as FormationPosition] += actualHeal;
      }
    }
  });

  const playerResource = getRelicEffectValue("player", "resourcePerTurn");
  if (playerResource > 0) {
    const efficiency = 1 + getRelicEffectValue("player", "resourceEfficiencyPct");
    const gain = Math.max(1, Math.floor(playerResource * efficiency));
    money.value += gain;
    addReport(`我方遗物带来资源收益：+${gain} 金币。`);
  }
};

// 开启遗物选择流程：从遗物池抽取3个候选遗物让玩家选择
const startRelicSelection = () => {
  if (playerRelics.value.length > 0) return;
  if (!hasShownNewRunQuote.value) {
    addCuiJueQuote("newRun");
    hasShownNewRunQuote.value = true;
  }
  cuiJueRelicDialogLine.value = addCuiJueQuote("relic");
  const playerCandidates = pickWeightedRelics(3);
  playerRelicCandidates.value = playerCandidates;
  showRelicSelector.value = true;
};

// 玩家选择一个遗物后，将其加入我方遗物列表并关闭选择界面
const selectPlayerRelic = (relic: Relic) => {
  const isNew = !playerRelics.value.some((item) => item.id === relic.id);
  if (isNew) {
    playerRelics.value.push(relic);
  }
  showRelicSelector.value = false;
  addReport(`我方选择遗物【${relic.name}】。`);
  // 仅新获得的绿/紫/金色遗物展示酷炫动画
  if (isNew && (relic.rarity === "rare" || relic.rarity === "epic" || relic.rarity === "legendary")) {
    acquiringRelic.value = relic;
    showRelicAcquisitionModal.value = true;
  }
};

// ========== 招募武将 ==========
// 执行单抽：打开招募面板
const recruitCard = () => {
  recruitPanel.value?.open();
};

// ========== 招募面板事件处理 ==========
const handleRecruitPanelClose = () => {};

const handleRecruitDone = (results: { general: General; rarity: GeneralRarity }[]) => {
  if (results.length === 1) {
    addReport("============= 单抽招募 ===========");
  } else {
    addReport("============= 十连招募 ===========");
  }

  results.forEach(({ general, rarity }, i) => {
    if (results.length > 1) {
      addReport(`第${i + 1}抽：`);
    }

    const existed = generals.value.find((g) => g.id === general.id);
    if (existed) {
      const maxStar = MAX_STAR_BY_RARITY[general.rarity] ?? 5;
      const currentStar = getSynthStar(existed);
      if (currentStar >= maxStar) {
        money.value += RECRUIT_SINGLE_COST;
        addReport(`【${general.name}】已达最高星级，返还${RECRUIT_SINGLE_COST}金币！`);
      } else {
        promoteExistingGeneral(existed);
        addReport(`【${general.name}】升星成功，当前星级：★${getSynthStar(existed) + 1}！`);
      }
    } else {
      setSynthStar(general, 0);
      general.troops = 0;
      general.isDead = false;
      general.skillEffects = {};
      generals.value.push(general);
      formatGeneralReport(general);
      addReport(`获得【${general.name}】（${RARITY_CONFIG[rarity]?.name ?? rarity}）！`);
    }
  });

  if (results.length > 1) {
    addReport("=================================");
  }
};

// ========== 战斗控制 ==========
// 异步等待指定毫秒数（战斗动画延迟用）
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 战斗动画等待函数：跳过模式下直接返回，正常模式下按战斗速度和暂停状态逐帧等待
const waitBattle = async (baseMs: number) => {
  if (skipBattleAnimation.value) return;
  let progressed = 0;
  const tick = 80;
  while (progressed < baseMs && isBattleActive.value) {
    if (isBattlePaused.value) {
      await sleep(tick);
      continue;
    }
    await sleep(tick);
    progressed += tick * battleSpeed.value;
  }
};

// 设置战斗速度倍率（影响waitBattle中的时间流逝速度）
const setBattleSpeed = (speed: number) => {
  battleSpeed.value = speed;
  addReport(`战斗速度已切换为 ${speed}x`);
};

// 切换战斗跳过模式：跳过模式下动画等待函数直接返回
const toggleSkipBattle = () => {
  if (isBattleActive.value) {
    addReport("战斗进行中不可切换跳过状态。");
    return;
  }
  skipBattleAnimation.value = !skipBattleAnimation.value;
  addReport(skipBattleAnimation.value ? "已开启跳过战斗动画。" : "已关闭跳过战斗动画。");
};

// 切换战斗暂停状态（暂停时waitBattle会一直sleep直到恢复）
const toggleBattlePause = () => {
  if (!isBattleActive.value) return;
  isBattlePaused.value = !isBattlePaused.value;
  addReport(isBattlePaused.value ? "战斗已暂停" : "战斗继续");
};

// 战斗控制入口：根据当前状态执行不同操作（暂停切换/开始战斗/弹窗提示）
const handleBattleControl = async () => {
  if (showVictoryRewardSelector.value) {
    addReport("请先完成崔珏裁赏，再开启下一场战斗。");
    return;
  }
  if (!pendingBattleNodeType.value && !isBattleActive.value) {
    addReport("请先在事件树中选择一个战斗节点。");
    showEventMap.value = true;
    return;
  }
  if (isBattleStarting.value) return;
  if (isBattleActive.value) {
    toggleBattlePause();
    return;
  }
  isBattleStarting.value = true;
  try {
    await startBattle();
  } finally {
    isBattleStarting.value = false;
  }
};

// 结束本回合：委托handleBattleControl处理（主要触发暂停切换）
const endTurn = () => {
  handleBattleControl();
};

// 根据攻击者位置和攻击范围，计算所有可攻击的敌方存活目标
const getTargetsInRange = (attacker: {
  general: General;
  side: "player" | "enemy";
  position: string;
}) => {
  const targets: Array<{
    general: General;
    side: "player" | "enemy";
    position: string;
  }> = [];
  // 位置深度：前锋=1，中军=2，大营=3
  // 固定距离规则：
  // 我方前锋到敌方前锋：距离1
  // 我方前锋到敌方中军：距离2
  // 我方前锋到敌方大营：距离3
  // 我方中军到敌方前锋：距离2
  // 我方中军到敌方中军：距离3
  // 我方中军到敌方大营：距离4
  // 我方大营到敌方前锋：距离3
  // 我方大营到敌方中军：距离4
  // 我方大营到敌方大营：距离5
  const positionIndex: Record<string, number> = { 前锋: 1, 中军: 2, 大营: 3 };

  // 计算敌方存活位置的实际位置索引（跳过死亡位置）
  const getEnemyAlivePositions = (): Array<{
    position: string;
    actualPosition: number;
    general: General;
  }> => {
    const formation =
      attacker.side === "player" ? enemyFormation.value : playerFormation.value;
    const positions = ["前锋", "中军", "大营"] as const;
    const alivePositions: Array<{
      position: string;
      actualPosition: number;
      general: General;
    }> = [];
    let actualPosition = 1; // 实际位置从1开始

    for (const pos of positions) {
      const general = formation[pos];
      if (general && !general.isDead) {
        alivePositions.push({
          position: pos,
          actualPosition: actualPosition,
          general,
        });
        actualPosition++;
      }
    }
    return alivePositions;
  };

  const enemyAlivePositions = getEnemyAlivePositions();

  for (const enemyPos of enemyAlivePositions) {
    const enemy = enemyPos.general;

    // 计算距离：攻击方原始位置 + 敌方实际位置 - 1
    // 死亡位置被跳过，敌方实际位置重新计算
    const distance =
      positionIndex[attacker.position] + enemyPos.actualPosition - 1;

    // 攻击范围决定能打到的最大距离
    if (distance <= attacker.general.attackRange) {
      targets.push({
        general: enemy,
        side: attacker.side === "player" ? "enemy" : "player",
        position: enemyPos.position,
      });
    }
  }

  // 详细播报可攻击目标
  if (targets.length > 0) {
    const targetList = targets
      .map((target) => {
        const targetPrefix = target.side === "player" ? "我方" : "敌方";
        return `${targetPrefix}${target.position}【${target.general.name}】`;
      })
      .join("、");
    addReport(`可攻击目标：${targetList}（共${targets.length}个）`);
  }

  return targets;
};

// ========== 技能与治疗 ==========
// 播放治疗音效（用于技能回血时反馈）
const playHealSound = () => {
  const audio = new Audio("/assets/audios/heal.mp3");
  audio.play().catch((e) => console.error("播放治疗音效失败:", e));
};

// 为指定卡牌添加治疗脉冲动画效果（回血时触发）
const triggerHealCardFx = (side: "player" | "enemy", position: string) => {
  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove("target-heal-pulse");
  void card.offsetWidth;
  card.classList.add("target-heal-pulse");
  window.setTimeout(() => {
    card.classList.remove("target-heal-pulse");
  }, 680);
};

// 执行技能效果后检测是否有单位回血，如有则播放治疗动画和音效
const executeSkillEffectWithHealFx = <T>(effectRunner: () => T): T => {
  const allUnits = getAllGenerals()
    .filter((item) => !item.general.isDead)
    .map((item) => ({
      general: item.general,
      side: item.side,
      position: item.position,
      troops: item.general.troops,
    }));
  const result = effectRunner();
  let hasHeal = false;
  allUnits.forEach((unit) => {
    const healed = unit.general.troops - unit.troops;
    if (healed > 0) {
      hasHeal = true;
      triggerHealCardFx(unit.side, unit.position);
      showDamageText(healed, unit.side, unit.position, {
        kind: "heal",
        tag: "恢复",
      });
    }
  });
  if (hasHeal) {
    playHealSound();
  }
  return result;
};

// 触发武将战法效果（将addReport函数传递给技能效果系统）
const triggerSkillEffects = (general: General, context: any) => {
  if (general.skills) {
    for (const skill of general.skills) {
      // 处理所有类型的技能（包括active和passive）
      // 传递addReport函数给技能效果
      const result: any = executeSkillEffectWithHealFx(() =>
        skill.effect(general, {
        ...context,
        addReport
        }),
      );
      if (result) {
        return result;
      }
    }
  }
  return null;
};

// 执行一次完整攻击流程：攻击前效果触发 → 伤害计算 → 受击反应 → 动画播放 → 攻击后效果触发
const performAttack = (
  attacker: { general: General; side: "player" | "enemy"; position: string },
  target: { general: General; side: "player" | "enemy"; position: string },
  attackType: "physical" | "strategy" = "physical",
) => {
  // 攻击前触发攻击者的战法效果
  const attackContext = {
    type: "attack",
    event: "beforeAttack",
    currentTroops: attacker.general.troops,
    maxTroops: attacker.general.maxTroops,
    attackType: attackType,
  };
  const attackEffect = triggerSkillEffects(attacker.general, attackContext);

  // 计算基础伤害
  let damage = 0;
  
  // 获取目标的防御降低效果（用于物理攻击）
  let targetDefenseReduction = 0;
  if (target.general.skillEffects && target.general.skillEffects.defenseReduction > 0) {
    targetDefenseReduction = target.general.skillEffects.defenseReduction;
  }
  
  if (attackType === "physical") {
    // 物理攻击：使用攻击和防御（考虑防御降低效果）
    let defenseBonus = getRelicEffectValue(target.side, "defensePct");
    if (hasLowTroopsDefenseBonus(target.side, target.general)) {
      defenseBonus += getRelicEffectValue(target.side, "lowTroopsDefenseBonusPct");
    }
    const effectiveDefense =
      target.general.defense * (1 + defenseBonus) * (1 - targetDefenseReduction);
    damage = Math.max(
      0,
      attacker.general.attack - effectiveDefense / 2,
    );
    if (targetDefenseReduction > 0 && addReport) {
      addReport(`【${target.general.name}】受【${target.general.skillEffects?.defenseReductionSource}】影响，防御降低${(targetDefenseReduction * 100).toFixed(0)}%！`);
    }
  } else {
    // 策略攻击：使用攻击方谋略和防御方谋略
    // 公式：攻击方策略值 * 系数 - 防御方策略值 / 2
    const strategyBonus = getRelicEffectValue(attacker.side, "strategyPct");
    damage = Math.max(
      0,
      attacker.general.strategy * (1 + strategyBonus) - target.general.strategy / 2,
    );
  }

  if (attackType === "physical") {
    const physicalBonus = getRelicEffectValue(attacker.side, "physicalDamagePct");
    if (physicalBonus > 0) {
      damage *= 1 + physicalBonus;
    }
  } else {
    const strategyDamageBonus = getRelicEffectValue(attacker.side, "strategyDamagePct");
    if (strategyDamageBonus > 0) {
      damage *= 1 + strategyDamageBonus;
    }
  }

  // 应用攻击者的增伤效果
  if (attackEffect && attackEffect.damageIncrease) {
    damage *= 1 + attackEffect.damageIncrease;
    addReport(
      `【${attacker.general.name}】触发战法效果，伤害提升${(attackEffect.damageIncrease * 100).toFixed(0)}%！`,
    );
  }

  // 被攻击前触发目标的战法效果
  const defendContext = {
    type: "attacked",
    event: "beforeDamage",
    currentTroops: target.general.troops,
    maxTroops: target.general.maxTroops,
    attackType: attackType,
  };
  const defendEffect = triggerSkillEffects(target.general, defendContext);

  // 应用目标的减伤效果
  if (defendEffect && defendEffect.damageReduction) {
    damage *= 1 - defendEffect.damageReduction;
    addReport(
      `【${target.general.name}】触发战法效果，受到伤害降低${(defendEffect.damageReduction * 100).toFixed(0)}%！`,
    );
  }

  if (attackType === "physical") {
    const relicReduce = getRelicEffectValue(target.side, "physicalDamageReductionPct");
    if (relicReduce > 0) {
      damage *= 1 - relicReduce;
    }
  } else {
    const relicReduce = getRelicEffectValue(target.side, "strategyDamageReductionPct");
    if (relicReduce > 0) {
      damage *= 1 - relicReduce;
    }
  }

  // 兵种克制逻辑
  if (attacker.general.soldierType && target.general.soldierType) {
    const attackerType = attacker.general.soldierType;
    const targetType = target.general.soldierType;

    if (soldierType克制[attackerType] === targetType) {
      // 克制关系，伤害额外增加30%
      damage *= 1.3;
      addReport(
        `【${attacker.general.name}】的${attackerType}克制【${target.general.name}】的${targetType}，伤害增加30%！`,
      );
    }
  }

  const oldTroops = target.general.troops;
  target.general.troops = Math.max(
    0,
    target.general.troops - Math.floor(damage),
  );

  // 追踪造成伤害统计
  const actualDamage = oldTroops - target.general.troops;
  if (actualDamage > 0) {
    const targetSide = target.side === "player" ? "player" : "enemy";
    battleStats.value.dealt[targetSide][target.position as FormationPosition] += actualDamage;
  }

  // 兵力变化后触发目标的战法效果
  if (target.general.troops < oldTroops) {
    const troopChangeContext = {
      type: "troopChange",
      event: "afterDamage",
      currentTroops: target.general.troops,
      maxTroops: target.general.maxTroops,
      damageAmount: Math.floor(damage),
    };
    triggerSkillEffects(target.general, troopChangeContext);
  }

  // 返回攻击详情，不直接播报
  const attackResult = {
    damage: Math.floor(damage),
    oldTroops: oldTroops,
    newTroops: target.general.troops,
    isTargetDied: target.general.troops <= 0,
    attackType: attackType,
  };

  if (target.general.troops <= 0) {
    target.general.isDead = true;
  }

  return attackResult;
};

// 在卡牌上显示伤害/治疗数值浮文字（数值、颜色、标签、暴击标记）
const showDamageText = (
  damage: number,
  side: "player" | "enemy",
  position: string,
  options?: {
    kind?: "normal" | "high" | "blocked" | "heal" | "healSpark";
    critical?: boolean;
    tag?: string;
  },
) => {
  const text =
    options?.kind === "blocked"
      ? "0"
      : options?.kind === "heal"
        ? "+" + damage
        : "-" + damage;
  // 查找对应卡牌内的troops元素
  const troopsElement = document.querySelector(
    `.${side}-side [data-card-position="${position}"] .troops, ` +
    `.player-side.enemy [data-card-position="${position}"] .troops, ` +
    `.enemy-side [data-card-position="${position}"] .troops`,
  );

  if (!troopsElement) {
    // 备用方案：查找卡牌本身
    const cardElement = document.querySelector(
      `[data-card-side="${side}"][data-card-position="${position}"]`,
    );
    if (!cardElement) return;

    const cardRect = cardElement.getBoundingClientRect();
    const damageText = {
      id: Date.now() + Math.random(),
      text,
      kind: options?.kind || "normal",
      critical: !!options?.critical,
      tag: options?.tag || "",
      x: cardRect.left + cardRect.width / 2 - 20,
      y: cardRect.top + cardRect.height / 2,
      delay: 0,
    };

    damageTexts.value.push(damageText);
    if (options?.kind === "heal") {
      for (let i = 0; i < 3; i++) {
        const spark = {
          id: Date.now() + Math.random() + i,
          text: "✦",
          kind: "healSpark",
          critical: false,
          tag: "",
          x: cardRect.left + cardRect.width / 2 - 24 + (Math.random() * 34 - 17),
          y: cardRect.top + cardRect.height / 2 + (Math.random() * 16 - 8),
          delay: i * 0.05,
        };
        damageTexts.value.push(spark);
      }
    }

    setTimeout(() => {
      damageTexts.value = damageTexts.value.filter(
        (dt) => dt.id !== damageText.id,
      );
    }, 2000);
    return;
  }

  const troopsRect = troopsElement.getBoundingClientRect();
  const damageText = {
    id: Date.now() + Math.random(),
    text,
    kind: options?.kind || "normal",
    critical: !!options?.critical,
    tag: options?.tag || "",
    x: troopsRect.left + troopsRect.width / 2 - 20,
    y: troopsRect.top - 10,
    delay: 0,
  };

  damageTexts.value.push(damageText);
  if (options?.kind === "heal") {
    for (let i = 0; i < 3; i++) {
      const spark = {
        id: Date.now() + Math.random() + i,
        text: "✦",
        kind: "healSpark",
        critical: false,
        tag: "",
        x: troopsRect.left + troopsRect.width / 2 - 24 + (Math.random() * 34 - 17),
        y: troopsRect.top - 12 + (Math.random() * 10 - 5),
        delay: i * 0.05,
      };
      damageTexts.value.push(spark);
    }
  }

  // 2秒后移除伤害文本
  setTimeout(() => {
    damageTexts.value = damageTexts.value.filter(
      (dt) => dt.id !== damageText.id,
    );
  }, 2000);
};

// 在卡牌上方显示武将台词气泡（3秒后自动消失）
const showQuoteText = (
  quote: string,
  side: "player" | "enemy",
  position: string,
) => {
  // 查找对应卡牌
  const cardElement = document.querySelector(
    `[data-card-side="${side}"][data-card-position="${position}"]`,
  );
  if (!cardElement) return;

  const cardRect = cardElement.getBoundingClientRect();
  const quoteText = {
    id: Date.now() + Math.random(),
    text: quote,
    x: cardRect.left + 10,
    y: cardRect.top - 30,
    delay: 0,
  };

  quoteTexts.value.push(quoteText);

  // 3秒后移除台词文本
  setTimeout(() => {
    quoteTexts.value = quoteTexts.value.filter(
      (qt) => qt.id !== quoteText.id,
    );
  }, 3000);
};

// 从给定台词数组中随机抽取一条（用于武将技能台词和阵亡台词）
const getRandomQuote = (quotes: readonly string[]): string => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// 带动画的攻击流程：播报攻击意图 → 执行windup/dash动画 → 真实攻击 → 受击动画 → recover动画
const performAttackWithAnimation = async (
  attacker: { general: General; side: "player" | "enemy"; position: string },
  target: { general: General; side: "player" | "enemy"; position: string },
  attackType: "physical" | "strategy" = "physical",
) => {
  const attackerPrefix = attacker.side === "player" ? "我方" : "敌方";
  const targetPrefix = target.side === "player" ? "我方" : "敌方";
  const attackTypeText = attackType === "physical" ? "物理" : "策略";
  const fx = getFxProfile();

  // 详细播报：谁开始行动
  addReport(
    `${attackerPrefix}${attacker.position}开始行动`,
    attacker.general,
    attacker.side,
  );
  addReport(
    `攻击距离：${attacker.general.attackRange}，可以攻击到${targetPrefix}${target.position}`,
  );

  // 详细播报：选择攻击目标
  addReport(
    `选择${attackTypeText}攻击${targetPrefix}${target.position}【${target.general.name}】`,
    attacker.general,
    attacker.side,
  );
  if (!skipBattleAnimation.value) {
    markAttackerPhase(attacker.side, attacker.position, "windup");
    await waitBattle(fx.windupMs);
    markAttackerPhase(attacker.side, attacker.position, "dash");
    await waitBattle(fx.dashMs);
  }

  // 执行攻击逻辑
  const attackResult = performAttack(attacker, target, attackType);
  const highDamageThreshold = Math.max(
    1,
    Math.floor(target.general.maxTroops * fx.highDamageRatio),
  );
  const criticalThreshold = Math.max(
    1,
    Math.floor(target.general.maxTroops * fx.critDamageRatio),
  );
  const isHighDamage = attackResult.damage >= highDamageThreshold;
  const isCritical = attackResult.damage >= criticalThreshold;

  if (attackResult.damage > 0) {
    // 播放受击音效
    if (!skipBattleAnimation.value) {
      const audio = new Audio('/assets/audios/hint.mp4');
      audio.play().catch(e => console.error('播放音效失败:', e));
    }
    
    // 触发受击动画（闪白、抖动、描边）
    if (!skipBattleAnimation.value) {
      triggerTargetHitReaction(target.side, target.position, isHighDamage);
    }
    if (!skipBattleAnimation.value && battleFxLevel.value === "high" && (isHighDamage || isCritical)) {
      isScreenShaking.value = true;
      window.setTimeout(() => {
        isScreenShaking.value = false;
      }, 140);
    }
    
    addReport(
      `造成${attackResult.damage}点${attackTypeText}伤害！`,
      attacker.general,
      attacker.side,
    );
    addReport(
      `兵力从${attackResult.oldTroops}降至${attackResult.newTroops}`,
      target.general,
      target.side,
    );

    // 显示伤害数值 - 显示在目标卡牌上
    showDamageText(attackResult.damage, target.side, target.position, {
      kind: isHighDamage ? "high" : "normal",
      critical: isCritical,
      tag: isCritical ? "CRIT" : "",
    });

    if (attackResult.isTargetDied) {
      addReport(`阵亡！`, target.general, target.side);
      // 显示阵亡台词
      if (target.general.quotes && target.general.quotes.death && target.general.quotes.death.length > 0) {
        const deathQuote = getRandomQuote(target.general.quotes.death);
        showQuoteText(deathQuote, target.side, target.position);
      }
    } else {
      addReport(
        `剩余兵力：${attackResult.newTroops}`,
        target.general,
        target.side,
      );
    }
  } else {
    if (!skipBattleAnimation.value) {
      triggerTargetHitReaction(target.side, target.position, false);
    }
    showDamageText(0, target.side, target.position, {
      kind: "blocked",
      tag: "格挡",
    });
    addReport(`${attackTypeText}攻击被格挡，未造成伤害！`);
  }

  if (!skipBattleAnimation.value) {
    markAttackerPhase(attacker.side, attacker.position, "recover");
    await waitBattle(fx.recoverMs + 320);
  }

  addReport(
    `${attackerPrefix}${attacker.position}【${attacker.general.name}】行动结束`,
  );
  if (!skipBattleAnimation.value) {
    clearAttackerPhase(attacker.side, attacker.position);
  }
  attackingCard.value = null;
};

// ========== 游戏结束与状态 ==========
// 检查游戏是否结束（敌方大营阵亡=胜利，我方大营阵亡=失败）
const checkGameOver = () => {
  if (enemyFormation.value.大营 && enemyFormation.value.大营.isDead) {
    // 胜利结算：进入崔珏裁赏
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
    addCuiJueQuote("victory");
    addReport(`恭喜！你击败了敌方大营，获得胜利！`);
    openVictorySettlement();
    return true;
  }

  if (playerFormation.value.大营 && playerFormation.value.大营.isDead) {
    // 失败重置
    restoreBattleStateToInitial({ preserveTroops: true });
    addCuiJueQuote("defeat");
    addReport("我方大营阵亡，战斗失败！");
    setTimeout(() => {
      alert("战斗失败！恢复游戏初始数据！");
      resetGame();
    }, 1000);
    return true;
  }

  return false;
};

// 8回合结束后按和局/兵力对比规则判定最终胜负
const checkGameOverByTurns = () => {
  // 首先检查双方大营是否都存活 - 用户要求的新和局逻辑
  const playerCampAlive =
    playerFormation.value.大营 && !playerFormation.value.大营.isDead;
  const enemyCampAlive =
    enemyFormation.value.大营 && !enemyFormation.value.大营.isDead;

  if (playerCampAlive && enemyCampAlive) {
    // 双方大营都存活 - 和局，保留当前状态可以重新开始
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
    addReport("回合结束！双方大营都未阵亡，和局！");
    addReport('可以再次点击"开始"重新战斗！');
    setTimeout(() => {
      alert('和局！当前状态已保留，可以再次点击"开始"重新战斗！');
    }, 1000);
    return;
  }

  // 如果有大营阵亡，按原本的兵力对比逻辑处理
  let playerTroops = 0;
  let enemyTroops = 0;

  Object.values(playerFormation.value).forEach((general) => {
    if (general && !general.isDead) {
      playerTroops += general.troops;
    }
  });

  Object.values(enemyFormation.value).forEach((general) => {
    if (general && !general.isDead) {
      enemyTroops += general.troops;
    }
  });

  if (playerTroops > enemyTroops) {
    // 胜利结算：进入崔珏裁赏
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
    addCuiJueQuote("victory");
    addReport("回合结束！我方兵力占优，获得胜利！");
    openVictorySettlement();
  } else if (enemyTroops > playerTroops) {
    // 失败重置
    restoreBattleStateToInitial();
    addCuiJueQuote("defeat");
    addReport("回合结束！敌方兵力占优，战斗失败！");
    setTimeout(() => {
      alert("战斗失败！恢复游戏初始数据！");
      resetGame();
    }, 1000);
  }
};

// 追加一条战斗播报到报告列表（可选带武将头像和阵营颜色）
const addReport = (
  message: string,
  general?: General,
  side?: "player" | "enemy",
) => {
  let formattedMessage = message;

  if (general) {
    const avatarUrl = general.avatar
      ? `${API_BASE_URL}${general.avatar}`
      : general.gender === "女"
        ? `${API_BASE_URL}/public/images/ancient_character_women.webp`
        : `${API_BASE_URL}/public/images/ancient_character_men.webp`;

    const sideColor = side === "player" ? "#667eea" : "#e74c3c";

    formattedMessage = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="${avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${sideColor};" />
        <span style="color: ${sideColor}; font-weight: bold;">${general.name}</span>
        <span>${message}</span>
      </div>
    `;
  }

  battleReports.value.push(formattedMessage); // 改为push，从上到下显示
  // 不再限制播报数量，保留全部历史记录

  // 自动滚动到最新播报
  setTimeout(() => {
    const reportContent = document.querySelector(".report-content");
    if (reportContent) {
      reportContent.scrollTop = reportContent.scrollHeight;
    }
  }, 100);
};

// 重置游戏到初始状态（重新开始时调用）
const resetGame = () => {
  clearAllBattleFx();
  // 恢复游戏开始时的数据
  money.value = initialGameData.money;
  currentYear.value = initialGameData.currentYear;
  currentWave.value = initialGameData.currentWave;
  currentTurn.value = 0;
  currentCommand.value = 0;
  totalConscripts.value = maxConscripts;
  generals.value = [];
  playerFormation.value = {
    大营: null,
    中军: null,
    前锋: null,
  };
  enemyFormation.value = {
    大营: null,
    中军: null,
    前锋: null,
  };
  playerRelics.value = [];
  enemyRelics.value = [];
  playerRelicCandidates.value = [];
  showRelicSelector.value = false;
  showRelicAcquisitionModal.value = false;
  acquiringRelic.value = null;
  showVictoryRewardSelector.value = false;
  victoryRewardOptions.value = [];
  isResolvingVictoryReward.value = false;
  hasShownNewRunQuote.value = false;
  battleReports.value = [];
  playerRecoveryRounds.value = {};
  committedConscripts.value = 0;
  gamePhase.value = "map_select";
  showEventMap.value = true;
  pendingNodeId.value = null;
  pendingBattleNodeType.value = null;
  if (gameLoaded.value) {
    resetRunProgress();
    startRelicSelection();
  }
};

// 获取所有存活武将（我方+敌方），用于战斗循环中的速度排序和技能触发
const getAllGenerals = () => {
  const allGenerals: Array<{
    general: General;
    side: "player" | "enemy";
    position: string;
  }> = [];

  // 添加我方武将
  Object.entries(playerFormation.value).forEach(([position, general]) => {
    if (general && !general.isDead) {
      allGenerals.push({
        general,
        side: "player" as const,
        position,
      });
    }
  });

  // 添加敌方武将
  Object.entries(enemyFormation.value).forEach(([position, general]) => {
    if (general && !general.isDead) {
      allGenerals.push({
        general,
        side: "enemy" as const,
        position,
      });
    }
  });

  return allGenerals;
};

// 获取指定阵营的所有存活武将（用于指挥战法等友军判定）
const getAllAllies = (side: "player" | "enemy"): Array<{
  general: General;
  side: "player" | "enemy";
  position: string;
}> => {
  const allies: Array<{
    general: General;
    side: "player" | "enemy";
    position: string;
  }> = [];

  const formation = side === "player" ? playerFormation.value : enemyFormation.value;

  Object.entries(formation).forEach(([position, general]) => {
    if (general && !general.isDead) {
      allies.push({
        general,
        side,
        position,
      });
    }
  });

  return allies;
};

// ========== 战斗主循环 ==========
// 完整战斗流程：初始化状态 → 8回合循环 → 结算
const startBattle = async () => {
  clearAllBattleFx();
  if (!pendingBattleNodeType.value) {
    addReport("当前没有待处理的战斗节点。");
    showEventMap.value = true;
    return;
  }
  if (areAllOwnedGeneralsResting()) {
    addReport("所有武将均在休整中，战役结束，回到第一轮。");
    alert("所有武将都在休整中，游戏结束！将重置到第一轮。");
    resetGame();
    return;
  }

  if (!playerFormation.value.大营) {
    addReport("请至少在大营上阵一名武将！");
    return;
  }
  const hasZeroTroops = Object.values(playerFormation.value).some(
    (slot) => slot !== null && slot.troops <= 0,
  );
  if (hasZeroTroops) {
    addReport("请先为上阵武将分配兵力后再开始战斗。");
    return;
  }

  if (playerRelics.value.length === 0) {
    startRelicSelection();
    addReport("请先选择我方遗物，再开始战斗。");
    return;
  }
  addCuiJueQuote("battle");
  showEventMap.value = true;
  isBattlePaused.value = false;
  lockBattleConscriptSnapshot();
  // 重置战斗统计
  battleStats.value = {
    dealt: {
      player: { 大营: 0, 中军: 0, 前锋: 0 },
      enemy: { 大营: 0, 中军: 0, 前锋: 0 },
    },
    healing: {
      player: { 大营: 0, 中军: 0, 前锋: 0 },
      enemy: { 大营: 0, 中军: 0, 前锋: 0 },
    },
  };
  isBattleActive.value = true;
  captureBattleStartSnapshot();

  // 激活羁绊效果
  const playerGenerals = Object.values(playerFormation.value).filter((g): g is General => g !== null);
  const enemyGenerals = Object.values(enemyFormation.value).filter((g): g is General => g !== null);
  activateBonds(playerGenerals, addReport);
  activateBonds(enemyGenerals, addReport);

  // 战斗循环 - 共8回合
  for (let i = 1; i <= 8; i++) {
    currentTurn.value = i;
    addReport(
      `<span style="color: #667eea; font-weight: bold;">========== 第 ${i} 回合开始！ ==========</span>`,
    );

    // 收集所有存活的武将
    const allUnits: any = [];
    
    // 添加我方武将
    Object.entries(playerFormation.value).forEach(([position, general]) => {
      if (general && !general.isDead) {
        allUnits.push({
          general,
          side: "player" as const,
          position
        });
      }
    });
    
    // 添加敌方武将
    Object.entries(enemyFormation.value).forEach(([position, general]) => {
      if (general && !general.isDead) {
        allUnits.push({
          general,
          side: "enemy" as const,
          position
        });
      }
    });
    
    // 按速度从快到慢排序（叠加遗物速度效果）
    allUnits.sort(
      (a: any, b: any) =>
        getAdjustedSpeed(b.general, b.side) - getAdjustedSpeed(a.general, a.side),
    );
    
    let unitIndex = 1;
    
    // 依次执行每个武将的行动
    for (const unit of allUnits) {
      if (unit.general.isDead) continue;
      
      // 详细播报当前行动者信息
      const sidePrefix = unit.side === "player" ? "我方" : "敌方";
      const effectiveSpeed = getAdjustedSpeed(unit.general, unit.side);
      addReport(
        `== ${unitIndex}. ${sidePrefix}${unit.position}【${unit.general.name}】开始行动（速度：${Math.floor(effectiveSpeed)}）==`,
      );
      addReport(
        `兵力：${unit.general.troops}，攻击：${unit.general.attack}，防御：${unit.general.defense}，策略：${unit.general.strategy}，速度：${unit.general.speed}，攻击距离：${unit.general.attackRange}，攻城：${unit.general.siege}`,
      );

      // 角色回合开始时触发turnStart事件（用于减少降攻等效果的持续回合数）
      const turnStartContext = {
        type: "turnStart",
        event: "startOfTurn",
        currentTroops: unit.general.troops,
        maxTroops: unit.general.maxTroops,
      };

      // 处理当前角色的技能效果
      triggerSkillEffects(unit.general, turnStartContext);
      applyRelicDebuffResist(unit);

      // 直接处理当前角色的skillEffects中的持续效果
      if (unit.general.skillEffects) {
        // 处理伤害输出降低效果
        if (unit.general.skillEffects.damageOutputReductionDuration > 0) {
          unit.general.skillEffects.damageOutputReductionDuration -= 1;
          addReport(
            `【${unit.general.name}】的降攻效果剩余${unit.general.skillEffects.damageOutputReductionDuration}回合`,
          );
          if (unit.general.skillEffects.damageOutputReductionDuration === 0) {
            const source = unit.general.skillEffects.damageOutputReductionSource || "";
            unit.general.skillEffects.damageOutputReduction = 0;
            unit.general.skillEffects.damageOutputReductionSource = '';
            addReport(
              `【${unit.general.name}】${source}的伤害输出降低效果结束！`,
            );
          }
        }

        // 处理战法发动概率降低效果
        if (unit.general.skillEffects.skillTriggerReductionDuration > 0) {
          unit.general.skillEffects.skillTriggerReductionDuration -= 1;
          addReport(
            `【${unit.general.name}】的战法发动概率降低效果剩余${unit.general.skillEffects.skillTriggerReductionDuration}回合`,
          );
          if (unit.general.skillEffects.skillTriggerReductionDuration === 0) {
            const source = unit.general.skillEffects.skillTriggerReductionSource || "";
            unit.general.skillEffects.skillTriggerReduction = 0;
            unit.general.skillEffects.skillTriggerReductionSource = '';
            addReport(
              `【${unit.general.name}】${source}的战法发动概率降低效果结束！`,
            );
          }
        }

        // 处理防御降低效果
        if (unit.general.skillEffects.defenseReductionDuration > 0) {
          unit.general.skillEffects.defenseReductionDuration -= 1;
          addReport(
            `【${unit.general.name}】的防御降低效果剩余${unit.general.skillEffects.defenseReductionDuration}回合`,
          );
          if (unit.general.skillEffects.defenseReductionDuration === 0) {
            const source = unit.general.skillEffects.defenseReductionSource || "";
            unit.general.skillEffects.defenseReduction = 0;
            unit.general.skillEffects.defenseReductionSource = '';
            addReport(
              `【${unit.general.name}】${source}的防御降低效果结束！`,
            );
          }
        }

        // 处理速度降低效果
        if (unit.general.skillEffects.speedReductionDuration > 0) {
          unit.general.skillEffects.speedReductionDuration -= 1;
          addReport(
            `【${unit.general.name}】的减速效果剩余${unit.general.skillEffects.speedReductionDuration}回合`,
          );
          if (unit.general.skillEffects.speedReductionDuration === 0) {
            unit.general.skillEffects.speedReduction = 0;
            addReport(
              `【${unit.general.name}】的减速效果结束！`,
            );
          }
        }

        // 处理回血增益效果
        if (unit.general.skillEffects.recoveryFromDebuffDuration > 0) {
          unit.general.skillEffects.recoveryFromDebuffDuration -= 1;
          addReport(
            `【${unit.general.name}】的回血增益效果剩余${unit.general.skillEffects.recoveryFromDebuffDuration}回合`,
          );
          if (unit.general.skillEffects.recoveryFromDebuffDuration === 0) {
            const source = unit.general.skillEffects.recoveryFromDebuffSource || "";
            unit.general.skillEffects.recoveryFromDebuff = 0;
            unit.general.skillEffects.recoveryFromDebuffSource = '';
            addReport(
              `【${unit.general.name}】${source}的回血增益效果结束！`,
            );
          }
        }

        // 处理怯战（无法普攻）效果
        if (unit.general.skillEffects.cannotNormalAttackDuration > 0) {
          unit.general.skillEffects.cannotNormalAttackDuration -= 1;
          addReport(
            `【${unit.general.name}】的怯战效果剩余${unit.general.skillEffects.cannotNormalAttackDuration}回合`,
          );
          if (unit.general.skillEffects.cannotNormalAttackDuration === 0) {
            const source = unit.general.skillEffects.cannotNormalAttackSource || "";
            unit.general.skillEffects.cannotNormalAttack = false;
            unit.general.skillEffects.cannotNormalAttackSource = '';
            addReport(
              `【${unit.general.name}】${source}的怯战效果结束！`,
            );
          }
        }
      }

      // 触发指挥战法效果（每回合开始时）
      if (unit.general.skills) {
        for (const skill of unit.general.skills) {
          console.log(`检查单位【${unit.general.name}】的技能，类型: ${skill.type}, 名称: ${skill.name}`);
          if (skill.type === "command") {
            console.log(`触发【${unit.general.name}】的指挥战法【${skill.name}】！`);
            const commandSkillContext = {
              type: "command",
              event: "turnStart",
              currentTroops: unit.general.troops,
              maxTroops: unit.general.maxTroops,
              addReport,
              allies: getAllAllies(unit.side)
            };
            executeSkillEffectWithHealFx(() => skill.effect(unit.general, commandSkillContext));
          }
        }
      }

      // 触发主动战法
      let activeSkillTriggered = false;
      if (unit.general.skills) {
        for (const skill of unit.general.skills) {
          if (skill.type === "active") {
            // 触发前检查是否有战法发动概率降低效果
            const beforeTriggerContext = {
              type: "activeSkill",
              event: "beforeTrigger",
              currentTroops: unit.general.troops,
              maxTroops: unit.general.maxTroops,
              addReport
            };
            const beforeTriggerResult = executeSkillEffectWithHealFx(() =>
              skill.effect(unit.general, beforeTriggerContext),
            );

            // 应用战法发动概率降低效果
            let finalTriggerChance = 1;
            if (beforeTriggerResult && beforeTriggerResult.triggerReduction) {
              finalTriggerChance = 1 - beforeTriggerResult.triggerReduction;
            }
            finalTriggerChance += getRelicEffectValue(unit.side, "activeSkillChancePct");
            finalTriggerChance = Math.max(0, Math.min(1, finalTriggerChance));

            // 检查是否触发
            if (Math.random() < finalTriggerChance) {
              const targets = getTargetsInRange({
                general: unit.general,
                side: unit.side,
                position: unit.position,
              });

              // 找到友军目标（用于治疗效果）
              const allies: General[] = [];
              if (unit.side === "player") {
                Object.values(playerFormation.value).forEach((general) => {
                  if (general && !general.isDead) {
                    allies.push(general);
                  }
                });
              } else {
                Object.values(enemyFormation.value).forEach((general) => {
                  if (general && !general.isDead) {
                    allies.push(general);
                  }
                });
              }

              if (targets.length > 0) {
                const skillContext = {
                  type: "activeSkill",
                  event: "trigger",
                  currentTroops: unit.general.troops,
                  maxTroops: unit.general.maxTroops,
                  targets: targets.map(t => t.general),
                  allies: allies,
                  addReport
                };
                const skillResult = executeSkillEffectWithHealFx(() =>
                  skill.effect(unit.general, skillContext),
                );
                if (skillResult && skillResult.triggered) {
                  activeSkillTriggered = true;
                  // 显示技能释放台词
                  if (unit.general.quotes && unit.general.quotes.skill && unit.general.quotes.skill.length > 0) {
                    const skillQuote = getRandomQuote(unit.general.quotes.skill);
                    showQuoteText(skillQuote, unit.side, unit.position);
                  }
                  
                  // 为技能伤害添加受击音效和动画
                  targets.forEach((target) => {
                    // 播放受击音效
                    const audio = new Audio('/assets/audios/hint.mp4');
                    audio.play().catch(e => console.error('播放音效失败:', e));
                    triggerTargetHitReaction(target.side, target.position, false);
                  });
                  
                  break;
                }
              }
            }
          }
        }
      }

      // 如果主动战法未触发，执行普通攻击（物理伤害）
      if (!activeSkillTriggered) {
        // 怯战状态下无法进行普通攻击
        if (
          unit.general.skillEffects?.cannotNormalAttack &&
          unit.general.skillEffects?.cannotNormalAttackDuration > 0
        ) {
          addReport(`【${unit.general.name}】处于怯战状态，无法发动普通攻击！`);
          unitIndex++;
          if (checkGameOver()) {
            isBattleActive.value = false;
            clearAllBattleFx();
            return;
          }
          await waitBattle(400);
          continue;
        }

        const targets = getTargetsInRange({
          general: unit.general,
          side: unit.side,
          position: unit.position,
        });

        if (targets.length > 0) {
          addReport(`可攻击目标：${targets.length}个`);
          const target = targets[Math.floor(Math.random() * targets.length)];
          // 普通攻击都是物理伤害
          await performAttackWithAnimation(
            {
              general: unit.general,
              side: unit.side,
              position: unit.position,
            },
            target,
            "physical"
          );

          // 骑兵连击（遗物）
          if (
            unit.general.soldierType === "骑兵" &&
            getRelicEffectValue(unit.side, "cavalryDoubleStrikeChance") > 0 &&
            Math.random() < getRelicEffectValue(unit.side, "cavalryDoubleStrikeChance")
          ) {
            const extraTargets = getTargetsInRange({
              general: unit.general,
              side: unit.side,
              position: unit.position,
            });
            if (extraTargets.length > 0) {
              const extraTarget =
                extraTargets[Math.floor(Math.random() * extraTargets.length)];
              addReport(`【${unit.general.name}】触发遗物连击，追加一次攻击！`);
              await performAttackWithAnimation(
                {
                  general: unit.general,
                  side: unit.side,
                  position: unit.position,
                },
                extraTarget,
                "physical",
              );
            }
          }
        } else {
          addReport(`范围内没有可攻击的目标！`);
        }
      }

      unitIndex++;

      // 检查游戏结束条件
      if (checkGameOver()) {
        isBattleActive.value = false;
        clearAllBattleFx();
        return;
      }

      // 增加行动间隔时间，让用户能看到详细播报
      await waitBattle(400);
    }

    // 回合统计
    if (allUnits.length > 0) {
      addReport(`本轮共进行了${unitIndex - 1}次有效行动`);
    } else {
      addReport(`本回合没有单位行动`);
    }

    // 回合结束时触发战法效果
    addReport(`===== 回合结束效果 =====`);
    const allAliveGenerals = getAllGenerals().filter((g) => !g.general.isDead);
    for (const generalData of allAliveGenerals) {
      const turnEndContext = {
        type: "turnEnd",
        event: "endOfTurn",
        currentTroops: generalData.general.troops,
        maxTroops: generalData.general.maxTroops,
      };
      triggerSkillEffects(generalData.general, turnEndContext);
    }
    applyEndTurnRelicEffects();

    // 回合结束播报
    addReport(`========== 第 ${i} 回合结束！ ==========`);

    // 回合间等待时间
    if (i < 8) {
      await waitBattle(500);
    }
  }

  // 8回合结束后
  addReport("8回合结束！");
  showBattleStatsPanel.value = true;
  await waitBattle(1000);

  // 检查是否和局（双方大营都存活）
  const playerCavalryAlive = playerFormation.value.大营 && !playerFormation.value.大营.isDead;
  const enemyCavalryAlive = enemyFormation.value.大营 && !enemyFormation.value.大营.isDead;
  
  if (playerCavalryAlive && enemyCavalryAlive) {
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
    addReport("<span style='color: #f39c12; font-weight: bold;'>战斗结果：和局！双方大营都存活。</span>");
  } else {
    checkGameOverByTurns();
  }
  
  isBattleActive.value = false;
  isBattlePaused.value = false;
  clearAllBattleFx();
};
</script>

<style scoped>
.card-battle-game {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
}

.login-required {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-modal {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-modal h2 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.login-modal p {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.start-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.game-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: url('/assets/bg_xuanzhi_1920x1080.jpg') no-repeat center center;
  background-size: cover;
  overflow-y: auto;
}

.game-header {
  padding: 15px 20px;
}

.speed-bar-container {
  margin-bottom: 20px;
}

.speed-bar-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.speed-bar {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 120px;
}

.speed-unit {
  flex: 0 0 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.speed-unit.active {
  border: 2px solid #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.speed-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-bottom: 8px;
  border: 2px solid #667eea;
}

.speed-progress {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.speed-name {
  font-size: 12px;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.damage-text {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: #fff6c2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 1000;
  animation: damagePop 1.2s ease-out forwards;
  will-change: transform, opacity;
}

.damage-text .damage-tag {
  display: block;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.damage-text.damage-normal {
  color: #fff6c2;
}

.damage-text.damage-high {
  color: #ff9d2f;
  font-size: 30px;
}

.damage-text.damage-blocked {
  color: #d7dee8;
  font-size: 20px;
}

.damage-text.damage-heal {
  color: #67f3a8;
  font-size: 34px;
  font-weight: 900;
  text-shadow:
    0 0 18px rgba(103, 243, 168, 0.85),
    0 0 34px rgba(128, 255, 195, 0.45),
    2px 2px 4px rgba(0, 0, 0, 0.45);
  animation: healPop 1.05s cubic-bezier(0.18, 0.85, 0.28, 1) forwards;
}

.damage-text.damage-heal .damage-tag {
  color: #d4ffe9;
  text-shadow: 0 0 10px rgba(103, 243, 168, 0.85);
  letter-spacing: 1.2px;
}

.damage-text.damage-healSpark {
  color: #87ffd0;
  font-size: 18px;
  text-shadow: 0 0 8px rgba(135, 255, 208, 0.85);
  animation: healSpark 0.72s ease-out forwards;
}

.damage-text.crit {
  color: #ff5f3a;
  font-size: 34px;
  text-shadow: 0 0 14px rgba(255, 95, 58, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.damage-text.crit .damage-tag {
  color: #ffd166;
  text-shadow: 0 0 6px rgba(255, 209, 102, 0.8);
}

.quote-text {
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 200px;
  animation: quoteFloat 3s ease-out forwards;
}

@keyframes quoteFloat {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  20% {
    opacity: 1;
    transform: translateY(-10px);
  }
  80% {
    opacity: 1;
    transform: translateY(-10px);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

.card-speed-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
  padding: 2px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.mini-speed-bar {
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-right: 4px;
}

.mini-speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff9800);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.mini-speed-text {
  font-size: 8px;
  color: #ffd700;
  font-weight: bold;
  min-width: 30px;
}

@keyframes damagePop {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-50px) scale(1.5);
  }
}

@keyframes healPop {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.68);
  }
  24% {
    opacity: 1;
    transform: translateY(-8px) scale(1.2);
  }
  62% {
    opacity: 1;
    transform: translateY(-26px) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translateY(-52px) scale(0.94);
  }
}

@keyframes healSpark {
  0% {
    opacity: 0.95;
    transform: translateY(0) scale(0.7) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-26px) scale(1.3) rotate(35deg);
  }
}

.card.target-heal-pulse {
  animation: cardHealPulse 0.65s ease-out;
  box-shadow:
    0 0 0 2px rgba(120, 255, 191, 0.72),
    0 0 26px rgba(120, 255, 191, 0.52),
    0 0 38px rgba(120, 255, 191, 0.25);
}

@keyframes cardHealPulse {
  0% {
    filter: brightness(1) saturate(1);
    transform: scale(1);
  }
  28% {
    filter: brightness(1.24) saturate(1.3);
    transform: scale(1.018);
  }
  100% {
    filter: brightness(1) saturate(1);
    transform: scale(1);
  }
}

.game-info {
  display: flex;
  justify-content: flex-start;
  gap: 40px;
  align-items: center;
  padding: 15px 20px;
}

.ui-top-bar-status {
  width: 100%;
  background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
  background-size: cover;
  padding: 15px 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  transition: all 0.3s ease;
  cursor: help;
}

.info-item:hover {
  transform: translateY(-2px);
}

.info-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.info-item:hover .info-icon-wrapper {
  transform: scale(1.1);
}

.info-icon {
  width: 24px;
  height: 24px;
}

.info-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

/* 悬浮提示框 */
.tooltip-popup {
  position: fixed;
  transform: translate(-50%, 0);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-popup::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(0, 0, 0, 0.85);
}

.info-value {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
}

.command-warning .info-value {
  color: #ff4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}

.game-area {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 30px;
  min-height: 520px;
}

.middle-hub {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 16px;
  align-items: stretch;
}

.middle-hub-left,
.middle-hub-right {
  min-width: 0;
}

.map-toggle-btn {
  position: absolute;
  left: 10px;
  top: 120px;
  z-index: 25;
  border: 1px solid rgba(88, 64, 35, 0.65);
  background: rgba(255, 248, 232, 0.95);
  color: #5b4124;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.battle-map-drawer {
  position: absolute;
  left: 10px;
  top: 160px;
  width: min(980px, calc(100% - 20px));
  max-height: calc(100% - 200px);
  z-index: 24;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-105%);
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.battle-map-drawer.open {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.battle-map-drawer .event-map-board {
  min-height: 420px;
}

.player-side {
  flex: 1;
  min-height: 530px;
  background-image: url('/assets/ui_frame.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  padding: 60px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.side-label {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.battle-stage {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20px;
  flex: 1;
}

.empty-slot {
  color: #7f8c8d;
  font-size: 14px;
  text-align: center;
}

.card-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.troops-bar-container {
  margin-bottom: 8px;
  width: 100%;
  display: block;
  position: relative;
}

.troops-bar-container.active {
  filter: brightness(1.05);
}

.troops-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: ew-resize;
}

.troops-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.troops-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  z-index: 10;
  pointer-events: none;
  display: block;
}

.card {
  width: 100%;
  flex: 1;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(118, 75, 162, 0.05) 100%);
  z-index: 1;
}

.card.enemy::before {
  background: linear-gradient(135deg,
      rgba(231, 76, 60, 0.05) 0%,
      rgba(192, 57, 43, 0.05) 100%);
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.card.selected {
  border: 3px solid #ffd700;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
}

.card.attacker-windup {
  animation: attackerWindup 0.09s ease-out;
}

.card.attacker-dash {
  animation: attackerDash 0.12s ease-out forwards;
}

.card.attacker-recover {
  animation: attackerRecover 0.18s ease-in forwards;
}

.card.target-hit-shake {
  animation: targetHitShake 0.14s ease-out;
}

.card.target-hit-shake.target-hit-heavy {
  animation-name: targetHitShakeHeavy;
}

.card.target-hit-flash::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.42);
  pointer-events: none;
  z-index: 6;
  animation: targetHitFlash 0.11s ease-out;
}

.card.target-hit-outline {
  animation: targetHitOutline 0.22s ease-out;
}

.screen-shake {
  animation: screenShake 0.14s linear;
}

@keyframes attackerWindup {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  100% {
    transform: scale(1.04);
    filter: brightness(1.12);
  }
}

@keyframes attackerDash {
  0% {
    transform: translateX(0) scale(1.04);
  }
  100% {
    transform: translateX(calc(var(--dash-distance, 90px) * var(--dash-direction, 1))) scale(1.06);
  }
}

@keyframes attackerRecover {
  0% {
    transform: translateX(calc(var(--dash-distance, 90px) * var(--dash-direction, 1))) scale(1.04);
  }
  100% {
    transform: translateX(0) scale(1);
  }
}

@keyframes targetHitShake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-8px) rotate(-1.2deg); }
  50% { transform: translateX(9px) rotate(1.4deg); }
  75% { transform: translateX(-5px) rotate(-0.8deg); }
  100% { transform: translateX(0) rotate(0deg); }
}

@keyframes targetHitShakeHeavy {
  0% { transform: translateX(0); }
  25% { transform: translateX(-12px) rotate(-1.8deg) scale(0.985); }
  50% { transform: translateX(14px) rotate(1.9deg) scale(0.992); }
  75% { transform: translateX(-8px) rotate(-1deg); }
  100% { transform: translateX(0) rotate(0deg) scale(1); }
}

@keyframes targetHitFlash {
  0% { opacity: 0; }
  40% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes targetHitOutline {
  0% { box-shadow: 0 0 0 rgba(255, 76, 76, 0); }
  45% { box-shadow: 0 0 0 2px rgba(255, 76, 76, 0.95), 0 0 22px rgba(255, 76, 76, 0.65); }
  100% { box-shadow: 0 0 0 rgba(255, 76, 76, 0); }
}

@keyframes screenShake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
  100% { transform: translateX(0); }
}

.card.dead {
  opacity: 0.5;
  filter: grayscale(80%);
  background: rgba(102, 102, 102, 0.8) !important;
}

.card.dead::before {
  opacity: 0.2;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 3;
  position: relative;
}

.card-left-top {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-dynasty {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
}

.card-right-top {
  display: flex;
  align-items: center;
}

.card-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.star.active {
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.star.active.enhanced {
  color: #ff8c00;
  text-shadow: 0 0 6px rgba(255, 140, 0, 0.7), 1px 1px 2px rgba(0, 0, 0, 0.65);
}

.card-middle {
  flex: 1;
  z-index: 1;
  position: relative;
}

.card-troops {
  position: relative;
  z-index: 3;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  background: linear-gradient(180deg,
      rgba(231, 76, 60, 0.9) 0%,
      rgba(192, 57, 43, 0.9) 100%);
  padding: 8px 20px;
  border-radius: 25px;
  margin-top: auto;
  margin-bottom: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.card-bottom {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 3;
  position: relative;
}

.card-bottom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.card-level {
  font-size: 10px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-command {
  font-size: 12px;
  font-weight: bold;
  color: #f39c12;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-soldier-type {
  font-size: 10px;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-range {
  font-size: 12px;
  font-weight: bold;
  color: #3498db;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-bottom-label {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-area {
    flex-direction: column;
    gap: 20px;
  }

  .middle-hub {
    grid-template-columns: 1fr;
  }

  .map-toggle-btn {
    top: 96px;
    left: 8px;
  }

  .battle-map-drawer {
    left: 8px;
    top: 136px;
    max-height: calc(100% - 170px);
  }

  .card {
    padding: 8px;
  }

  .card-name {
    font-size: 12px;
  }

  .card-dynasty {
    font-size: 8px;
  }

  .card-troops {
    font-size: 18px;
    padding: 4px 12px;
  }

  .card-level,
  .card-command,
  .card-range {
    font-size: 10px;
  }

  .card-soldier-type {
    font-size: 8px;
    padding: 1px 4px;
  }

  .card-bottom-label {
    font-size: 6px;
  }

  .battle-report {
    width: 100%;
    max-width: 100%;
  }

  .game-footer {
    flex-direction: column;
    gap: 10px;
  }

  .action-button {
    padding: 15px;
    font-size: 16px;
  }

  .general-items {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

/* 小屏幕移动端适配 */
@media (max-width: 480px) {
  .card-name {
    font-size: 10px;
  }

  .card-dynasty {
    font-size: 7px;
  }

  .card-troops {
    font-size: 16px;
    padding: 3px 10px;
  }

  .card-level,
  .card-command,
  .card-range {
    font-size: 8px;
  }

  .card-soldier-type {
    font-size: 7px;
    padding: 1px 3px;
  }

  .card-bottom-label {
    font-size: 5px;
  }

  .general-items {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

.stat-row span {
  flex: 1;
  text-align: center;
}

.stat-row span:first-child {
  text-align: left;
}

.stat-row span:last-child {
  text-align: right;
}

.card-stats.simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  gap: 8px;
  flex-wrap: nowrap;
  min-width: 0;
}

.card-stats.simple .troops {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-stats.simple .troops::after {
  content: "兵";
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(255, 255, 255, 0.8);
}

.card-stats.simple .command {
  font-size: 20px;
  font-weight: bold;
  color: #4caf50;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-stats.simple .command::after {
  content: "统";
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(76, 175, 80, 0.8);
}

.card-stats.simple .range {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-stats.simple .range::after {
  content: "距";
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(255, 215, 0, 0.8);
}

.tooltip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-content {
  pointer-events: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  min-width: 280px;
  max-width: 320px;
  animation: tooltipFadeIn 0.3s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.tooltip-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.tooltip-level {
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 10px;
}

.tooltip-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.tooltip-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.tooltip-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tooltip-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
}

.tooltip-stat-row.command {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  font-weight: bold;
}

.tooltip-stat-row span {
  flex: 1;
  text-align: center;
}

.tooltip-stat-row span:first-child {
  text-align: left;
}

.tooltip-stat-row span:last-child {
  text-align: right;
}



.general-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.general-list {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.list-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.general-items {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

.general-item {
  transition: all 0.3s ease;
  height: 100%;
}

.general-item:hover {
  transform: translateY(-2px);
}

.general-item .card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.general-item .card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.general-item .card::before {
  opacity: 0.35;
}

.game-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
  background-size: cover;
}

.game-footer .relic-auto-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
  border: 2px solid #8b7355;
  border-radius: 4px;
  color: #f5f5dc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.game-footer .relic-auto-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a4738 0%, #7b6354 100%);
  border-color: #a08060;
}

.game-footer .relic-auto-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.map-select-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 20px;
  background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
  background-size: cover;
  z-index: 100;
}

.tutorial-prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.tutorial-prompt-modal {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: 2px solid #c9a961;
  border-radius: 16px;
  padding: 30px 40px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.tutorial-prompt-modal h2 {
  color: #f5f5dc;
  font-size: 24px;
  margin-bottom: 10px;
}

.tutorial-prompt-modal p {
  color: rgba(245, 245, 220, 0.7);
  margin-bottom: 25px;
}

.tutorial-prompt-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.tutorial-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.tutorial-btn.yes {
  background: linear-gradient(135deg, #c9a961 0%, #a08050 100%);
  color: #2c3e50;
  font-weight: bold;
}

.tutorial-btn.yes:hover {
  background: linear-gradient(135deg, #d4b06a 0%, #b08a55 100%);
  transform: translateY(-2px);
}

.tutorial-btn.no {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
}

.tutorial-btn.no:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
}

.speed-btn {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speed-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.speed-btn.active {
  background: rgba(255, 255, 255, 0.75);
  color: #6a1f1f;
  font-weight: 700;
  border-color: rgba(255, 255, 255, 0.8);
}

.speed-btn.skip-toggle {
  min-width: 96px;
  font-size: 11px;
  padding: 8px 8px;
}

.action-button {
  flex: none;
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  min-width: 100px;
}

.action-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.2);
}

.action-button.recruit {
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
  color: white;
}

.action-button.recruit:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
}

.action-button.recruit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
}

.action-button.end-turn {
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
  color: white;
}

.action-button.end-turn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
}

.action-button.next-wave {
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);
  color: white;
}

.action-button.next-wave:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a3728 0%, #6b5344 100%);;
}

.button-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.action-button:hover .button-icon {
  transform: scale(1.2);
}

.button-text {
  font-weight: bold;
  font-size: 14px;
}

.button-cost {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

@media (max-width: 894px) {
  .game-area {
    flex-direction: column;
    gap: 20px;
  }

  .middle-hub {
    grid-template-columns: 1fr;
  }

  .map-toggle-btn {
    top: 88px;
  }

  .battle-map-drawer {
    top: 128px;
  }

  .battle-stage {
    flex-direction: column;
  }

  .battle-report {
    width: 100%;
    order: -1;
  }

  .player-side {
    width: 100%;
  }

  .game-footer {
    flex-direction: row;
    flex-wrap: wrap;
    background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
    background-size: cover;
  }

  .speed-controls {
    width: 100%;
    justify-content: center;
  }

  .action-button {
    padding: 15px;
  }
}

/* 游戏开始界面 */
.game-start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.game-start-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.6) blur(2px);
}

.game-start-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
}

.game-start-content {
  position: relative;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 30px;
  animation: fadeInDown 1s ease-out;
}

.title-decoration {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #c9a961, transparent);
}

.title-decoration.left {
  background: linear-gradient(90deg, transparent, #c9a961);
}

.title-decoration.right {
  background: linear-gradient(90deg, #c9a961, transparent);
}

.title-main {
  text-align: center;
}

.game-title {
  font-size: 5rem;
  font-weight: 900;
  color: #f5f5dc;
  text-shadow: 0 0 20px rgba(201, 169, 97, 0.5), 0 4px 8px rgba(0, 0, 0, 0.8);
  margin: 0;
  letter-spacing: 0.2em;
  font-family: 'SimSun', 'Microsoft YaHei', serif;
}

.rogue-text {
  display: block;
  font-size: 3.5rem;
  font-weight: 800;
  color: #c9a961;
  letter-spacing: 0.5em;
  text-shadow: 0 0 30px rgba(201, 169, 97, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8);
  margin-top: 10px;
}

.game-subtitle {
  font-size: 1.2rem;
  color: rgba(245, 245, 220, 0.8);
  margin-top: 20px;
  letter-spacing: 0.3em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.progress-footer {
  position: relative;
  z-index: 1001;
  width: 100%;
  max-width: 600px;
  padding: 20px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  animation: fadeInUp 1s ease-out 0.5s both;
}

.progress-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #c9a961, #e8d5a3, #c9a961);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 15px rgba(201, 169, 97, 0.6);
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 2s infinite;
}

.progress-text {
  font-size: 1rem;
  font-weight: bold;
  color: #c9a961;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.2em;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-title {
    font-size: 3rem;
  }

  .rogue-text {
    font-size: 2rem;
  }

  .game-subtitle {
    font-size: 0.9rem;
  }

  .title-decoration {
    width: 40px;
  }

  .title-wrapper {
    gap: 15px;
  }

  .progress-footer {
    padding: 15px 30px 30px;
  }
}
</style>
