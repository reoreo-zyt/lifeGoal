export { TutorialEngine, getTutorialEngine, tutorialEventBus } from './TutorialEngine'
export { TUTORIAL_CONFIG, BATTLE_TUTORIAL_CONFIG } from './TutorialConfig'
export { ProgressManager } from './ProgressManager'
export type { TutorialStep, StepType, ActionType, TooltipPosition, TutorialContext, TutorialEvent } from './types'
export { HighlightHandler } from './handlers/HighlightHandler'
export { TooltipHandler } from './handlers/TooltipHandler'
export { ModalHandler } from './handlers/ModalHandler'

import { getTutorialEngine } from './TutorialEngine'
import { ProgressManager } from './ProgressManager'

export function useTutorial() {
  const engine = getTutorialEngine()

  return {
    start: () => engine.start(),
    skip: () => engine.skip(),
    isActive: () => engine.isTutorialActive(),
    getCurrentStep: () => engine.getCurrentStep(),
    getCurrentStepIndex: () => engine.getCurrentStepIndex(),
    getTotalSteps: () => engine.getTotalSteps(),
    isCompleted: () => ProgressManager.isCompleted(),
    reset: () => ProgressManager.reset(),
    hideCurrentStep: () => engine.hideCurrentStep(),
    proceedToNextStep: () => engine.proceedToNextStep(),
    isInBattlePhase: () => engine.isInBattlePhase(),
    startBattlePhase: () => engine.startBattlePhase(),
    engine
  }
}

export default useTutorial
