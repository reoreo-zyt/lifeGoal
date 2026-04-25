<template>
  <div class="general-list-overlay" @click="$emit('close')">
    <div class="general-list" @click.stop>
      <div class="list-header">
        <h3>选择武将</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="general-items">
        <div v-if="generals.length === 0" class="empty-message">
          <p>暂无武将</p>
          <p>请先抽取卡牌</p>
        </div>
        <div
          v-for="general in generals"
          :key="general.id"
          class="general-item"
          @click="$emit('select', general)"
          @contextmenu="$emit('show-tooltip', general, $event)"
        >
          <div
            class="card player"
            :style="{
              backgroundImage: `url(${general.avatar ? API_BASE_URL + general.avatar : general.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
            }"
          >
            <div class="card-top">
              <div class="card-left-top">
                <div class="card-dynasty">{{ general.dynasty }}</div>
                <div class="card-name">{{ general.name }}</div>
              </div>
              <div class="card-right-top">
                <div class="card-stars">
                  <span
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ active: i <= Math.ceil(general.level) }"
                    >★</span
                  >
                </div>
              </div>
            </div>
            <div class="card-middle"></div>
            <div class="card-bottom">
              <div class="card-bottom-item">
                <span class="card-level">Lv.{{ general.level }}</span>
              </div>
              <div class="card-bottom-item">
                <span class="card-command">{{ general.leadership }}</span>
                <span class="card-bottom-label">统率</span>
              </div>
              <div class="card-bottom-item">
                <span class="card-soldier-type">{{
                  general.soldierType
                }}</span>
              </div>
              <div class="card-bottom-item">
                <span class="card-range">{{ general.attackRange }}</span>
                <span class="card-bottom-label">距</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { General } from "../skills/types";

defineProps<{
  generals: General[];
  API_BASE_URL: string;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "select", general: General): void;
  (e: "show-tooltip", general: General, event: MouseEvent): void;
}>();
</script>

<style scoped>
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
  background: url(/assets/ui_border.png) center / 100% 100% no-repeat;
  width: 80%;
  max-width: 1000px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.general-items {
  margin-top: 50px;
  margin-bottom: 120px;
  margin-left: 60px;
  margin-right: 70px;
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  padding: 0 20px 20px;
  min-height: 200px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.list-header h3 {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.close-btn {
  background: url(/assets/btn_close_128.png) center/contain no-repeat;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.general-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.general-item:hover {
  transform: scale(1.05);
}

.card {
  width: 100%;
  height: 280px;
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
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  z-index: 1;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
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

.card-middle {
  flex: 1;
  z-index: 1;
  position: relative;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-command {
  font-size: 12px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-bottom-label {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-soldier-type {
  font-size: 10px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-range {
  font-size: 12px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

/* 滚动条样式 */
.empty-message {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #ffffff;
  font-size: 18px;
  text-align: center;
}

.empty-message p:first-child {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffffff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.empty-message p:last-child {
  font-size: 16px;
  color: #e0e0e0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.general-items::-webkit-scrollbar {
  width: 8px;
}

.general-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.general-items::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.general-items::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
</style>
