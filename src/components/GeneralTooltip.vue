<template>
  <Teleport to="body">
    <div v-if="general" class="tooltip-overlay" @click="onOverlayClick">
      <div class="tooltip-modal" @click.stop>
        <div class="tooltip-header">
          <div class="tooltip-name">{{ general.name }}</div>
          <div class="tooltip-level">Lv.{{ general.level }}</div>
          <button class="tooltip-close" @click="onClose">×</button>
        </div>
        <div class="tooltip-stats">
          <div class="tooltip-stat-row">
            <span>攻击: {{ general.attack }} ({{ general.attackGrowth || 0 }})</span>
            <span>防御: {{ general.defense }} ({{ general.defenseGrowth || 0 }})</span>
          </div>
          <div class="tooltip-stat-row">
            <span>策略: {{ general.strategy }} ({{ general.strategyGrowth || 0 }})</span>
            <span>速度: {{ general.speed }} ({{ general.speedGrowth || 0 }})</span>
          </div>
          <div class="tooltip-stat-row">
            <span>兵力: {{ general.troops }}</span>
            <span>攻击距离: {{ general.attackRange }}</span>
          </div>
          <div class="tooltip-stat-row">
            <span>攻城: {{ general.siege }} ({{ general.siegeGrowth || 0 }})</span>
            <span>统御: {{ general.command }} ({{ general.commandGrowth || 0 }})</span>
          </div>
          <div class="tooltip-stat-row">
            <span>统率: {{ general.leadership }}</span>
          </div>
        </div>
        <div v-if="activeBonds.length > 0" class="tooltip-bonds">
          <div class="tooltip-bonds-title">羁绊</div>
          <div v-for="bond in activeBonds" :key="bond" class="tooltip-bond-item">{{ bond }}</div>
        </div>
        <div v-if="general.skills && general.skills.length > 0" class="tooltip-skills">
          <div class="tooltip-skills-title">自带战法</div>
          <div v-for="skill in general.skills" :key="skill.id" class="tooltip-skill-item">
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-description">{{ skill.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// @ts-nocheck - 跳过此文件的类型检查以允许未使用的变量
import type { General } from "../skills/types";
import { getActiveBondNames } from "../skills/index";
import { computed } from "vue";

const _props = defineProps<{
  general: General | null;
  /** 同队武将，用于计算羁绊 */
  teamGenerals?: General[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const activeBonds = computed(() => {
  if (!_props.general || !_props.teamGenerals) return [];
  return getActiveBondNames(_props.general.id, _props.teamGenerals);
});

const onOverlayClick = () => {
  emit("close");
};

const onClose = () => {
  emit("close");
};
</script>

<style scoped>
.tooltip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.tooltip-modal {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.tooltip-name {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.tooltip-level {
  font-size: 16px;
  color: #667eea;
  font-weight: bold;
}

.tooltip-close {
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

.tooltip-close:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.tooltip-stats {
  margin-bottom: 15px;
}

.tooltip-stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #2c3e50;
}

.tooltip-skills {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.tooltip-skills-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.tooltip-skill-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.skill-name {
  font-size: 14px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.skill-description {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
}

.tooltip-bonds {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.tooltip-bonds-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.tooltip-bond-item {
  background: linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%);
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.4);
}
</style>
