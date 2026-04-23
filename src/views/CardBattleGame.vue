<template>
  <div class="card-battle-game">
    <div v-if="!isLoggedIn" class="login-required">
      <div class="login-modal">
        <h2>游戏开始</h2>
        <p>请先进行注册登录</p>
        <button @click="openAuthModal" class="start-button">登录/注册</button>
      </div>
    </div>

    <div v-else class="game-container">
      <div class="game-header">
        <div class="game-info">
          <div class="info-item">
            <span class="info-label">时间:</span>
            <span class="info-value">{{ currentYear }}年</span>
          </div>
          <div class="info-item">
            <span class="info-label">贝币:</span>
            <span class="info-value">{{ money }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">波次:</span>
            <span class="info-value">{{ currentWave }}/{{ totalWaves }}</span>
          </div>

          <div class="info-item" :class="{ 'command-warning': currentCommand > maxCommand }">
            <span class="info-label">统率:</span>
            <span class="info-value">{{ currentCommand }}/{{ maxCommand }}</span>
          </div>
        </div>
      </div>

      <div class="game-area">
        <div class="player-side">
          <div class="side-label">我方</div>
          <div class="formation horizontal">
            <div class="card-slot" @click="selectSlot('player', '大营')">
              <div v-if="playerFormation.大营" class="card" :class="{ selected: selectedSlot === 'player-大营', dead: playerFormation.大营.isDead }"
                @mouseenter="showTooltip('player-大营')"
                @mouseleave="hideTooltip">
                <div class="card-header">
                  <div class="card-name">{{ playerFormation.大营.name }}</div>
                  <div class="card-level">Lv.{{ playerFormation.大营.level }}</div>
                </div>
                <div class="card-body">
                  <div class="card-position">大营</div>
                  <div class="card-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.ceil(playerFormation.大营.level) }">★</span>
                  </div>
                  <div class="card-stats simple">
                    <span class="troops">{{ playerFormation.大营.troops }}</span>
                    <span class="command">{{ playerFormation.大营.command }}</span>
                    <span class="range">{{ playerFormation.大营.attackRange }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-slot">
                <span>大营</span>
              </div>
            </div>
            <div class="card-slot" @click="selectSlot('player', '中军')">
              <div v-if="playerFormation.中军" class="card" :class="{ selected: selectedSlot === 'player-中军', dead: playerFormation.中军.isDead }"
                @mouseenter="showTooltip('player-中军')"
                @mouseleave="hideTooltip">
                <div class="card-header">
                  <div class="card-name">{{ playerFormation.中军.name }}</div>
                  <div class="card-level">Lv.{{ playerFormation.中军.level }}</div>
                </div>
                <div class="card-body">
                  <div class="card-position">中军</div>
                  <div class="card-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.ceil(playerFormation.中军.level) }">★</span>
                  </div>
                  <div class="card-stats simple">
                    <span class="troops">{{ playerFormation.中军.troops }}</span>
                    <span class="command">{{ playerFormation.中军.command }}</span>
                    <span class="range">{{ playerFormation.中军.attackRange }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-slot">
                <span>中军</span>
              </div>
            </div>
            <div class="card-slot" @click="selectSlot('player', '前锋')">
              <div v-if="playerFormation.前锋" class="card" :class="{ selected: selectedSlot === 'player-前锋', dead: playerFormation.前锋.isDead }"
                @mouseenter="showTooltip('player-前锋')"
                @mouseleave="hideTooltip">
                <div class="card-header">
                  <div class="card-name">{{ playerFormation.前锋.name }}</div>
                  <div class="card-level">Lv.{{ playerFormation.前锋.level }}</div>
                </div>
                <div class="card-body">
                  <div class="card-position">前锋</div>
                  <div class="card-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.ceil(playerFormation.前锋.level) }">★</span>
                  </div>
                  <div class="card-stats simple">
                    <span class="troops">{{ playerFormation.前锋.troops }}</span>
                    <span class="command">{{ playerFormation.前锋.command }}</span>
                    <span class="range">{{ playerFormation.前锋.attackRange }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-slot">
                <span>前锋</span>
              </div>
            </div>
          </div>
        </div>

        <div class="battle-report">
          <div class="report-header">
            <h3>战况播报</h3>
          </div>
          <div class="report-content">
            <div v-for="(report, index) in battleReports" :key="index" class="report-item">
              {{ report }}
            </div>
          </div>
        </div>

        <div class="player-side enemy">
          <div class="side-label">敌方</div>
          <div class="formation horizontal enemy">
            <div class="card-slot" @click="selectSlot('enemy', '前锋')">
              <div v-if="enemyFormation.前锋" class="card enemy" :class="{ selected: selectedSlot === 'enemy-前锋', dead: enemyFormation.前锋.isDead }"
                @mouseenter="showTooltip('enemy-前锋')"
                @mouseleave="hideTooltip">
                <div class="card-header">
                  <div class="card-name">{{ enemyFormation.前锋.name }}</div>
                  <div class="card-level">Lv.{{ enemyFormation.前锋.level }}</div>
                </div>
                <div class="card-body">
                  <div class="card-position">前锋</div>
                  <div class="card-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.ceil(enemyFormation.前锋.level) }">★</span>
                  </div>
                  <div class="card-stats simple">
                    <span class="troops">{{ enemyFormation.前锋.troops }}</span>
                    <span class="command">{{ enemyFormation.前锋.command }}</span>
                    <span class="range">{{ enemyFormation.前锋.attackRange }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-slot">
                <span>前锋</span>
              </div>
            </div>
            <div class="card-slot" @click="selectSlot('enemy', '中军')">
              <div v-if="enemyFormation.中军" class="card enemy" :class="{ selected: selectedSlot === 'enemy-中军', dead: enemyFormation.中军.isDead }"
                @mouseenter="showTooltip('enemy-中军')"
                @mouseleave="hideTooltip">
                <div class="card-header">
                  <div class="card-name">{{ enemyFormation.中军.name }}</div>
                  <div class="card-level">Lv.{{ enemyFormation.中军.level }}</div>
                </div>
                <div class="card-body">
                  <div class="card-position">中军</div>
                  <div class="card-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.ceil(enemyFormation.中军.level) }">★</span>
                  </div>
                  <div class="card-stats simple">
                    <span class="troops">{{ enemyFormation.中军.troops }}</span>
                    <span class="command">{{ enemyFormation.中军.command }}</span>
                    <span class="range">{{ enemyFormation.中军.attackRange }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-slot">
                <span>中军</span>
              </div>
            </div>
            <div class="card-slot" @click="selectSlot('enemy', '大营')">
              <div v-if="enemyFormation.大营" class="card enemy" :class="{ selected: selectedSlot === 'enemy-大营', dead: enemyFormation.大营.isDead }"
                @mouseenter="showTooltip('enemy-大营')"
                @mouseleave="hideTooltip">
                <div class="card-header">
                  <div class="card-name">{{ enemyFormation.大营.name }}</div>
                  <div class="card-level">Lv.{{ enemyFormation.大营.level }}</div>
                </div>
                <div class="card-body">
                  <div class="card-position">大营</div>
                  <div class="card-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.ceil(enemyFormation.大营.level) }">★</span>
                  </div>
                  <div class="card-stats simple">
                    <span class="troops">{{ enemyFormation.大营.troops }}</span>
                    <span class="command">{{ enemyFormation.大营.command }}</span>
                    <span class="range">{{ enemyFormation.大营.attackRange }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-slot">
                <span>大营</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showGeneralList" class="general-list-overlay" @click="closeGeneralList">
        <div class="general-list" @click.stop>
          <div class="list-header">
            <h3>选择武将</h3>
            <button class="close-btn" @click="closeGeneralList">×</button>
          </div>
          <div class="general-items">
            <div
              v-for="general in availableGenerals"
              :key="general.id"
              class="general-item"
              @click="deployGeneral(general)"
              @mouseenter="showGeneralTooltip(general)"
              @mouseleave="hideTooltip"
            >
              <div class="general-card">
                <div class="general-card-header">
                  <div class="general-card-name">{{ general.name }}</div>
                  <div class="general-card-level">Lv.{{ general.level }}</div>
                </div>
                <div class="general-card-body">
                  <div class="general-card-stars">
                    <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.ceil(general.level) }">★</span>
                  </div>
                  <div class="general-card-stats simple">
                    <span class="troops">{{ general.troops }}</span>
                    <span class="command">{{ general.command }}</span>
                    <span class="range">{{ general.attackRange }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tooltipData" class="tooltip-overlay">
        <div class="tooltip-content">
          <div class="tooltip-header">
            <div class="tooltip-name">{{ tooltipData.name }}</div>
            <div class="tooltip-level">Lv.{{ tooltipData.level }}</div>
          </div>
          <div class="tooltip-stats">
            <div class="tooltip-stat-row">
              <span>攻击: {{ tooltipData.attack }}</span>
              <span>防御: {{ tooltipData.defense }}</span>
            </div>
            <div class="tooltip-stat-row">
              <span>策略: {{ tooltipData.strategy }}</span>
              <span>速度: {{ tooltipData.speed }}</span>
            </div>
            <div class="tooltip-stat-row">
              <span>兵力: {{ tooltipData.troops }}</span>
              <span>攻击距离: {{ tooltipData.attackRange }}</span>
            </div>
            <div class="tooltip-stat-row">
              <span>攻城: {{ tooltipData.siege }}</span>
            </div>
            <div class="tooltip-stat-row command">
              <span>统率: {{ tooltipData.command }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="game-footer">
        <button class="action-button recruit" @click="recruitCard" :disabled="money < recruitCost">
          <span class="button-icon">📦</span>
          <span class="button-text">卡包招募</span>
          <span class="button-cost">{{ recruitCost }}贝币</span>
        </button>
        <button class="action-button end-turn" @click="endTurn">
          <span class="button-text">开始</span>
        </button>
        <button class="action-button next-wave" @click="nextWave">
          <span class="button-text">下一轮</span>
        </button>
      </div>
    </div>

    <AuthModal
      v-if="showAuthModal"
      :is-login="isLogin"
      @close="showAuthModal = false"
      @login="handleLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AuthModal from '../components/AuthModal.vue'

const isLoggedIn = ref(false)
const showAuthModal = ref(false)
const isLogin = ref(true)

// 游戏初始数据
const initialGameData = {
  money: 1000,
  currentYear: -2070,
  currentWave: 1
}

const money = ref(initialGameData.money)
const currentYear = ref(initialGameData.currentYear)
const currentWave = ref(initialGameData.currentWave)
const totalWaves = ref(300)
const currentTurn = ref(0)
const maxTurns = ref(8)
const recruitCost = ref(100)
const maxCommand = ref(8)
const currentCommand = ref(0)

const playerFormation = ref({
  大营: null as General | null,
  中军: null as General | null,
  前锋: null as General | null
})

const enemyFormation = ref({
  大营: null as General | null,
  中军: null as General | null,
  前锋: null as General | null
})

const generals = ref<General[]>([])
const selectedSlot = ref<string | null>(null)
const showGeneralList = ref(false)
const battleReports = ref<string[]>([])

interface General {
  id: number
  name: string
  attack: number
  defense: number
  strategy: number
  speed: number
  attackRange: number
  siege: number
  troops: number
  maxTroops: number
  level: number
  command: number
  isDead: boolean
}

const xiaDynastyGenerals = [
  '大禹', '启', '太康', '仲康', '相', '少康', '予', '槐', '芒', '泄',
  '不降', '扃', '廑', '孔甲', '皋', '发', '癸', '羿', '寒浞'
]

const availableGenerals = computed(() => {
  return generals.value.filter(g => {
    return !Object.values(playerFormation.value).some(p => p?.id === g.id)
  })
})

const updateCurrentCommand = () => {
  let total = 0
  Object.values(playerFormation.value).forEach(g => {
    if (g) total += g.command
  })
  currentCommand.value = total
}

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    isLoggedIn.value = true
  }
  generateEnemyTeam()
})

const openAuthModal = () => {
  isLogin.value = true
  showAuthModal.value = true
}

const handleLogin = (loginData: any) => {
  isLoggedIn.value = true
  showAuthModal.value = false
  addReport('欢迎来到夏朝！开始你的征程吧！')
}

const selectSlot = (side: 'player' | 'enemy', position: string) => {
  if (side === 'player') {
    selectedSlot.value = `${side}-${position}`
    showGeneralList.value = true
  }
}

const tooltipData = ref<General | null>(null)

const showTooltip = (slotKey: string) => {
  const [side, position] = slotKey.split('-')
  const formation = side === 'player' ? playerFormation.value : enemyFormation.value
  const general = formation[position as keyof typeof formation]
  if (general) {
    tooltipData.value = general
  }
}

const hideTooltip = () => {
  tooltipData.value = null
}

const showGeneralTooltip = (general: General) => {
  tooltipData.value = general
}

const closeGeneralList = () => {
  showGeneralList.value = false
  selectedSlot.value = null
}

const deployGeneral = (general: General) => {
  if (selectedSlot.value) {
    const [, position] = selectedSlot.value.split('-')
    const oldGeneral = playerFormation.value[position as keyof typeof playerFormation.value]
    const oldCommand = oldGeneral ? oldGeneral.command : 0
    const newTotalCommand = currentCommand.value - oldCommand + general.command
    
    if (newTotalCommand > maxCommand.value) {
      addReport(`统率不足！当前统率: ${currentCommand.value}/${maxCommand.value}，需要: ${newTotalCommand}`)
      return
    }
    
    playerFormation.value[position as keyof typeof playerFormation.value] = general
    updateCurrentCommand()
    addReport(`【${general.name}】已上阵至【${position}】！统率: ${currentCommand.value}/${maxCommand.value}`)
    closeGeneralList()
  }
}

const generateEnemyTeam = () => {
  const positions: (keyof typeof enemyFormation.value)[] = ['大营', '中军', '前锋']
  positions.forEach(position => {
    const level = Math.floor(Math.random() * 5) + 1
    const commandValues = [2, 2.5, 3, 3.5]
    const command = commandValues[Math.floor(Math.random() * commandValues.length)]
    const generalName = xiaDynastyGenerals[Math.floor(Math.random() * xiaDynastyGenerals.length)]
    const troops = level * 100
    enemyFormation.value[position] = {
      id: Date.now() + Math.random(),
      name: generalName,
      attack: Math.floor(Math.random() * 100) + 50,
      defense: Math.floor(Math.random() * 100) + 50,
      strategy: Math.floor(Math.random() * 100) + 50,
      speed: Math.floor(Math.random() * 100) + 50,
      attackRange: Math.floor(Math.random() * 3) + 1,
      siege: Math.floor(Math.random() * 100) + 50,
      troops: troops,
      maxTroops: troops,
      level: level,
      command: command,
      isDead: false,
      dynasty: '夏朝'
    }
  })
  addReport('敌方队伍已集结完毕！')
}

const recruitCard = () => {
  if (money.value < recruitCost.value) {
    addReport('贝币不足，无法招募！')
    return
  }

  money.value -= recruitCost.value

  const level = Math.floor(Math.random() * 5) + 1
  const commandValues = [2, 2.5, 3, 3.5]
  const command = commandValues[Math.floor(Math.random() * commandValues.length)]
  const troops = level * 100
  const newGeneral: General = {
    id: Date.now(),
    name: xiaDynastyGenerals[Math.floor(Math.random() * xiaDynastyGenerals.length)],
    attack: Math.floor(Math.random() * 100) + 50,
    defense: Math.floor(Math.random() * 100) + 50,
    strategy: Math.floor(Math.random() * 100) + 50,
    speed: Math.floor(Math.random() * 100) + 50,
    attackRange: Math.floor(Math.random() * 3) + 1,
    siege: Math.floor(Math.random() * 100) + 50,
    troops: troops,
    maxTroops: troops,
    level: level,
    command: command,
    isDead: false,
    dynasty: '夏朝'
  }

  generals.value.push(newGeneral)
  addReport(`恭喜获得【${newGeneral.name}】！等级:${newGeneral.level} 攻:${newGeneral.attack} 防:${newGeneral.defense} 策:${newGeneral.strategy} 速:${newGeneral.speed} 兵:${newGeneral.troops} 距:${newGeneral.attackRange} 统率:${newGeneral.command}`)
}

const endTurn = () => {
  const hasEmptySlot = Object.values(playerFormation.value).some(slot => slot === null)
  if (hasEmptySlot) {
    addReport('请先将武将上阵！')
    return
  }

  // 连续执行8个回合
  for (let i = 1; i <= maxTurns.value; i++) {
    currentTurn.value = i
    addReport(`第 ${i} 回合开始！`)
    
    calculateBattle()
    
    // 检查是否有一方大营阵亡
    if (checkGameOver()) {
      return
    }
    
    // 如果不是最后一回合，添加回合结束播报
    if (i < maxTurns.value) {
      addReport(`第 ${i} 回合结束！`)
    }
  }
  
  // 8回合结束后
  addReport('8回合结束！')
  checkGameOverByTurns()
}

const calculateBattle = () => {
  const allGenerals: Array<{ general: General, side: 'player' | 'enemy', position: string }> = []

  if (playerFormation.value.前锋 && !playerFormation.value.前锋.isDead) {
    allGenerals.push({ general: playerFormation.value.前锋, side: 'player', position: '前锋' })
  }
  if (playerFormation.value.中军 && !playerFormation.value.中军.isDead) {
    allGenerals.push({ general: playerFormation.value.中军, side: 'player', position: '中军' })
  }
  if (playerFormation.value.大营 && !playerFormation.value.大营.isDead) {
    allGenerals.push({ general: playerFormation.value.大营, side: 'player', position: '大营' })
  }

  if (enemyFormation.value.前锋 && !enemyFormation.value.前锋.isDead) {
    allGenerals.push({ general: enemyFormation.value.前锋, side: 'enemy', position: '前锋' })
  }
  if (enemyFormation.value.中军 && !enemyFormation.value.中军.isDead) {
    allGenerals.push({ general: enemyFormation.value.中军, side: 'enemy', position: '中军' })
  }
  if (enemyFormation.value.大营 && !enemyFormation.value.大营.isDead) {
    allGenerals.push({ general: enemyFormation.value.大营, side: 'enemy', position: '大营' })
  }

  allGenerals.sort((a, b) => b.general.speed - a.general.speed)

  for (const attacker of allGenerals) {
    const targets = getTargetsInRange(attacker)
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)]
      performAttack(attacker, target)
    }
  }

  checkDeadGenerals()
  checkGameOver()
}

const getTargetsInRange = (attacker: { general: General, side: 'player' | 'enemy', position: string }) => {
  const targets: Array<{ general: General, side: 'player' | 'enemy', position: string }> = []
  const positionIndex: Record<string, number> = { '前锋': 1, '中军': 2, '大营': 3 }

  const enemyPositions = attacker.side === 'player'
    ? ['前锋', '中军', '大营']
    : ['前锋', '中军', '大营']

  for (const pos of enemyPositions) {
    const enemy = attacker.side === 'player'
      ? enemyFormation.value[pos as keyof typeof enemyFormation.value]
      : playerFormation.value[pos as keyof typeof playerFormation.value]

    if (enemy && !enemy.isDead) {
      const distance = Math.abs(positionIndex[pos] - positionIndex[attacker.position])
      if (distance <= attacker.general.attackRange) {
        targets.push({ general: enemy, side: attacker.side === 'player' ? 'enemy' : 'player', position: pos })
      }
    }
  }

  return targets
}

const performAttack = (attacker: { general: General, side: 'player' | 'enemy', position: string }, target: { general: General, side: 'player' | 'enemy', position: string }) => {
  const damage = Math.max(0, attacker.general.attack - target.general.defense / 2)
  const oldTroops = target.general.troops
  target.general.troops = Math.max(0, target.general.troops - Math.floor(damage))

  const attackerPrefix = attacker.side === 'player' ? '我方' : '敌方'
  const targetPrefix = target.side === 'player' ? '我方' : '敌方'
  
  addReport(`${attackerPrefix}${attacker.position}【${attacker.general.name}】攻击${targetPrefix}${target.position}【${target.general.name}】，造成${Math.floor(damage)}伤害！`)
  addReport(`${targetPrefix}${target.position}【${target.general.name}】兵力从 ${oldTroops} 降至 ${target.general.troops}`)

  if (target.general.troops <= 0) {
    target.general.isDead = true
    addReport(`${targetPrefix}${target.position}【${target.general.name}】阵亡！`)
  }
}

const checkDeadGenerals = () => {
  Object.keys(playerFormation.value).forEach(key => {
    const general = playerFormation.value[key as keyof typeof playerFormation.value]
    if (general && general.troops <= 0) {
      general.isDead = true
    }
  })

  Object.keys(enemyFormation.value).forEach(key => {
    const general = enemyFormation.value[key as keyof typeof enemyFormation.value]
    if (general && general.troops <= 0) {
      general.isDead = true
    }
  })
}

const checkGameOver = () => {
  if (enemyFormation.value.大营 && enemyFormation.value.大营.isDead) {
    // 胜利结算
    const reward = currentWave.value * 10
    money.value += reward
    addReport(`恭喜！你击败了敌方大营，获得胜利！`)
    addReport(`获得奖励：${reward} 贝币！`)
    setTimeout(() => {
      alert(`恭喜通关！获得 ${reward} 贝币奖励！`)
    }, 1000)
    return true
  }

  if (playerFormation.value.大营 && playerFormation.value.大营.isDead) {
    // 失败重置
    addReport('我方大营阵亡，战斗失败！')
    setTimeout(() => {
      alert('战斗失败！恢复游戏初始数据！')
      // 恢复游戏开始时的数据
      money.value = initialGameData.money
      currentYear.value = initialGameData.currentYear
      currentWave.value = initialGameData.currentWave
      currentTurn.value = 0
      currentCommand.value = 0
      generals.value = []
      playerFormation.value = {
        大营: null,
        中军: null,
        前锋: null
      }
      enemyFormation.value = {
        大营: null,
        中军: null,
        前锋: null
      }
      battleReports.value = []
    }, 1000)
    return true
  }

  return false
}

const checkGameOverByTurns = () => {
  let playerTroops = 0
  let enemyTroops = 0
  
  Object.values(playerFormation.value).forEach(general => {
    if (general && !general.isDead) {
      playerTroops += general.troops
    }
  })
  
  Object.values(enemyFormation.value).forEach(general => {
    if (general && !general.isDead) {
      enemyTroops += general.troops
    }
  })
  
  if (playerTroops > enemyTroops) {
    // 胜利结算
    const reward = currentWave.value * 10
    money.value += reward
    addReport('回合结束！我方兵力占优，获得胜利！')
    addReport(`获得奖励：${reward} 贝币！`)
    setTimeout(() => {
      alert(`恭喜胜利！获得 ${reward} 贝币奖励！`)
    }, 1000)
  } else if (enemyTroops > playerTroops) {
    // 失败重置
    addReport('回合结束！敌方兵力占优，战斗失败！')
    setTimeout(() => {
      alert('战斗失败！恢复游戏初始数据！')
      // 恢复游戏开始时的数据
      money.value = initialGameData.money
      currentYear.value = initialGameData.currentYear
      currentWave.value = initialGameData.currentWave
      currentTurn.value = 0
      currentCommand.value = 0
      generals.value = []
      playerFormation.value = {
        大营: null,
        中军: null,
        前锋: null
      }
      enemyFormation.value = {
        大营: null,
        中军: null,
        前锋: null
      }
      battleReports.value = []
    }, 1000)
  } else {
    addReport('回合结束！双方兵力相当，平局！')
    setTimeout(() => {
      alert('平局！')
    }, 1000)
  }
}

const advanceTime = () => {
  currentYear.value += 10
  currentWave.value += 1

  if (currentYear.value > -1600) {
    addReport('恭喜通关夏朝！')
    resetGame()
  }
}

const addReport = (message: string) => {
  battleReports.value.unshift(message)
  if (battleReports.value.length > 10) {
    battleReports.value.pop()
  }
}

const resetGame = () => {
  // 恢复游戏开始时的数据
  money.value = initialGameData.money
  currentYear.value = initialGameData.currentYear
  currentWave.value = initialGameData.currentWave
  currentTurn.value = 0
  currentCommand.value = 0
  generals.value = []
  playerFormation.value = {
    大营: null,
    中军: null,
    前锋: null
  }
  enemyFormation.value = {
    大营: null,
    中军: null,
    前锋: null
  }
  battleReports.value = []
}

const nextWave = () => {
  currentWave.value++
  currentTurn.value = 0
  advanceTime()
  generateEnemyTeam()
  addReport(`第 ${currentWave.value} 波敌人出现！`)
}
</script>

<style scoped>
.card-battle-game {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
}

.login-required {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-modal {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-modal h2 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.login-modal p {
  font-size: 18px;
  color: #7f8c8d;
  margin-bottom: 30px;
}

.start-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.game-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.game-header {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.game-info {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.info-value {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.command-warning .info-value {
  color: #e74c3c;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.game-area {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 30px;
  min-height: 300px;
}

.player-side {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.side-label {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.formation.horizontal {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.card-slot {
  width: 130px;
  height: 180px;
  border: 3px dashed #e0e0e0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}



.card-slot:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.empty-slot {
  color: #7f8c8d;
  font-size: 14px;
  text-align: center;
}

.card {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ffd700, #ff9800);
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.card.selected {
  border: 3px solid #ffd700;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
}

.card.dead {
  opacity: 0.5;
  filter: grayscale(80%);
  background: #666 !important;
}

.card.dead::before {
  background: #999;
}

.card.enemy {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.card.enemy::before {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-name {
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.card-level {
  font-size: 12px;
  color: #ffd700;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-position {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.card-stars {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.star {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 2px;
  transition: all 0.3s ease;
}

.star.active {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

.card-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.stat-row.command {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  font-weight: bold;
}

.stat-row span {
  flex: 1;
  text-align: center;
}

.stat-row span:first-child {
  text-align: left;
}

.stat-row span:last-child {
  text-align: right;
}

.card-stats.simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  gap: 8px;
  flex-wrap: nowrap;
  min-width: 0;
}

.card-stats.simple .troops {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-stats.simple .troops::after {
  content: '兵';
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(255, 255, 255, 0.8);
}

.card-stats.simple .command {
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-stats.simple .command::after {
  content: '统';
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(76, 175, 80, 0.8);
}

.card-stats.simple .range {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-stats.simple .range::after {
  content: '距';
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(255, 215, 0, 0.8);
}

.tooltip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-content {
  pointer-events: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  min-width: 280px;
  max-width: 320px;
  animation: tooltipFadeIn 0.3s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.tooltip-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.tooltip-level {
  font-size: 14px;
  color: #ffd700;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 10px;
}

.tooltip-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tooltip-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
}

.tooltip-stat-row.command {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  font-weight: bold;
}

.tooltip-stat-row span {
  flex: 1;
  text-align: center;
}

.tooltip-stat-row span:first-child {
  text-align: left;
}

.tooltip-stat-row span:last-child {
  text-align: right;
}

.battle-report {
  width: 300px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.report-header {
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 2px solid #667eea;
  margin-bottom: 15px;
}

.report-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.report-content {
  flex: 1;
  overflow-y: auto;
  max-height: 200px;
}

.report-item {
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
  border-left: 3px solid #667eea;
}

.general-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.general-list {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.list-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.general-items {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.general-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.general-item:hover {
  transform: translateY(-2px);
}

.general-card {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.general-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ffd700, #ff9800);
}

.general-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.general-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.general-card-name {
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.general-card-level {
  font-size: 12px;
  color: #ffd700;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
}

.general-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.general-card-stars {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.general-card-stats.simple {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  gap: 10px;
}

.general-card-stats.simple .troops {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.general-card-stats.simple .troops::after {
  content: '兵';
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(255, 255, 255, 0.8);
}

.general-card-stats.simple .command {
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.general-card-stats.simple .command::after {
  content: '统';
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(76, 175, 80, 0.8);
}

.general-card-stats.simple .range {
  font-size: 20px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.general-card-stats.simple .range::after {
  content: '距';
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(255, 215, 0, 0.8);
}

.game-footer {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.action-button {
  flex: 1;
  padding: 20px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.action-button.recruit {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
}

.action-button.recruit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
}

.action-button.recruit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.end-turn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
}

.action-button.end-turn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.action-button.next-wave {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.action-button.next-wave:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.button-icon {
  font-size: 32px;
}

.button-text {
  font-weight: bold;
}

.button-cost {
  font-size: 14px;
  opacity: 0.9;
}

@media (max-width: 894px) {
  .game-area {
    flex-direction: column;
    gap: 20px;
  }

  .battle-report {
    width: 100%;
    order: -1;
  }

  .player-side {
    width: 100%;
  }

  .formation.horizontal {
    flex-wrap: wrap;
  }

  .card-slot {
    width: 90px;
    height: 130px;
  }

  .card-slot.large {
    width: 110px;
    height: 150px;
  }

  .game-footer {
    flex-direction: column;
  }

  .action-button {
    padding: 15px;
  }
}
</style>
