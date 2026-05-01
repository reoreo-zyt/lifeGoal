import type { TutorialStep, StepHandler } from '../types'

export class TooltipHandler implements StepHandler {
  private tooltip: HTMLElement | null = null

  show(step: TutorialStep): void {
    this.createTooltip(step)
  }

  hide(): void {
    if (this.tooltip) {
      this.tooltip.remove()
      this.tooltip = null
    }
  }

  private createTooltip(step: TutorialStep): void {
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'tutorial-tooltip-handler'
    this.tooltip.innerHTML = `
      <div class="tutorial-balloon">
        <div class="tutorial-balloon-title">${step.title}</div>
        <div class="tutorial-balloon-content">${step.content}</div>
      </div>
    `

    document.body.appendChild(this.tooltip)
    this.addStyles()

    // Center the tooltip initially
    if (this.tooltip) {
      this.tooltip.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
      `
    }
  }

  private addStyles(): void {
    if (document.getElementById('tutorial-tooltip-styles')) return

    const style = document.createElement('style')
    style.id = 'tutorial-tooltip-styles'
    style.textContent = `
      .tutorial-tooltip-handler {
        pointer-events: auto;
      }

      .tutorial-balloon {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        border: 2px solid #c9a961;
        border-radius: 12px;
        padding: 16px 20px;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }

      .tutorial-balloon-title {
        font-size: 16px;
        font-weight: bold;
        color: #f5f5dc;
        margin-bottom: 8px;
      }

      .tutorial-balloon-content {
        font-size: 14px;
        line-height: 1.5;
        color: rgba(245, 245, 220, 0.9);
      }
    `
    document.head.appendChild(style)
  }
}

export default TooltipHandler
