<template>
  <div v-if="general" class="tooltip-overlay">
    <div class="tooltip-content">
      <div class="tooltip-header">
        <div class="tooltip-name">{{ general.name }}</div>
        <div class="tooltip-level">Lv.{{ general.level }}</div>
        <button class="tooltip-close" @click="$emit('close')">×</button>
      </div>
      <div class="tooltip-stats">
        <div class="tooltip-stat-row">
          <span
            >攻击: {{ general.attack }} ({{
              general.attackGrowth || 0
            }})</span
          >
          <span
            >防御: {{ general.defense }} ({{
              general.defenseGrowth || 0
            }})</span
          >
        </div>
        <div class="tooltip-stat-row">
          <span
            >策略: {{ general.strategy }} ({{
              general.strategyGrowth || 0
            }})</span
          >
          <span
            >速度: {{ general.speed }} ({{
              general.speedGrowth || 0
            }})</span
          >
        </div>
        <div class="tooltip-stat-row">
          <span>兵力: {{ general.troops }}</span>
          <span>攻击距离: {{ general.attackRange }}</span>
        </div>
        <div class="tooltip-stat-row">
          <span
            >攻城: {{ general.siege }} ({{
              general.siegeGrowth || 0
            }})</span
          >
          <span
            >统御: {{ general.command }} ({{
              general.commandGrowth || 0
            }})</span
          >
        </div>
        <div class="tooltip-stat-row">
          <span>统率: {{ general.leadership }}</span>
        </div>
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
</template>

<script setup lang="ts">
import type { General } from "../skills/types";

defineProps<{
  general: General | null;
}>();

defineEmits<{
  (e: "close"): void;
}>();
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
  z-index: 1000;
}

.tooltip-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
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
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.tooltip-close:hover {
  background: #f8f9fa;
  color: #e74c3c;
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
</style>
