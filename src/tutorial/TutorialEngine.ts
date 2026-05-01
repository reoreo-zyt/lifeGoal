import type { TutorialStep, StepHandler } from './types'
import { TUTORIAL_CONFIG, BATTLE_TUTORIAL_CONFIG } from './TutorialConfig'
import { ProgressManager } from './ProgressManager'
import { HighlightHandler } from './handlers/HighlightHandler'
import { TooltipHandler } from './handlers/TooltipHandler'
import { ModalHandler } from './handlers/ModalHandler'

interface TutorialEventBus {
  on(event: string, callback: (...args: any[]) => void): void
  off(event: string, callback: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
}

class SimpleEventBus implements TutorialEventBus {
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map()

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback)
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(cb => cb(...args))
  }
}

export const tutorialEventBus = new SimpleEventBus()

export class TutorialEngine {
  private currentStepIndex = 0
  private steps: TutorialStep[] = TUTORIAL_CONFIG
  private isActive = false
  private currentHandler: StepHandler | null = null
  private actionListeners: Map<string, () => void> = new Map()

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    tutorialEventBus.on('skip', () => this.skip())
    tutorialEventBus.on('next', () => this.nextStep())
  }

  // 设置教程配置（用于切换到战斗教程）
  setSteps(steps: TutorialStep[]): void {
    this.steps = steps
    this.currentStepIndex = 0
  }

  start(): void {
    // Check if already completed
    if (ProgressManager.isCompleted()) {
      return
    }

    // Check for saved progress
    const savedProgress = ProgressManager.loadProgress()
    if (savedProgress) {
      const stepIndex = this.steps.findIndex(s => s.id === savedProgress.currentStepId)
      if (stepIndex !== -1) {
        this.currentStepIndex = stepIndex
      }
    }

    if (this.isActive) return

    this.isActive = true
    ProgressManager.startSession(this.steps[this.currentStepIndex].id)
    this.showStep(this.currentStepIndex)
  }

  skip(): void {
    this.cleanup()
    this.isActive = false
    ProgressManager.markCompleted()
    tutorialEventBus.emit('complete')
  }

  private showStep(index: number): void {
    const step = this.steps[index]
    if (!step) return

    // Clean up any residual tutorial elements from previous sessions
    this.cleanupAllTutorialElements()

    // Hide previous handler
    if (this.currentHandler) {
      this.currentHandler.hide()
    }

    // Get appropriate handler
    this.currentHandler = this.getHandler(step.type)
    this.currentHandler.show(step)

    // Setup action listener
    this.setupActionListener(step)
  }

  private getHandler(type: string): StepHandler {
    switch (type) {
      case 'highlight':
        return new HighlightHandler()
      case 'tooltip':
        return new TooltipHandler()
      case 'modal':
        return new ModalHandler()
      default:
        return new HighlightHandler()
    }
  }

  private setupActionListener(step: TutorialStep): void {
    // Clear previous listeners
    this.clearActionListeners()

    // Listen for auto-advance events
    if (step.autoAdvanceOn) {
      const eventName = step.autoAdvanceOn
      const autoAdvanceHandler = () => {
        this.nextStep()
      }
      tutorialEventBus.on(eventName, autoAdvanceHandler)
      this.actionListeners.set(`auto-advance-${eventName}`, () => {
        tutorialEventBus.off(eventName, autoAdvanceHandler)
      })
    }

    if (step.action === 'none' || !step.actionTarget) {
      // For modal type, listen for next button
      const nextBtn = document.querySelector('.tutorial-modal-next')
      if (nextBtn) {
        const handler = () => {
          tutorialEventBus.emit('next')
        }
        nextBtn.addEventListener('click', handler)
        this.actionListeners.set('modal-next', () => nextBtn.removeEventListener('click', handler))
      }

      // Also listen for skip button
      const skipBtn = document.querySelector('.tutorial-modal-skip, .tutorial-skip-btn')
      if (skipBtn) {
        const handler = () => {
          tutorialEventBus.emit('skip')
        }
        skipBtn.addEventListener('click', handler)
        this.actionListeners.set('modal-skip', () => skipBtn.removeEventListener('click', handler))
      }
    } else {
      // Listen for action on target element (use document delegation for reliability)
      if (step.actionTarget) {
        const actionTarget = step.actionTarget
        const handler = (e: Event) => {
          // 使用 composedPath 检查点击是否在目标元素上
          const path = e.composedPath()
          const clickedOnTarget = path.some(el => {
            if (el instanceof HTMLElement) {
              return el.closest && el.closest(actionTarget)
            }
            return false
          })
          if (clickedOnTarget) {
            // 立即隐藏 overlay，让点击可以继续传递到下层元素
            if (this.currentHandler) {
              this.currentHandler.hide()
            }
            // 延迟一点 emit 事件，让游戏代码有机会处理
            setTimeout(() => {
              if (step.effect) {
                tutorialEventBus.emit('step-effect', step.id)
              }
              tutorialEventBus.emit('action', step.action, actionTarget)
              // 只有没有 autoAdvanceOn 的步骤才在这里调用 nextStep
              if (!step.autoAdvanceOn) {
                this.nextStep()
              }
            }, 0)
          }
        }
        document.addEventListener('click', handler)
        this.actionListeners.set(actionTarget, () => document.removeEventListener('click', handler))
      }

      // Also setup skip button if exists
      const skipBtn = document.querySelector('.tutorial-skip-btn')
      if (skipBtn) {
        const handler = () => {
          tutorialEventBus.emit('skip')
        }
        skipBtn.addEventListener('click', handler)
        this.actionListeners.set('skip', () => skipBtn.removeEventListener('click', handler))
      }
    }
  }

  private clearActionListeners(): void {
    this.actionListeners.forEach(unlisten => unlisten())
    this.actionListeners.clear()
  }

  private nextStep(): void {
    this.clearActionListeners()

    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++
      const step = this.steps[this.currentStepIndex]
      ProgressManager.saveProgress(step.id)

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.showStep(this.currentStepIndex)
      }, 50)
    } else {
      this.complete()
    }
  }

  // 供外部调用，手动推进到下一步
  proceedToNextStep(): void {
    this.nextStep()
  }

  private complete(): void {
    this.cleanup()
    this.isActive = false
    ProgressManager.markCompleted()
    tutorialEventBus.emit('complete')
  }

  private cleanup(): void {
    this.clearActionListeners()
    if (this.currentHandler) {
      this.currentHandler.hide()
      this.currentHandler = null
    }
  }

  // 清理所有残留的教程元素
  private cleanupAllTutorialElements(): void {
    // 清理 highlight overlay
    const highlightOverlay = document.querySelector('.tutorial-highlight-overlay')
    if (highlightOverlay) highlightOverlay.remove()

    // 清理 modal overlay
    const modalOverlay = document.querySelector('.tutorial-modal-overlay')
    if (modalOverlay) modalOverlay.remove()
  }

  hideCurrentStep(): void {
    if (this.currentHandler) {
      this.currentHandler.hide()
    }
  }

  isTutorialActive(): boolean {
    return this.isActive
  }

  getCurrentStep(): TutorialStep | null {
    return this.steps[this.currentStepIndex] || null
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex
  }

  getTotalSteps(): number {
    return this.steps.length
  }

  // 标记是否已进入战斗教程阶段
  private inBattlePhase = false

  isInBattlePhase(): boolean {
    return this.inBattlePhase
  }

  startBattlePhase(): void {
    if (this.inBattlePhase) return
    this.inBattlePhase = true
    this.setSteps(BATTLE_TUTORIAL_CONFIG)
    this.isActive = true
    ProgressManager.startSession(this.steps[0].id)
    this.showStep(0)
  }
}

// Singleton instance
let tutorialInstance: TutorialEngine | null = null

export function getTutorialEngine(): TutorialEngine {
  if (!tutorialInstance) {
    tutorialInstance = new TutorialEngine()
  }
  return tutorialInstance
}

export default TutorialEngine
