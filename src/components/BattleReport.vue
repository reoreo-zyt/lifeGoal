<template>
  <div class="battle-report">
    <div class="report-header">
      <h3>战况播报</h3>
    </div>
    <div class="report-content" ref="reportContent">
      <div
        v-for="(report, index) in reports"
        :key="index"
        class="report-item"
        v-html="report"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = defineProps<{
  reports: string[];
}>();

const reportContent = ref<HTMLElement | null>(null);

// 当报告更新时，自动滚动到最新内容
watch(
  () => props.reports.length,
  () => {
    nextTick(() => {
      if (reportContent.value) {
        reportContent.value.scrollTop = reportContent.value.scrollHeight;
      }
    });
  }
);
</script>

<style scoped>
.battle-report {
  width: 350px;
  background-image: url('/assets/bg_scroll_ink.png');
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.report-header {
  text-align: center;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.report-header h3 {
  margin: 0;
  font-size: 18px;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.report-content {
  flex: 1;
  overflow-y: auto;
  min-height: 600px;
  max-height: 600px;
  padding: 0 30px;
  margin-top: 20px;
  margin-bottom: 60px;
}

.report-item {
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  font-size: 14px;
  color: #ffd700;
  border-left: 3px solid #ffd700;
}

/* 滚动条样式 */
.report-content::-webkit-scrollbar {
  width: 8px;
}

.report-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.report-content::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.report-content::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
</style>
