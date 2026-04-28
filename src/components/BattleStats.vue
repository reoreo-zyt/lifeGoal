<script setup lang="ts">
import { computed } from "vue";
import type { General } from "../skills/types";

interface PositionStats {
  大营: number;
  中军: number;
  前锋: number;
}

interface BattleStats {
  dealt: {
    player: PositionStats;
    enemy: PositionStats;
  };
  healing: {
    player: PositionStats;
    enemy: PositionStats;
  };
}

type FormationPosition = "大营" | "中军" | "前锋";

const props = defineProps<{
  stats: BattleStats;
  playerFormation: Record<FormationPosition, General | null>;
  enemyFormation: Record<FormationPosition, General | null>;
}>();

defineEmits<{ (e: "close"): void }>();

const positions = ["前锋", "中军", "大营"] as const;

// 我方总伤害、敌方总伤害
const playerDealtTotal = computed(() =>
  props.stats.dealt.player.大营 + props.stats.dealt.player.中军 + props.stats.dealt.player.前锋,
);
const enemyDealtTotal = computed(() =>
  props.stats.dealt.enemy.大营 + props.stats.dealt.enemy.中军 + props.stats.dealt.enemy.前锋,
);
const grandDealtTotal = computed(() => playerDealtTotal.value + enemyDealtTotal.value);

// 我方总恢复、敌方总恢复
const playerHealTotal = computed(() =>
  props.stats.healing.player.大营 + props.stats.healing.player.中军 + props.stats.healing.player.前锋,
);
const enemyHealTotal = computed(() =>
  props.stats.healing.enemy.大营 + props.stats.healing.enemy.中军 + props.stats.healing.enemy.前锋,
);

const pct = (value: number, total: number) => {
  if (total === 0) return "0%";
  return ((value / total) * 100).toFixed(1) + "%";
};

const sideDealtPct = (side: "player" | "enemy") => {
  const total = side === "player" ? playerDealtTotal.value : enemyDealtTotal.value;
  return pct(total, grandDealtTotal.value);
};

const getAvatar = (side: "player" | "enemy", pos: FormationPosition) => {
  const formation = side === "player" ? props.playerFormation : props.enemyFormation;
  return formation[pos]?.avatar || "";
};

const getName = (side: "player" | "enemy", pos: FormationPosition) => {
  const formation = side === "player" ? props.playerFormation : props.enemyFormation;
  return formation[pos]?.name || "—";
};

const hasData = computed(() => grandDealtTotal.value > 0 || playerHealTotal.value > 0 || enemyHealTotal.value > 0);
</script>

<template>
  <Teleport to="body">
    <div class="battle-stats-overlay" @click.self="$emit('close')">
      <div class="battle-stats-panel">
        <!-- 标题栏 -->
        <div class="panel-header">
          <h2>战斗统计</h2>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <template v-if="hasData">
          <!-- 总览：造成伤害 -->
          <div class="stats-overview">
            <div class="overview-item player">
              <span class="label">我方造成伤害</span>
              <span class="value">{{ playerDealtTotal.toLocaleString() }}</span>
              <span class="pct">{{ sideDealtPct("player") }}</span>
            </div>
            <div class="overview-divider">vs</div>
            <div class="overview-item enemy">
              <span class="label">敌方造成伤害</span>
              <span class="value">{{ enemyDealtTotal.toLocaleString() }}</span>
              <span class="pct">{{ sideDealtPct("enemy") }}</span>
            </div>
          </div>

          <!-- 伤害明细 -->
          <div class="stats-detail">
            <div class="team-section">
              <div class="team-title player-title">我方伤害</div>
              <div v-for="pos in positions" :key="pos" class="position-row">
                <img
                  v-if="getAvatar('player', pos)"
                  :src="getAvatar('player', pos)"
                  :alt="getName('player', pos)"
                  class="general-avatar"
                />
                <div v-else class="general-avatar avatar-placeholder">?</div>
                <span class="pos-label">{{ pos }}</span>
                <div class="bar-wrap">
                  <div
                    class="bar player-bar"
                    :style="{ width: pct(stats.dealt.player[pos], grandDealtTotal) }"
                  ></div>
                </div>
                <span class="bar-value">{{ stats.dealt.player[pos].toLocaleString() }}</span>
                <span class="bar-pct">{{ pct(stats.dealt.player[pos], grandDealtTotal) }}</span>
              </div>
            </div>

            <div class="team-section">
              <div class="team-title enemy-title">敌方伤害</div>
              <div v-for="pos in positions" :key="pos" class="position-row">
                <img
                  v-if="getAvatar('enemy', pos)"
                  :src="getAvatar('enemy', pos)"
                  :alt="getName('enemy', pos)"
                  class="general-avatar"
                />
                <div v-else class="general-avatar avatar-placeholder">?</div>
                <span class="pos-label">{{ pos }}</span>
                <div class="bar-wrap">
                  <div
                    class="bar enemy-bar"
                    :style="{ width: pct(stats.dealt.enemy[pos], grandDealtTotal) }"
                  ></div>
                </div>
                <span class="bar-value">{{ stats.dealt.enemy[pos].toLocaleString() }}</span>
                <span class="bar-pct">{{ pct(stats.dealt.enemy[pos], grandDealtTotal) }}</span>
              </div>
            </div>
          </div>

          <!-- 恢复统计（仅当有恢复数据时显示） -->
          <template v-if="playerHealTotal > 0 || enemyHealTotal > 0">
            <div class="heal-section-title">兵力恢复</div>
            <div class="stats-overview heal-overview">
              <div class="overview-item player">
                <span class="label">我方恢复</span>
                <span class="value heal-value">{{ playerHealTotal.toLocaleString() }}</span>
              </div>
              <div class="overview-divider">|</div>
              <div class="overview-item enemy">
                <span class="label">敌方恢复</span>
                <span class="value heal-value">{{ enemyHealTotal.toLocaleString() }}</span>
              </div>
            </div>

            <div class="stats-detail">
              <div class="team-section">
                <div class="team-title player-title">我方恢复</div>
                <div v-for="pos in positions" :key="pos" class="position-row">
                  <img
                    v-if="getAvatar('player', pos)"
                    :src="getAvatar('player', pos)"
                    :alt="getName('player', pos)"
                    class="general-avatar"
                  />
                  <div v-else class="general-avatar avatar-placeholder">?</div>
                  <span class="pos-label">{{ pos }}</span>
                  <span class="bar-value heal-bar-value">{{ stats.healing.player[pos].toLocaleString() }}</span>
                  <span class="bar-pct">{{ stats.healing.player[pos] > 0 ? '+' : '' }}</span>
                </div>
              </div>

              <div class="team-section">
                <div class="team-title enemy-title">敌方恢复</div>
                <div v-for="pos in positions" :key="pos" class="position-row">
                  <img
                    v-if="getAvatar('enemy', pos)"
                    :src="getAvatar('enemy', pos)"
                    :alt="getName('enemy', pos)"
                    class="general-avatar"
                  />
                  <div v-else class="general-avatar avatar-placeholder">?</div>
                  <span class="pos-label">{{ pos }}</span>
                  <span class="bar-value heal-bar-value">{{ stats.healing.enemy[pos].toLocaleString() }}</span>
                  <span class="bar-pct">{{ stats.healing.enemy[pos] > 0 ? '+' : '' }}</span>
                </div>
              </div>
            </div>
          </template>
        </template>

        <template v-else>
          <div class="no-data">本场战斗无统计数据</div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.battle-stats-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.battle-stats-panel {
  background: url('/assets/bg_scroll_ink.png');
  background-size: cover;
  background-position: center;
  border: 3px solid #8b6914;
  border-radius: 16px;
  padding: 28px 32px;
  width: 560px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.panel-header h2 {
  margin: 0;
  font-size: 22px;
  color: #ffd700;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.9);
}

.close-btn {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: color 0.2s;
}
.close-btn:hover { color: #ff6b6b; }

/* 总览区 */
.stats-overview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 14px 20px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 10px;
}

.heal-overview {
  background: rgba(0, 40, 0, 0.35);
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.overview-item .label {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 4px;
}

.overview-item .value {
  font-size: 26px;
  font-weight: bold;
  color: #fff;
}

.overview-item .pct {
  font-size: 13px;
  color: #aaa;
}

.overview-item.player .value { color: #4fc3f7; }
.overview-item.enemy .value  { color: #ef5350; }
.overview-item .heal-value   { color: #69f0ae; }

.overview-divider {
  font-size: 18px;
  color: #888;
  font-weight: bold;
}

/* 明细区 */
.stats-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.team-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 12px 16px;
}

.team-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.player-title { color: #4fc3f7; }
.enemy-title  { color: #ef5350; }

.position-row {
  display: grid;
  grid-template-columns: 44px 48px 1fr 56px 52px;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.position-row:last-child { margin-bottom: 0; }

.general-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
}

.avatar-placeholder {
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.pos-label {
  font-size: 13px;
  color: #ddd;
  text-align: center;
}

.bar-wrap {
  height: 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 7px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 7px;
  transition: width 0.6s ease;
  min-width: 4px;
}

.player-bar { background: linear-gradient(90deg, #0288d1, #4fc3f7); }
.enemy-bar  { background: linear-gradient(90deg, #b71c1c, #ef5350); }

.bar-value {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  text-align: right;
}

.heal-bar-value {
  color: #69f0ae;
}

.bar-pct {
  font-size: 12px;
  color: #aaa;
  text-align: right;
}

/* 恢复标题 */
.heal-section-title {
  font-size: 15px;
  font-weight: bold;
  color: #69f0ae;
  text-align: center;
  margin-bottom: 12px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
}

.no-data {
  text-align: center;
  color: #aaa;
  font-size: 16px;
  padding: 40px 0;
}
</style>