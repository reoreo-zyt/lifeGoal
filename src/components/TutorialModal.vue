<template>
  <Teleport to="body">
    <div v-if="visible" class="tutorial-overlay">
      <!-- 高亮挖洞遮罩 -->
      <div class="tutorial-mask">
        <div v-if="cutoutStyle" class="tutorial-cutout" :style="cutoutStyle"></div>
      </div>

      <!-- 提示气泡 -->
      <div v-if="step" class="tutorial-tooltip" :class="tooltipPosition" :style="tooltipStyle">
        <div class="tutorial-step-indicator">{{ currentStepIndex + 1 }}/{{ totalSteps }}</div>
        <div class="tutorial-title">{{ step.title }}</div>
        <div class="tutorial-description">{{ step.description }}</div>
        <div v-if="step.actionHint" class="tutorial-hint">
          <span class="hint-icon">👆</span> {{ step.actionHint }}
        </div>
        <div class="tutorial-actions">
          <button v-if="canSkip" class="tutorial-btn skip" @click="$emit('skip')">跳过教程</button>
          <button class="tutorial-btn next" @click="$emit('next')">下一步</button>
        </div>
      </div>

      <!-- 进度指示器 -->
      <div class="tutorial-progress">
        <div
          v-for="(_, i) in totalSteps"
          :key="i"
          class="progress-dot"
          :class="{ active: i <= currentStepIndex, current: i === currentStepIndex }"
        ></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface TutorialStep {
  id: string
  title: string
  description: string
  actionHint?: string
  targetSelector?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
}

const props = defineProps<{
  visible: boolean
  step: TutorialStep | null
  currentStepIndex: number
  totalSteps: number
  canSkip: boolean
}>()

defineEmits<{
  (e: 'skip'): void
  (e: 'next'): void
}>()

const testClick = () => {
  alert('按钮点击 works!')
}

const cutoutStyle = ref<Record<string, string> | null>(null)

const tooltipPosition = computed(() => props.step?.tooltipPosition || 'bottom')

const tooltipStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    position: 'fixed',
    zIndex: '9999'
  }

  if (!cutoutStyle.value) {
    return {
      ...baseStyle,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  const rect = parseRect(cutoutStyle.value)
  const pos = tooltipPosition.value

  switch (pos) {
    case 'top':
      return {
        ...baseStyle,
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top - 10}px`,
        transform: 'translate(-50%, -100%)'
      }
    case 'bottom':
      return {
        ...baseStyle,
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top + rect.height + 10}px`,
        transform: 'translate(-50%, 0)'
      }
    case 'left':
      return {
        ...baseStyle,
        left: `${rect.left - 10}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translate(-100%, -50%)'
      }
    case 'right':
      return {
        ...baseStyle,
        left: `${rect.left + rect.width + 10}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translate(0, -50%)'
      }
    default:
      return baseStyle
  }
})

function parseRect(style: Record<string, string>) {
  return {
    top: parseInt(style.top || '0'),
    left: parseInt(style.left || '0'),
    width: parseInt(style.width || '0'),
    height: parseInt(style.height || '0')
  }
}

function updateCutout() {
  if (!props.step?.targetSelector || !props.visible) {
    cutoutStyle.value = null
    return
  }

  const elements = document.querySelectorAll(props.step.targetSelector)
  if (elements.length === 0) {
    cutoutStyle.value = null
    return
  }

  // Use the first matching element
  const el = elements[0] as HTMLElement
  const rect = el.getBoundingClientRect()
  const padding = 8

  cutoutStyle.value = {
    top: `${rect.top - padding}px`,
    left: `${rect.left - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (props.visible) updateCutout()
  })
  resizeObserver.observe(document.body)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(() => props.visible, (visible) => {
  if (visible) {
    setTimeout(updateCutout, 50)
  } else {
    cutoutStyle.value = null
  }
})

watch(() => props.step, () => {
  setTimeout(updateCutout, 100)
}, { deep: true })

watch(() => props.currentStepIndex, () => {
  setTimeout(updateCutout, 100)
})
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
}

.tutorial-mask {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
}

.tutorial-cutout {
  position: absolute;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
  transition: all 0.4s ease;
  pointer-events: none;
}

.tutorial-tooltip {
  pointer-events: none;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: 2px solid #c9a961;
  border-radius: 12px;
  padding: 20px;
  color: white;
  max-width: 300px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.tutorial-step-indicator {
  font-size: 12px;
  color: #c9a961;
  margin-bottom: 8px;
}

.tutorial-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #f5f5dc;
}

.tutorial-description {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  color: rgba(245, 245, 220, 0.9);
}

.tutorial-hint {
  font-size: 13px;
  color: #c9a961;
  background: rgba(0,0,0,0.3);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.hint-icon {
  margin-right: 6px;
}

.tutorial-actions {
  display: flex;
  justify-content: flex-end;
}

.tutorial-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  pointer-events: auto;
  position: relative;
  z-index: 10000;
}

.tutorial-actions {
  pointer-events: auto;
  position: relative;
  z-index: 10001;
}

.tutorial-btn.skip {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.6);
}

.tutorial-btn.skip:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.tutorial-btn.next {
  background: linear-gradient(135deg, #c9a961 0%, #e0b870 100%);
  color: #2c3e50;
  font-weight: bold;
  margin-left: 8px;
}

.tutorial-btn.next:hover {
  background: linear-gradient(135deg, #e0b870 0%, #f0c880 100%);
}

.tutorial-progress {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transition: all 0.3s;
}

.progress-dot.active {
  background: #c9a961;
}

.progress-dot.current {
  width: 12px;
  height: 12px;
  background: #c9a961;
  box-shadow: 0 0 10px rgba(201,169,97,0.6);
}
</style>
