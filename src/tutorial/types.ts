export type StepType = 'highlight' | 'tooltip' | 'modal'
export type ActionType = 'click' | 'drag' | 'none'
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TutorialStep {
  id: string
  type: StepType
  title: string
  content: string
  targetSelector?: string
  position?: TooltipPosition
  action?: ActionType
  actionTarget?: string
  effect?: () => void
  condition?: () => boolean
  autoAdvanceOn?: string  // event name to auto-advance
}

export interface TutorialContext {
  money: number
  generals: number
  currentPhase: string
}

export type TutorialEvent =
  | { type: 'start' }
  | { type: 'skip' }
  | { type: 'next' }
  | { type: 'action'; action: ActionType; target: string }
  | { type: 'complete' }

export interface StepHandler {
  show(step: TutorialStep): void
  hide(): void
}
