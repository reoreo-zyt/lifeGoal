const STORAGE_KEY_PREFIX = 'lifeGoal_tutorial_'
const EXPIRY_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface TutorialProgress {
  currentStepId: string
  timestamp: number
}

export class ProgressManager {
  static saveProgress(stepId: string): void {
    const progress: TutorialProgress = {
      currentStepId: stepId,
      timestamp: Date.now()
    }
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}progress`,
      JSON.stringify(progress)
    )
  }

  static loadProgress(): TutorialProgress | null {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}progress`)
    if (!saved) return null

    try {
      const progress: TutorialProgress = JSON.parse(saved)
      // Check if expired
      if (Date.now() - progress.timestamp > EXPIRY_DURATION) {
        this.clearProgress()
        return null
      }
      return progress
    } catch {
      return null
    }
  }

  static clearProgress(): void {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}progress`)
  }

  static isCompleted(): boolean {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}completed`) === 'true'
  }

  static markCompleted(): void {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}completed`, 'true')
    this.clearProgress()
  }

  static startSession(firstStepId: string): void {
    const progress: TutorialProgress = {
      currentStepId: firstStepId,
      timestamp: Date.now()
    }
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}progress`,
      JSON.stringify(progress)
    )
  }

  static reset(): void {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}progress`)
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}completed`)
  }
}

export default ProgressManager
