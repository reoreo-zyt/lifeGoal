import type { TutorialStep, StepHandler } from '../types'

export class HighlightHandler implements StepHandler {
  private overlay: HTMLElement | null = null

  show(step: TutorialStep): void {
    this.createOverlay()
    this.positionHighlight(step)
  }

  hide(): void {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div')
    this.overlay.className = 'tutorial-highlight-overlay'
    this.overlay.innerHTML = `
      <div class="tutorial-cutout"></div>
      <div class="tutorial-tooltip-box">
        <div class="tutorial-step-num"></div>
        <div class="tutorial-tooltip-title"></div>
        <div class="tutorial-tooltip-content"></div>
        <div class="tutorial-tooltip-actions">
          <button class="tutorial-skip-btn">跳过教程</button>
        </div>
      </div>
      <div class="tutorial-progress-dots"></div>
    `
    document.body.appendChild(this.overlay)

    // Add styles if not already present
    this.addStyles()
  }

  private positionHighlight(step: TutorialStep): void {
    if (!step.targetSelector || !this.overlay) return

    const target = document.querySelector(step.targetSelector)
    if (!target) {
      console.warn(`Tutorial: target not found: ${step.targetSelector}`)
      return
    }

    const rect = target.getBoundingClientRect()
    const padding = 8
    const cutout = this.overlay.querySelector('.tutorial-cutout') as HTMLElement

    // Use box-shadow for the cutout effect
    cutout.style.cssText = `
      position: fixed;
      top: ${rect.top - padding}px;
      left: ${rect.left - padding}px;
      width: ${rect.width + padding * 2}px;
      height: ${rect.height + padding * 2}px;
      border-radius: 12px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
      transition: all 0.3s ease;
      pointer-events: none;
    `

    // Position tooltip
    this.positionTooltip(step, rect)
  }

  private positionTooltip(step: TutorialStep, rect: DOMRect): void {
    if (!this.overlay) return

    const tooltip = this.overlay.querySelector('.tutorial-tooltip-box') as HTMLElement
    const position = step.position || 'bottom'

    // Update content
    const titleEl = tooltip.querySelector('.tutorial-tooltip-title')
    const contentEl = tooltip.querySelector('.tutorial-tooltip-content')
    if (titleEl) titleEl.textContent = step.title
    if (contentEl) contentEl.textContent = step.content

    const baseStyle: Record<string, string> = {
      position: 'fixed',
      zIndex: '9999'
    }

    let tooltipStyle: Record<string, string>

    switch (position) {
      case 'top':
        tooltipStyle = {
          ...baseStyle,
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top - 10}px`,
          transform: 'translate(-50%, -100%)'
        }
        break
      case 'left':
        tooltipStyle = {
          ...baseStyle,
          left: `${rect.left - 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translate(-100%, -50%)'
        }
        break
      case 'right':
        tooltipStyle = {
          ...baseStyle,
          left: `${rect.left + rect.width + 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translate(0, -50%)'
        }
        break
      case 'bottom':
      default:
        tooltipStyle = {
          ...baseStyle,
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height + 10}px`,
          transform: 'translate(-50%, 0)'
        }
    }

    Object.assign(tooltip.style, tooltipStyle)
  }

  private addStyles(): void {
    if (document.getElementById('tutorial-highlight-styles')) return

    const style = document.createElement('style')
    style.id = 'tutorial-highlight-styles'
    style.textContent = `
      .tutorial-highlight-overlay {
        position: fixed;
        inset: 0;
        z-index: 9998;
        pointer-events: none;
      }

      .tutorial-cutout {
        position: absolute;
        border-radius: 12px;
        pointer-events: none;
      }

      .tutorial-tooltip-box {
        pointer-events: auto;
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        border: 2px solid #c9a961;
        border-radius: 12px;
        padding: 16px 20px;
        max-width: 280px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }

      .tutorial-tooltip-title {
        font-size: 16px;
        font-weight: bold;
        color: #f5f5dc;
        margin-bottom: 8px;
      }

      .tutorial-tooltip-content {
        font-size: 14px;
        line-height: 1.5;
        color: rgba(245, 245, 220, 0.9);
        margin-bottom: 12px;
      }

      .tutorial-tooltip-actions {
        display: flex;
        justify-content: flex-end;
      }

      .tutorial-skip-btn {
        padding: 6px 14px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tutorial-skip-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .tutorial-progress-dots {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 9999;
      }
    `
    document.head.appendChild(style)
  }
}

export default HighlightHandler
