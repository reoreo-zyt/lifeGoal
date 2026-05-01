import type { TutorialStep, StepHandler } from '../types'

export class ModalHandler implements StepHandler {
  private modal: HTMLElement | null = null

  show(step: TutorialStep): void {
    this.createModal(step)
  }

  hide(): void {
    if (this.modal) {
      this.modal.remove()
      this.modal = null
    }
  }

  private createModal(step: TutorialStep): void {
    this.modal = document.createElement('div')
    this.modal.className = 'tutorial-modal-overlay'
    this.modal.innerHTML = `
      <div class="tutorial-modal-box">
        <h2 class="tutorial-modal-title">${step.title}</h2>
        <p class="tutorial-modal-content">${step.content}</p>
        <div class="tutorial-modal-actions">
          <button class="tutorial-modal-skip">跳过教程</button>
          <button class="tutorial-modal-next">下一步</button>
        </div>
      </div>
    `

    document.body.appendChild(this.modal)
    this.addStyles()
  }

  private addStyles(): void {
    if (document.getElementById('tutorial-modal-styles')) return

    const style = document.createElement('style')
    style.id = 'tutorial-modal-styles'
    style.textContent = `
      .tutorial-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .tutorial-modal-box {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        border: 2px solid #c9a961;
        border-radius: 16px;
        padding: 30px 40px;
        max-width: 420px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      }

      .tutorial-modal-title {
        color: #f5f5dc;
        font-size: 24px;
        margin-bottom: 16px;
      }

      .tutorial-modal-content {
        color: rgba(245, 245, 220, 0.85);
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 24px;
      }

      .tutorial-modal-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
      }

      .tutorial-modal-skip {
        padding: 10px 24px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 15px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tutorial-modal-skip:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .tutorial-modal-next {
        padding: 10px 28px;
        background: linear-gradient(135deg, #c9a961 0%, #e0b870 100%);
        border: none;
        border-radius: 8px;
        color: #2c3e50;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tutorial-modal-next:hover {
        background: linear-gradient(135deg, #d4b06a 0%, #e8c880 100%);
        transform: translateY(-1px);
      }
    `
    document.head.appendChild(style)
  }
}

export default ModalHandler
