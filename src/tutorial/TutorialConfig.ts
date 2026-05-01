import type { TutorialStep } from './types'

// 第一阶段教程：遗物选择、地图导航、武将招募
export const TUTORIAL_CONFIG: TutorialStep[] = [
  {
    id: 'welcome',
    type: 'modal',
    title: '欢迎来到游戏',
    content: '你的目标是带领军队通关300波次，击败所有敌人！点击"下一步"开始教程。',
    action: 'none'
  },
  {
    id: 'select-initial-relic',
    type: 'highlight',
    title: '选择初始遗物',
    content: '请从三个遗物中选择一个作为开局奖励！这将影响你的战斗策略。',
    targetSelector: '.relic-selector-panel',
    position: 'bottom',
    action: 'none',
    autoAdvanceOn: 'relic-selected'
  },
  {
    id: 'show-map',
    type: 'highlight',
    title: '进入战斗',
    content: '点击红色边框的战斗节点开始战斗！系统赠送1000金币作为新手奖励！',
    targetSelector: '.event-node-btn.type-battle',
    position: 'right',
    action: 'click',
    actionTarget: '.event-node-btn.type-battle'
  },
  {
    id: 'recruit-intro',
    type: 'highlight',
    title: '武将招募',
    content: '上阵武将需要先招募！这是招募按钮。',
    targetSelector: '.action-button.recruit',
    position: 'right',
    action: 'click',
    actionTarget: '.action-button.recruit',
    autoAdvanceOn: 'recruit-panel-opened'
  },
  {
    id: 'ten-recruit',
    type: 'highlight',
    title: '十连招募',
    content: '点击十连按钮进行十连招募！',
    targetSelector: '.mode-card.ten',
    position: 'right',
    action: 'click',
    actionTarget: '.mode-card.ten'
  }
]

// 第二阶段教程：战斗准备（上阵、自动分配、开始战斗）
export const BATTLE_TUTORIAL_CONFIG: TutorialStep[] = [
  {
    id: 'battle-deploy',
    type: 'highlight',
    title: '上阵武将',
    content: '点击大营位置，将武将放到这里。',
    targetSelector: '.player-side .card-slot:first-child',
    position: 'right',
    action: 'click',
    actionTarget: '.player-side .card-slot:first-child',
    autoAdvanceOn: 'general-deployed'
  },
  {
    id: 'battle-auto-allocate',
    type: 'highlight',
    title: '分配兵力',
    content: '点击自动分配，为武将分配征召兵。',
    targetSelector: '.relic-auto-btn',
    position: 'top',
    action: 'click'
  },
  {
    id: 'battle-start',
    type: 'highlight',
    title: '开始战斗',
    content: '一切准备就绪！点击开始战斗！',
    targetSelector: '.action-button.end-turn',
    position: 'top',
    action: 'click'
  }
]

export default TUTORIAL_CONFIG
