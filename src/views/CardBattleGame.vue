<template>
  <div class="card-battle-game">
    <!-- 没登录的时候会弹出提示框需要进行登录 -->
    <div v-if="!isLoggedIn" class="login-required">
      <div class="login-modal">
        <h2>游戏开始</h2>
        <p>请先进行注册登录</p>
        <button @click="openAuthModal" class="start-button">登录/注册</button>
      </div>
    </div>

    <!-- 游戏开始界面 -->
    <div v-else-if="!gameLoaded" class="game-start-screen">
      <div class="game-start-bg" style="background-image: url('/assets/game_cover_bg_1920x1080.jpg');"></div>
      <div class="game-start-content">
        <h1 class="game-title">史策 rogue</h1>
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
        </div>
        <div class="progress-text">{{ loadingProgress }}%</div>
      </div>
    </div>

    <!-- 登录后游戏主界面 -->
    <div v-else class="game-container">
      <div class="game-header">
        <!-- 游戏顶部信息 -->
        <!-- 顶部状态栏 -->
        <div class="ui-top-bar-status">
          <div class="game-info">
            <div class="info-item" @mouseenter="showHeaderTooltip($event, 'money')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/money.webp" alt="金额" class="info-icon">
              <span class="info-value">{{ money }}</span>
            </div>
            <div class="info-item" @mouseenter="showHeaderTooltip($event, 'wave')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/turn.webp" alt="波次" class="info-icon">
              <span class="info-value">{{ currentWave }}/{{ totalWaves }}</span>
            </div>
            <div class="info-item" :class="{ 'command-warning': currentCommand > maxCommand }"
              @mouseenter="showHeaderTooltip($event, 'command')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/command.webp" alt="统率" class="info-icon">
              <span class="info-value">{{ currentCommand }}/{{ maxCommand }}</span>
            </div>
          </div>
        </div>

        <!-- 悬浮提示框 -->
        <div v-show="tooltip.visible" class="tooltip-popup" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
          {{ tooltip.text }}
        </div>

        <div class="game-area">
          <div v-for="(damageText, index) in damageTexts" :key="index" class="damage-text" :style="{
            left: damageText.x + 'px',
            top: damageText.y + 'px',
            animationDelay: damageText.delay + 's',
          }">
            {{ damageText.text }}
          </div>
          <div class="player-side">
            <div class="side-label">我方</div>
            <div class="formation horizontal">
              <div class="card-slot" @click="selectSlot('player', '大营')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && playerFormation.大营 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{
                        width: playerFormation.大营
                          ? (playerFormation.大营.troops /
                            playerFormation.大营.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                    </div>
                    <div class="troops-text">
                      {{
                        playerFormation.大营 ? playerFormation.大营.troops : 0
                      }}
                    </div>
                  </div>
                  <div v-if="playerFormation.大营" class="card player" :style="{
                    backgroundImage: `url(${playerFormation.大营.avatar ? API_BASE_URL + playerFormation.大营.avatar : playerFormation.大营.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
                  }" :class="{
                    selected: selectedSlot === 'player-大营',
                    dead: playerFormation.大营.isDead,
                    attacking: attackingCard === 'player-大营',
                  }" data-card-side="player" data-card-position="大营" @contextmenu="showTooltip('player-大营', $event)"
                    @click="hideTooltip">
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">
                          {{ playerFormation.大营.dynasty }}
                        </div>
                        <div class="card-name">
                          {{ playerFormation.大营.name }}
                        </div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars">
                          <span v-for="i in 5" :key="i" class="star" :class="{
                            active:
                              i <= Math.ceil(playerFormation.大营.level),
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <div class="card-status">
                      <div v-if="playerFormation.大营.skillEffects && playerFormation.大营.skillEffects.damageReduction > 0"
                        class="status-icon"
                        :title="`${playerFormation.大营.skillEffects.damageReductionSource || '未知来源'}：物理伤害减免 ${(playerFormation.大营.skillEffects.damageReduction * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">减伤</span>
                      </div>
                      <div v-if="playerFormation.大营.skillEffects && playerFormation.大营.skillEffects.attributeBonus > 0"
                        class="status-icon"
                        :title="`${playerFormation.大营.skillEffects.attributeBonusSource || '未知来源'}：全属性提升 ${(playerFormation.大营.skillEffects.attributeBonus * 8).toFixed(0)}%`">
                        <span class="status-icon-inner">属性+</span>
                      </div>
                      <div v-if="playerFormation.大营.skillEffects && playerFormation.大营.skillEffects.damageIncrease > 0"
                        class="status-icon"
                        :title="`${playerFormation.大营.skillEffects.damageIncreaseSource || '未知来源'}：增伤 ${(playerFormation.大营.skillEffects.damageIncrease * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">增伤</span>
                      </div>
                      <div
                        v-if="playerFormation.大营.skillEffects && playerFormation.大营.skillEffects.damageOutputReduction > 0"
                        class="status-icon debuff"
                        :title="`${playerFormation.大营.skillEffects.damageOutputReductionSource || '未知来源'}：伤害输出降低 ${(playerFormation.大营.skillEffects.damageOutputReduction * 100).toFixed(0)}%，持续${playerFormation.大营.skillEffects.damageOutputReductionDuration}回合`">
                        <span class="status-icon-inner">降攻{{
                          playerFormation.大营.skillEffects.damageOutputReductionDuration }}</span>
                      </div>
                      <div
                        v-if="playerFormation.大营.skillEffects && playerFormation.大营.skillEffects.skillTriggerReduction > 0"
                        class="status-icon debuff"
                        :title="`${playerFormation.大营.skillEffects.skillTriggerReductionSource || '未知来源'}：战法发动概率降低 ${(playerFormation.大营.skillEffects.skillTriggerReduction * 100).toFixed(0)}%，持续${playerFormation.大营.skillEffects.skillTriggerReductionDuration}回合`">
                        <span class="status-icon-inner">降率{{
                          playerFormation.大营.skillEffects.skillTriggerReductionDuration }}</span>
                      </div>
                    </div>
                    <div class="card-middle"></div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ playerFormation.大营.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{
                          playerFormation.大营.leadership
                        }}</span>
                        <span class="card-bottom-label">统率</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{
                          playerFormation.大营.soldierType
                        }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{
                          playerFormation.大营.attackRange
                        }}</span>
                        <span class="card-bottom-label">距</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-slot">
                    <span>大营</span>
                  </div>
                </div>
              </div>
              <div class="card-slot" @click="selectSlot('player', '中军')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && playerFormation.中军 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{
                        width: playerFormation.中军
                          ? (playerFormation.中军.troops /
                            playerFormation.中军.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                    </div>
                    <div class="troops-text">
                      {{
                        playerFormation.中军 ? playerFormation.中军.troops : 0
                      }}
                    </div>
                  </div>
                  <div v-if="playerFormation.中军" class="card player" :style="{
                    backgroundImage: `url(${playerFormation.中军.avatar ? API_BASE_URL + playerFormation.中军.avatar : playerFormation.中军.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
                  }" :class="{
                    selected: selectedSlot === 'player-中军',
                    dead: playerFormation.中军.isDead,
                    attacking: attackingCard === 'player-中军',
                  }" data-card-side="player" data-card-position="中军" @contextmenu="showTooltip('player-中军', $event)"
                    @click="hideTooltip">
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">
                          {{ playerFormation.中军.dynasty }}
                        </div>
                        <div class="card-name">
                          {{ playerFormation.中军.name }}
                        </div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars">
                          <span v-for="i in 5" :key="i" class="star" :class="{
                            active:
                              i <= Math.ceil(playerFormation.中军.level),
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <div class="card-status">
                      <div v-if="playerFormation.中军.skillEffects && playerFormation.中军.skillEffects.damageReduction > 0"
                        class="status-icon"
                        :title="`${playerFormation.中军.skillEffects.damageReductionSource || '未知来源'}：物理伤害减免 ${(playerFormation.中军.skillEffects.damageReduction * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">减伤</span>
                      </div>
                      <div v-if="playerFormation.中军.skillEffects && playerFormation.中军.skillEffects.attributeBonus > 0"
                        class="status-icon"
                        :title="`${playerFormation.中军.skillEffects.attributeBonusSource || '未知来源'}：全属性提升 ${(playerFormation.中军.skillEffects.attributeBonus * 8).toFixed(0)}%`">
                        <span class="status-icon-inner">属性+</span>
                      </div>
                      <div v-if="playerFormation.中军.skillEffects && playerFormation.中军.skillEffects.damageIncrease > 0"
                        class="status-icon"
                        :title="`${playerFormation.中军.skillEffects.damageIncreaseSource || '未知来源'}：增伤 ${(playerFormation.中军.skillEffects.damageIncrease * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">增伤</span>
                      </div>
                      <div
                        v-if="playerFormation.中军.skillEffects && playerFormation.中军.skillEffects.damageOutputReduction > 0"
                        class="status-icon debuff"
                        :title="`${playerFormation.中军.skillEffects.damageOutputReductionSource || '未知来源'}：伤害输出降低 ${(playerFormation.中军.skillEffects.damageOutputReduction * 100).toFixed(0)}%，持续${playerFormation.中军.skillEffects.damageOutputReductionDuration}回合`">
                        <span class="status-icon-inner">降攻{{
                          playerFormation.中军.skillEffects.damageOutputReductionDuration }}</span>
                      </div>
                      <div
                        v-if="playerFormation.中军.skillEffects && playerFormation.中军.skillEffects.skillTriggerReduction > 0"
                        class="status-icon debuff"
                        :title="`${playerFormation.中军.skillEffects.skillTriggerReductionSource || '未知来源'}：战法发动概率降低 ${(playerFormation.中军.skillEffects.skillTriggerReduction * 100).toFixed(0)}%，持续${playerFormation.中军.skillEffects.skillTriggerReductionDuration}回合`">
                        <span class="status-icon-inner">降率{{
                          playerFormation.中军.skillEffects.skillTriggerReductionDuration }}</span>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ playerFormation.中军.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{
                          playerFormation.中军.leadership
                        }}</span>
                        <span class="card-bottom-label">统率</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{
                          playerFormation.中军.soldierType
                        }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{
                          playerFormation.中军.attackRange
                        }}</span>
                        <span class="card-bottom-label">距</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-slot">
                    <span>中军</span>
                  </div>
                </div>
              </div>
              <div class="card-slot" @click="selectSlot('player', '前锋')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && playerFormation.前锋 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{
                        width: playerFormation.前锋
                          ? (playerFormation.前锋.troops /
                            playerFormation.前锋.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                    </div>
                    <div class="troops-text">
                      {{
                        playerFormation.前锋 ? playerFormation.前锋.troops : 0
                      }}
                    </div>
                  </div>
                  <div v-if="playerFormation.前锋" class="card player" :style="{
                    backgroundImage: `url(${playerFormation.前锋.avatar ? API_BASE_URL + playerFormation.前锋.avatar : playerFormation.前锋.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
                  }" :class="{
                    selected: selectedSlot === 'player-前锋',
                    dead: playerFormation.前锋.isDead,
                    attacking: attackingCard === 'player-前锋',
                  }" data-card-side="player" data-card-position="前锋" @contextmenu="showTooltip('player-前锋', $event)"
                    @click="hideTooltip">
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">
                          {{ playerFormation.前锋.dynasty }}
                        </div>
                        <div class="card-name">
                          {{ playerFormation.前锋.name }}
                        </div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars">
                          <span v-for="i in 5" :key="i" class="star" :class="{
                            active:
                              i <= Math.ceil(playerFormation.前锋.level),
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <div class="card-status">
                      <div v-if="playerFormation.前锋.skillEffects && playerFormation.前锋.skillEffects.damageReduction > 0"
                        class="status-icon"
                        :title="`${playerFormation.前锋.skillEffects.damageReductionSource || '未知来源'}：物理伤害减免 ${(playerFormation.前锋.skillEffects.damageReduction * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">减伤</span>
                      </div>
                      <div v-if="playerFormation.前锋.skillEffects && playerFormation.前锋.skillEffects.attributeBonus > 0"
                        class="status-icon"
                        :title="`${playerFormation.前锋.skillEffects.attributeBonusSource || '未知来源'}：全属性提升 ${(playerFormation.前锋.skillEffects.attributeBonus * 8).toFixed(0)}%`">
                        <span class="status-icon-inner">属性+</span>
                      </div>
                      <div v-if="playerFormation.前锋.skillEffects && playerFormation.前锋.skillEffects.damageIncrease > 0"
                        class="status-icon"
                        :title="`${playerFormation.前锋.skillEffects.damageIncreaseSource || '未知来源'}：增伤 ${(playerFormation.前锋.skillEffects.damageIncrease * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">增伤</span>
                      </div>
                      <div
                        v-if="playerFormation.前锋.skillEffects && playerFormation.前锋.skillEffects.damageOutputReduction > 0"
                        class="status-icon debuff"
                        :title="`${playerFormation.前锋.skillEffects.damageOutputReductionSource || '未知来源'}：伤害输出降低 ${(playerFormation.前锋.skillEffects.damageOutputReduction * 100).toFixed(0)}%，持续${playerFormation.前锋.skillEffects.damageOutputReductionDuration}回合`">
                        <span class="status-icon-inner">降攻{{
                          playerFormation.前锋.skillEffects.damageOutputReductionDuration }}</span>
                      </div>
                      <div
                        v-if="playerFormation.前锋.skillEffects && playerFormation.前锋.skillEffects.skillTriggerReduction > 0"
                        class="status-icon debuff"
                        :title="`${playerFormation.前锋.skillEffects.skillTriggerReductionSource || '未知来源'}：战法发动概率降低 ${(playerFormation.前锋.skillEffects.skillTriggerReduction * 100).toFixed(0)}%，持续${playerFormation.前锋.skillEffects.skillTriggerReductionDuration}回合`">
                        <span class="status-icon-inner">降率{{
                          playerFormation.前锋.skillEffects.skillTriggerReductionDuration }}</span>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ playerFormation.前锋.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{
                          playerFormation.前锋.leadership
                        }}</span>
                        <span class="card-bottom-label">统率</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{
                          playerFormation.前锋.soldierType
                        }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{
                          playerFormation.前锋.attackRange
                        }}</span>
                        <span class="card-bottom-label">距</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-slot">
                    <span>前锋</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BattleReport :reports="battleReports" />

          <!-- 战斗场景 -->
          <div class="player-side enemy">
            <div class="side-label">敌方</div>
            <div class="formation horizontal enemy">
              <div class="card-slot" @click="selectSlot('enemy', '前锋')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && enemyFormation.前锋 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{
                        width: enemyFormation.前锋
                          ? (enemyFormation.前锋.troops /
                            enemyFormation.前锋.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                    </div>
                    <div class="troops-text">
                      {{ enemyFormation.前锋 ? enemyFormation.前锋.troops : 0 }}
                    </div>
                  </div>
                  <div v-if="enemyFormation.前锋" class="card enemy" :style="{
                    backgroundImage: `url(${enemyFormation.前锋.avatar ? API_BASE_URL + enemyFormation.前锋.avatar : enemyFormation.前锋.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
                  }" :class="{
                    selected: selectedSlot === 'enemy-前锋',
                    dead: enemyFormation.前锋.isDead,
                    attacking: attackingCard === 'enemy-前锋',
                  }" data-card-side="enemy" data-card-position="前锋" @contextmenu="showTooltip('enemy-前锋', $event)"
                    @click="hideTooltip">
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">
                          {{ enemyFormation.前锋.dynasty }}
                        </div>
                        <div class="card-name">
                          {{ enemyFormation.前锋.name }}
                        </div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars">
                          <span v-for="i in 5" :key="i" class="star" :class="{
                            active:
                              i <= Math.ceil(enemyFormation.前锋.level),
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <div class="card-status">
                      <div v-if="enemyFormation.前锋.skillEffects && enemyFormation.前锋.skillEffects.damageReduction > 0"
                        class="status-icon"
                        :title="`${enemyFormation.前锋.skillEffects.damageReductionSource || '未知来源'}：物理伤害减免 ${(enemyFormation.前锋.skillEffects.damageReduction * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">减伤</span>
                      </div>
                      <div v-if="enemyFormation.前锋.skillEffects && enemyFormation.前锋.skillEffects.attributeBonus > 0"
                        class="status-icon"
                        :title="`${enemyFormation.前锋.skillEffects.attributeBonusSource || '未知来源'}：全属性提升 ${(enemyFormation.前锋.skillEffects.attributeBonus * 8).toFixed(0)}%`">
                        <span class="status-icon-inner">属性+</span>
                      </div>
                      <div v-if="enemyFormation.前锋.skillEffects && enemyFormation.前锋.skillEffects.damageIncrease > 0"
                        class="status-icon"
                        :title="`${enemyFormation.前锋.skillEffects.damageIncreaseSource || '未知来源'}：增伤 ${(enemyFormation.前锋.skillEffects.damageIncrease * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">增伤</span>
                      </div>
                      <div
                        v-if="enemyFormation.前锋.skillEffects && enemyFormation.前锋.skillEffects.damageOutputReduction > 0"
                        class="status-icon debuff"
                        :title="`${enemyFormation.前锋.skillEffects.damageOutputReductionSource || '未知来源'}：伤害输出降低 ${(enemyFormation.前锋.skillEffects.damageOutputReduction * 100).toFixed(0)}%，持续${enemyFormation.前锋.skillEffects.damageOutputReductionDuration}回合`">
                        <span class="status-icon-inner">降攻{{
                          enemyFormation.前锋.skillEffects.damageOutputReductionDuration }}</span>
                      </div>
                      <div
                        v-if="enemyFormation.前锋.skillEffects && enemyFormation.前锋.skillEffects.skillTriggerReduction > 0"
                        class="status-icon debuff"
                        :title="`${enemyFormation.前锋.skillEffects.skillTriggerReductionSource || '未知来源'}：战法发动概率降低 ${(enemyFormation.前锋.skillEffects.skillTriggerReduction * 100).toFixed(0)}%，持续${enemyFormation.前锋.skillEffects.skillTriggerReductionDuration}回合`">
                        <span class="status-icon-inner">降率{{
                          enemyFormation.前锋.skillEffects.skillTriggerReductionDuration }}</span>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ enemyFormation.前锋.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{
                          enemyFormation.前锋.leadership
                        }}</span>
                        <span class="card-bottom-label">统率</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{
                          enemyFormation.前锋.soldierType
                        }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{
                          enemyFormation.前锋.attackRange
                        }}</span>
                        <span class="card-bottom-label">距</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-slot">
                    <span>前锋</span>
                  </div>
                </div>
              </div>
              <div class="card-slot" @click="selectSlot('enemy', '中军')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && enemyFormation.中军 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{
                        width: enemyFormation.中军
                          ? (enemyFormation.中军.troops /
                            enemyFormation.中军.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                    </div>
                    <div class="troops-text">
                      {{ enemyFormation.中军 ? enemyFormation.中军.troops : 0 }}
                    </div>
                  </div>
                  <div v-if="enemyFormation.中军" class="card enemy" :style="{
                    backgroundImage: `url(${enemyFormation.中军.avatar ? API_BASE_URL + enemyFormation.中军.avatar : enemyFormation.中军.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
                  }" :class="{
                    selected: selectedSlot === 'enemy-中军',
                    dead: enemyFormation.中军.isDead,
                    attacking: attackingCard === 'enemy-中军',
                  }" data-card-side="enemy" data-card-position="中军" @contextmenu="showTooltip('enemy-中军', $event)"
                    @click="hideTooltip">
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">
                          {{ enemyFormation.中军.dynasty }}
                        </div>
                        <div class="card-name">
                          {{ enemyFormation.中军.name }}
                        </div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars">
                          <span v-for="i in 5" :key="i" class="star" :class="{
                            active:
                              i <= Math.ceil(enemyFormation.中军.level),
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <div class="card-status">
                      <div v-if="enemyFormation.中军.skillEffects && enemyFormation.中军.skillEffects.damageReduction > 0"
                        class="status-icon"
                        :title="`${enemyFormation.中军.skillEffects.damageReductionSource || '未知来源'}：物理伤害减免 ${(enemyFormation.中军.skillEffects.damageReduction * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">减伤</span>
                      </div>
                      <div v-if="enemyFormation.中军.skillEffects && enemyFormation.中军.skillEffects.attributeBonus > 0"
                        class="status-icon"
                        :title="`${enemyFormation.中军.skillEffects.attributeBonusSource || '未知来源'}：全属性提升 ${(enemyFormation.中军.skillEffects.attributeBonus * 8).toFixed(0)}%`">
                        <span class="status-icon-inner">属性+</span>
                      </div>
                      <div v-if="enemyFormation.中军.skillEffects && enemyFormation.中军.skillEffects.damageIncrease > 0"
                        class="status-icon"
                        :title="`${enemyFormation.中军.skillEffects.damageIncreaseSource || '未知来源'}：增伤 ${(enemyFormation.中军.skillEffects.damageIncrease * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">增伤</span>
                      </div>
                      <div
                        v-if="enemyFormation.中军.skillEffects && enemyFormation.中军.skillEffects.damageOutputReduction > 0"
                        class="status-icon debuff"
                        :title="`${enemyFormation.中军.skillEffects.damageOutputReductionSource || '未知来源'}：伤害输出降低 ${(enemyFormation.中军.skillEffects.damageOutputReduction * 100).toFixed(0)}%，持续${enemyFormation.中军.skillEffects.damageOutputReductionDuration}回合`">
                        <span class="status-icon-inner">降攻{{
                          enemyFormation.中军.skillEffects.damageOutputReductionDuration }}</span>
                      </div>
                      <div
                        v-if="enemyFormation.中军.skillEffects && enemyFormation.中军.skillEffects.skillTriggerReduction > 0"
                        class="status-icon debuff"
                        :title="`${enemyFormation.中军.skillEffects.skillTriggerReductionSource || '未知来源'}：战法发动概率降低 ${(enemyFormation.中军.skillEffects.skillTriggerReduction * 100).toFixed(0)}%，持续${enemyFormation.中军.skillEffects.skillTriggerReductionDuration}回合`">
                        <span class="status-icon-inner">降率{{
                          enemyFormation.中军.skillEffects.skillTriggerReductionDuration }}</span>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ enemyFormation.中军.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{
                          enemyFormation.中军.leadership
                        }}</span>
                        <span class="card-bottom-label">统率</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{
                          enemyFormation.中军.soldierType
                        }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{
                          enemyFormation.中军.attackRange
                        }}</span>
                        <span class="card-bottom-label">距</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-slot">
                    <span>中军</span>
                  </div>
                </div>
              </div>
              <div class="card-slot" @click="selectSlot('enemy', '大营')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && enemyFormation.大营 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{
                        width: enemyFormation.大营
                          ? (enemyFormation.大营.troops /
                            enemyFormation.大营.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                    </div>
                    <div class="troops-text">
                      {{ enemyFormation.大营 ? enemyFormation.大营.troops : 0 }}
                    </div>
                  </div>
                  <div v-if="enemyFormation.大营" class="card enemy" :style="{
                    backgroundImage: `url(${enemyFormation.大营.avatar ? API_BASE_URL + enemyFormation.大营.avatar : enemyFormation.大营.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
                  }" :class="{
                    selected: selectedSlot === 'enemy-大营',
                    dead: enemyFormation.大营.isDead,
                    attacking: attackingCard === 'enemy-大营',
                  }" data-card-side="enemy" data-card-position="大营" @contextmenu="showTooltip('enemy-大营', $event)"
                    @click="hideTooltip">
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">
                          {{ enemyFormation.大营.dynasty }}
                        </div>
                        <div class="card-name">
                          {{ enemyFormation.大营.name }}
                        </div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars">
                          <span v-for="i in 5" :key="i" class="star" :class="{
                            active:
                              i <= Math.ceil(enemyFormation.大营.level),
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <div class="card-status">
                      <div v-if="enemyFormation.大营.skillEffects && enemyFormation.大营.skillEffects.damageReduction > 0"
                        class="status-icon"
                        :title="`${enemyFormation.大营.skillEffects.damageReductionSource || '未知来源'}：物理伤害减免 ${(enemyFormation.大营.skillEffects.damageReduction * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">减伤</span>
                      </div>
                      <div v-if="enemyFormation.大营.skillEffects && enemyFormation.大营.skillEffects.attributeBonus > 0"
                        class="status-icon"
                        :title="`${enemyFormation.大营.skillEffects.attributeBonusSource || '未知来源'}：全属性提升 ${(enemyFormation.大营.skillEffects.attributeBonus * 8).toFixed(0)}%`">
                        <span class="status-icon-inner">属性+</span>
                      </div>
                      <div v-if="enemyFormation.大营.skillEffects && enemyFormation.大营.skillEffects.damageIncrease > 0"
                        class="status-icon"
                        :title="`${enemyFormation.大营.skillEffects.damageIncreaseSource || '未知来源'}：增伤 ${(enemyFormation.大营.skillEffects.damageIncrease * 100).toFixed(0)}%`">
                        <span class="status-icon-inner">增伤</span>
                      </div>
                      <div
                        v-if="enemyFormation.大营.skillEffects && enemyFormation.大营.skillEffects.damageOutputReduction > 0"
                        class="status-icon debuff"
                        :title="`${enemyFormation.大营.skillEffects.damageOutputReductionSource || '未知来源'}：伤害输出降低 ${(enemyFormation.大营.skillEffects.damageOutputReduction * 100).toFixed(0)}%，持续${enemyFormation.大营.skillEffects.damageOutputReductionDuration}回合`">
                        <span class="status-icon-inner">降攻{{
                          enemyFormation.大营.skillEffects.damageOutputReductionDuration }}</span>
                      </div>
                      <div
                        v-if="enemyFormation.大营.skillEffects && enemyFormation.大营.skillEffects.skillTriggerReduction > 0"
                        class="status-icon debuff"
                        :title="`${enemyFormation.大营.skillEffects.skillTriggerReductionSource || '未知来源'}：战法发动概率降低 ${(enemyFormation.大营.skillEffects.skillTriggerReduction * 100).toFixed(0)}%，持续${enemyFormation.大营.skillEffects.skillTriggerReductionDuration}回合`">
                        <span class="status-icon-inner">降率{{
                          enemyFormation.大营.skillEffects.skillTriggerReductionDuration }}</span>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ enemyFormation.大营.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{
                          enemyFormation.大营.leadership
                        }}</span>
                        <span class="card-bottom-label">统率</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{
                          enemyFormation.大营.soldierType
                        }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{
                          enemyFormation.大营.attackRange
                        }}</span>
                        <span class="card-bottom-label">距</span>
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
        </div>

        <!-- 选择武将界面 -->
        <GeneralList v-if="showGeneralList" :generals="availableGenerals" :API_BASE_URL="API_BASE_URL"
          @close="closeGeneralList" @select="(general) => {
            deployGeneral(general);
            hideTooltip();
          }" @show-tooltip="showGeneralTooltip" />

        <!-- 武将信息 -->
        <GeneralTooltip v-if="tooltipData" :general="tooltipData" @close="hideTooltip" />

        <!-- 底部操作按钮 -->
        <div class="game-footer">
          <button class="action-button recruit" @click="recruitCard" :disabled="money < recruitCost"
            @mouseenter="showHeaderTooltip($event, 'recruit')" @mouseleave="hideHeaderTooltip">
            <img src="/assets/open.webp" alt="卡包招募" class="button-icon">
          </button>
          <button class="action-button end-turn" @click="endTurn" @mouseenter="showHeaderTooltip($event, 'start')"
            @mouseleave="hideHeaderTooltip">
            <img src="/assets/start.webp" alt="开始" class="button-icon">
          </button>
          <button class="action-button next-wave" @click="nextWave" @mouseenter="showHeaderTooltip($event, 'next')"
            @mouseleave="hideHeaderTooltip">
            <img src="/assets/next.webp" alt="下一轮" class="button-icon">
          </button>
        </div>
      </div>

      <AuthModal v-if="showAuthModal" :is-login="isLogin" @close="showAuthModal = false" @login="handleLogin" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import AuthModal from "../components/AuthModal.vue";
import GeneralTooltip from "../components/GeneralTooltip.vue";
import GeneralList from "../components/GeneralList.vue";
import BattleReport from "../components/BattleReport.vue";
import type { General } from "../skills/types";

const isLoggedIn = ref(false);
const showAuthModal = ref(false);
const isLogin = ref(true);

// 游戏加载状态
const gameLoaded = ref(false);
const loadingProgress = ref(0);

// 悬浮提示状态
const tooltip = ref({
  visible: false,
  text: '',
  x: 0,
  y: 0,
});

// 悬浮提示文本映射
const tooltipTexts: Record<string, string> = {
  money: '当前金币数量',
  wave: '当前波次/总波次',
  command: '当前统率/最大统率',
  recruit: '消耗金币招募新的武将卡牌',
  start: '开始战斗',
  next: '进入下一轮战斗',
};

// 显示悬浮提示
const showHeaderTooltip = (event: MouseEvent, key: string) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  tooltip.value = {
    visible: true,
    text: tooltipTexts[key] || '',
    x: rect.left + rect.width / 2,
    y: rect.bottom + 10,
  };
};

// 隐藏悬浮提示
const hideHeaderTooltip = () => {
  tooltip.value.visible = false;
};

// 游戏初始数据
const initialGameData = {
  money: 1000,
  currentYear: -2070,
  currentWave: 1,
};

const money = ref(initialGameData.money);
const currentYear = ref(initialGameData.currentYear);
const currentWave = ref(initialGameData.currentWave);
const totalWaves = ref(300);
const currentTurn = ref(0);
const maxTurns = ref(8);
const recruitCost = ref(100);
const maxCommand = ref(100);
const currentCommand = ref(0);

// API配置
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// 人物数据
const characters = ref<any[]>([]);
const loadingCharacters = ref(false);

// 兵种克制关系
const soldierType克制 = {
  骑兵: "步兵",
  步兵: "弓兵",
  弓兵: "骑兵",
};

// 随机兵种
const getRandomSoldierType = (): "步兵" | "弓兵" | "骑兵" => {
  const types: Array<"步兵" | "弓兵" | "骑兵"> = ["步兵", "弓兵", "骑兵"];
  return types[Math.floor(Math.random() * types.length)];
};

// 监听登录状态变化，登录成功后开始游戏加载
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    startGameLoading();
  }
});

// 开始游戏加载
const startGameLoading = () => {
  loadingProgress.value = 0;
  gameLoaded.value = false;

  // 模拟游戏加载过程
  const loadingInterval = setInterval(() => {
    loadingProgress.value += 50;
    if (loadingProgress.value >= 100) {
      clearInterval(loadingInterval);
      // 加载完成后显示游戏主界面
      setTimeout(() => {
        gameLoaded.value = true;
      }, 500);
    }
  }, 150);
};

// 组件挂载时检查登录状态
onMounted(() => {
  if (isLoggedIn.value) {
    startGameLoading();
  }
});

// 获取人物数据
const fetchCharacters = async () => {
  try {
    loadingCharacters.value = true;
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 构建查询参数，只获取夏朝人物
    const params = new URLSearchParams();
    // params.append('dynasty', '夏朝')
    params.append("page", "1");
    params.append("pageSize", "50");

    const response = await fetch(
      `${API_BASE_URL}/characters?${params.toString()}`,
      {
        headers,
      },
    );

    if (!response.ok) {
      throw new Error("获取人物列表失败");
    }

    const data = await response.json();
    characters.value = data.data || [];
    console.log("获取到夏朝人物:", characters.value.length);
  } catch (error) {
    console.error("获取人物失败:", error);
  } finally {
    loadingCharacters.value = false;
  }
};

const playerFormation = ref({
  大营: null as General | null,
  中军: null as General | null,
  前锋: null as General | null,
});

const enemyFormation = ref({
  大营: null as General | null,
  中军: null as General | null,
  前锋: null as General | null,
});

const generals = ref<General[]>([]);
const selectedSlot = ref<string | null>(null);
const showGeneralList = ref(false);
const battleReports = ref<string[]>([]);
const speedUnits = ref<any[]>([]);
const isBattleActive = ref(false);
const damageTexts = ref<any[]>([]);
const attackingCard = ref<string | null>(null);

interface SpeedUnit {
  id: string;
  general: General;
  side: "player" | "enemy";
  position: string;
  speed: number;
  isActive: boolean;
}

const xiaDynastyGenerals = [
  "大禹",
  "启",
  "太康",
  "仲康",
  "相",
  "少康",
  "予",
  "槐",
  "芒",
  "泄",
  "不降",
  "扃",
  "廑",
  "孔甲",
  "皋",
  "发",
  "癸",
  "羿",
  "寒浞",
];



const availableGenerals = computed(() => {
  return generals.value.filter((g) => {
    return !Object.values(playerFormation.value).some((p) => p?.id === g.id);
  });
});

const updateCurrentCommand = () => {
  let total = 0;
  Object.values(playerFormation.value).forEach((g) => {
    if (g) total += g.leadership;
  });
  currentCommand.value = total;
};

onMounted(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    isLoggedIn.value = true;
  }
  // 先获取人物数据，再生成敌方队伍
  fetchCharacters().then(() => {
    generateEnemyTeam();
  });
});

const openAuthModal = () => {
  isLogin.value = true;
  showAuthModal.value = true;
};

const handleLogin = (loginData: any) => {
  isLoggedIn.value = true;
  localStorage.setItem("user", JSON.stringify(loginData));
  showAuthModal.value = false;
  addReport("欢迎来到夏朝！开始你的征程吧！");
};

const selectSlot = (side: "player" | "enemy", position: string) => {
  if (side === "player") {
    selectedSlot.value = `${side}-${position}`;
    showGeneralList.value = true;
  }
};

const tooltipData = ref<General | null>(null);

let tooltipTimer: number | null = null;

const showTooltip = (slotKey: string, event?: MouseEvent) => {
  // 阻止默认的右键菜单
  if (event) {
    event.preventDefault();
  }

  // 清除之前的定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }

  // 立即显示tooltip
  const [side, position] = slotKey.split("-");
  const formation =
    side === "player" ? playerFormation.value : enemyFormation.value;
  const general = formation[position as keyof typeof formation];
  if (general) {
    tooltipData.value = general;
  }
};

const hideTooltip = () => {
  // 清除定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
  tooltipData.value = null;
};

const showGeneralTooltip = (general: General, event?: MouseEvent) => {
  // 阻止默认的右键菜单
  if (event) {
    event.preventDefault();
  }

  // 清除之前的定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }

  // 立即显示tooltip
  tooltipData.value = general;
};

const closeGeneralList = () => {
  showGeneralList.value = false;
  selectedSlot.value = null;
  hideTooltip();
};

const deployGeneral = (general: General) => {
  if (selectedSlot.value) {
    const [, position] = selectedSlot.value.split("-");
    const oldGeneral = playerFormation.value[position as keyof typeof playerFormation.value];
    const oldCommand = oldGeneral ? oldGeneral.leadership : 0;
    const newTotalCommand = currentCommand.value - oldCommand + general.leadership;

    if (newTotalCommand > maxCommand.value) {
      addReport(
        `统率不足！当前统率: ${currentCommand.value}/${maxCommand.value}，需要: ${newTotalCommand}`,
      );
      return;
    }

    playerFormation.value[position as keyof typeof playerFormation.value] =
      general;
    updateCurrentCommand();
    addReport(
      `【${general.name}】已上阵至【${position}】！统率: ${currentCommand.value}/${maxCommand.value}`,
    );
    closeGeneralList();
  }
};

const generateEnemyTeam = () => {
  const positions: (keyof typeof enemyFormation.value)[] = [
    "大营",
    "中军",
    "前锋",
  ];
  positions.forEach((position) => {
    const level = Math.floor(Math.random() * 5) + 1;
    const leadershipValues = [2, 2.5, 3, 3.5];
    const leadership = leadershipValues[Math.floor(Math.random() * leadershipValues.length)];
    const commandValue = Math.floor(Math.random() * 100) + 1; // 统御值 1-100
    const troops = Math.floor(commandValue * 10);

    // 从API获取的人物中随机选择，或者使用默认人物
    let character = null;
    if (characters.value.length > 0) {
      character =
        characters.value[Math.floor(Math.random() * characters.value.length)];
    }

    const generalName =
      character?.name ||
      xiaDynastyGenerals[Math.floor(Math.random() * xiaDynastyGenerals.length)];

    enemyFormation.value[position] = {
      id: character?.id || Date.now() + Math.random(),
      name: generalName,
      attack: Math.floor(Math.random() * 100) + 50,
      attackGrowth: Math.round(Math.random() * 3 * 100) / 100,
      defense: Math.floor(Math.random() * 100) + 50,
      defenseGrowth: Math.round(Math.random() * 3 * 100) / 100,
      strategy: Math.floor(Math.random() * 100) + 50,
      strategyGrowth: Math.round(Math.random() * 3 * 100) / 100,
      speed: Math.floor(Math.random() * 100) + 50,
      speedGrowth: Math.round(Math.random() * 3 * 100) / 100,
      attackRange: Math.floor(Math.random() * 3) + 1,
      siege: Math.floor(Math.random() * 100) + 50,
      siegeGrowth: Math.round(Math.random() * 3 * 100) / 100,
      troops: troops,
      maxTroops: troops,
      level: level,
      command: commandValue, // 统御值 1-100
      commandGrowth: Math.round(Math.random() * 3 * 100) / 100,
      leadership: leadership, // 统率值，用于组建队伍
      isDead: false,
      dynasty: "夏朝",
      soldierType: getRandomSoldierType(),
      avatar: character?.avatar,
      gender: character?.gender,
    };
  });
  addReport("敌方队伍已集结完毕！");
};

const recruitCard = () => {
  if (money.value < recruitCost.value) {
    addReport("金额不足，无法招募！");
    return;
  }

  money.value -= recruitCost.value;

  // 100%概率招募到设计好的武将（尉迟迥、李德林、陆彦师）
  // 33%的概率招募尉迟迥，33%的概率招募李德林，34%的概率招募陆彦师
  const random = Math.random();
  if (random < 0.33) {
    // 尝试从数据库获取尉迟迥的详细信息（包括头像）
    import('../skills/yuchi-jiong').then(({ fetchYuchiJiongFromDatabase }) => {
      fetchYuchiJiongFromDatabase(API_BASE_URL).then((yuchiJiong) => {
        if (yuchiJiong) {
          generals.value.push(yuchiJiong);
          addReport(
            `恭喜获得【${yuchiJiong.name}】！等级:${yuchiJiong.level} 攻:${yuchiJiong.attack} 防:${yuchiJiong.defense} 策:${yuchiJiong.strategy} 速:${yuchiJiong.speed} 兵:${yuchiJiong.troops} 距:${yuchiJiong.attackRange} 统御:${yuchiJiong.command} 统率:${yuchiJiong.leadership} 兵种:${yuchiJiong.soldierType}`,
          );
          addReport(
            `【${yuchiJiong.name}】自带战法：${yuchiJiong.skills?.[0].description}`,
          );
        }
      });
    });
  } else if (random < 0.66) {
    // 尝试从数据库获取李德林的详细信息（包括头像）
    import('../skills/li-de-lin').then(({ fetchLiDeLinFromDatabase }) => {
      fetchLiDeLinFromDatabase(API_BASE_URL).then((liDeLin) => {
        if (liDeLin) {
          generals.value.push(liDeLin);
          addReport(
            `恭喜获得【${liDeLin.name}】！等级:${liDeLin.level} 攻:${liDeLin.attack} 防:${liDeLin.defense} 策:${liDeLin.strategy} 速:${liDeLin.speed} 兵:${liDeLin.troops} 距:${liDeLin.attackRange} 统御:${liDeLin.command} 统率:${liDeLin.leadership} 兵种:${liDeLin.soldierType}`,
          );
          addReport(
            `【${liDeLin.name}】自带战法：${liDeLin.skills?.[0].description}`,
          );
        }
      });
    });
  } else {
    // 尝试从数据库获取陆彦师的详细信息（包括头像）
    import('../skills/lu-yan-shi').then(({ fetchLuYanShiFromDatabase }) => {
      fetchLuYanShiFromDatabase(API_BASE_URL).then((luYanShi) => {
        if (luYanShi) {
          generals.value.push(luYanShi);
          addReport(
            `恭喜获得【${luYanShi.name}】！等级:${luYanShi.level} 攻:${luYanShi.attack} 防:${luYanShi.defense} 策:${luYanShi.strategy} 速:${luYanShi.speed} 兵:${luYanShi.troops} 距:${luYanShi.attackRange} 统御:${luYanShi.command} 统率:${luYanShi.leadership} 兵种:${luYanShi.soldierType}`,
          );
          addReport(
            `【${luYanShi.name}】自带战法：${luYanShi.skills?.[0].description}`,
          );
        }
      });
    });
  }
};

const endTurn = () => {
  startBattle();
};

const getTargetsInRange = (attacker: {
  general: General;
  side: "player" | "enemy";
  position: string;
}) => {
  const targets: Array<{
    general: General;
    side: "player" | "enemy";
    position: string;
  }> = [];
  // 位置深度：前锋=1，中军=2，大营=3
  // 固定距离规则：
  // 我方前锋到敌方前锋：距离1
  // 我方前锋到敌方中军：距离2
  // 我方前锋到敌方大营：距离3
  // 我方中军到敌方前锋：距离2
  // 我方中军到敌方中军：距离3
  // 我方中军到敌方大营：距离4
  // 我方大营到敌方前锋：距离3
  // 我方大营到敌方中军：距离4
  // 我方大营到敌方大营：距离5
  const positionIndex: Record<string, number> = { 前锋: 1, 中军: 2, 大营: 3 };

  // 计算敌方存活位置的实际位置索引（跳过死亡位置）
  const getEnemyAlivePositions = (): Array<{
    position: string;
    actualPosition: number;
    general: General;
  }> => {
    const formation =
      attacker.side === "player" ? enemyFormation.value : playerFormation.value;
    const positions = ["前锋", "中军", "大营"] as const;
    const alivePositions: Array<{
      position: string;
      actualPosition: number;
      general: General;
    }> = [];
    let actualPosition = 1; // 实际位置从1开始

    for (const pos of positions) {
      const general = formation[pos];
      if (general && !general.isDead) {
        alivePositions.push({
          position: pos,
          actualPosition: actualPosition,
          general,
        });
        actualPosition++;
      }
    }
    return alivePositions;
  };

  const enemyAlivePositions = getEnemyAlivePositions();

  for (const enemyPos of enemyAlivePositions) {
    const enemy = enemyPos.general;

    // 计算距离：攻击方原始位置 + 敌方实际位置 - 1
    // 死亡位置被跳过，敌方实际位置重新计算
    const distance =
      positionIndex[attacker.position] + enemyPos.actualPosition - 1;

    // 攻击范围决定能打到的最大距离
    if (distance <= attacker.general.attackRange) {
      targets.push({
        general: enemy,
        side: attacker.side === "player" ? "enemy" : "player",
        position: enemyPos.position,
      });
    }
  }

  // 详细播报可攻击目标
  if (targets.length > 0) {
    const targetList = targets
      .map((target) => {
        const targetPrefix = target.side === "player" ? "我方" : "敌方";
        return `${targetPrefix}${target.position}【${target.general.name}】`;
      })
      .join("、");
    addReport(`可攻击目标：${targetList}（共${targets.length}个）`);
  }

  return targets;
};

const triggerSkillEffects = (general: General, context: any) => {
  if (general.skills) {
    for (const skill of general.skills) {
      // 处理所有类型的技能（包括active和passive）
      // 传递addReport函数给技能效果
      const result: any = skill.effect(general, {
        ...context,
        addReport
      });
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const performAttack = (
  attacker: { general: General; side: "player" | "enemy"; position: string },
  target: { general: General; side: "player" | "enemy"; position: string },
  attackType: "physical" | "strategy" = "physical",
) => {
  // 攻击前触发攻击者的战法效果
  const attackContext = {
    type: "attack",
    event: "beforeAttack",
    currentTroops: attacker.general.troops,
    maxTroops: attacker.general.maxTroops,
    attackType: attackType,
  };
  const attackEffect = triggerSkillEffects(attacker.general, attackContext);

  // 计算基础伤害
  let damage = 0;
  if (attackType === "physical") {
    // 物理攻击：使用攻击和防御
    damage = Math.max(
      0,
      attacker.general.attack - target.general.defense / 2,
    );
  } else {
    // 策略攻击：使用攻击方谋略和防御方谋略
    // 公式：攻击方策略值 * 系数 - 防御方策略值 / 2
    damage = Math.max(
      0,
      attacker.general.strategy - target.general.strategy / 2,
    );
  }

  // 应用攻击者的增伤效果
  if (attackEffect && attackEffect.damageIncrease) {
    damage *= 1 + attackEffect.damageIncrease;
    addReport(
      `【${attacker.general.name}】触发战法效果，伤害提升${(attackEffect.damageIncrease * 100).toFixed(0)}%！`,
    );
  }

  // 被攻击前触发目标的战法效果
  const defendContext = {
    type: "attacked",
    event: "beforeDamage",
    currentTroops: target.general.troops,
    maxTroops: target.general.maxTroops,
    attackType: attackType,
  };
  const defendEffect = triggerSkillEffects(target.general, defendContext);

  // 应用目标的减伤效果
  if (defendEffect && defendEffect.damageReduction) {
    damage *= 1 - defendEffect.damageReduction;
    addReport(
      `【${target.general.name}】触发战法效果，受到伤害降低${(defendEffect.damageReduction * 100).toFixed(0)}%！`,
    );
  }

  // 兵种克制逻辑
  if (attacker.general.soldierType && target.general.soldierType) {
    const attackerType = attacker.general.soldierType;
    const targetType = target.general.soldierType;

    if (soldierType克制[attackerType] === targetType) {
      // 克制关系，伤害额外降低30%
      damage *= 0.7;
      addReport(
        `【${attacker.general.name}】的${attackerType}克制【${target.general.name}】的${targetType}，伤害降低30%！`,
      );
    }
  }

  const oldTroops = target.general.troops;
  target.general.troops = Math.max(
    0,
    target.general.troops - Math.floor(damage),
  );

  // 兵力变化后触发目标的战法效果
  if (target.general.troops < oldTroops) {
    const troopChangeContext = {
      type: "troopChange",
      event: "afterDamage",
      currentTroops: target.general.troops,
      maxTroops: target.general.maxTroops,
      damageAmount: Math.floor(damage),
    };
    triggerSkillEffects(target.general, troopChangeContext);
  }

  // 返回攻击详情，不直接播报
  const attackResult = {
    damage: Math.floor(damage),
    oldTroops: oldTroops,
    newTroops: target.general.troops,
    isTargetDied: target.general.troops <= 0,
    attackType: attackType,
  };

  if (target.general.troops <= 0) {
    target.general.isDead = true;
  }

  return attackResult;
};

const showDamageText = (
  damage: number,
  side: "player" | "enemy",
  position: string,
) => {
  // 查找对应卡牌内的troops元素
  const troopsElement = document.querySelector(
    `.${side}-side [data-card-position="${position}"] .troops, ` +
    `.player-side.enemy [data-card-position="${position}"] .troops, ` +
    `.enemy-side [data-card-position="${position}"] .troops`,
  );

  if (!troopsElement) {
    // 备用方案：查找卡牌本身
    const cardElement = document.querySelector(
      `[data-card-side="${side}"][data-card-position="${position}"]`,
    );
    if (!cardElement) return;

    const cardRect = cardElement.getBoundingClientRect();
    const damageText = {
      id: Date.now() + Math.random(),
      text: "-" + damage,
      x: cardRect.left + cardRect.width / 2 - 20,
      y: cardRect.top + cardRect.height / 2,
      delay: 0,
    };

    damageTexts.value.push(damageText);

    setTimeout(() => {
      damageTexts.value = damageTexts.value.filter(
        (dt) => dt.id !== damageText.id,
      );
    }, 2000);
    return;
  }

  const troopsRect = troopsElement.getBoundingClientRect();
  const damageText = {
    id: Date.now() + Math.random(),
    text: "-" + damage,
    x: troopsRect.left + troopsRect.width / 2 - 20,
    y: troopsRect.top - 10,
    delay: 0,
  };

  damageTexts.value.push(damageText);

  // 2秒后移除伤害文本
  setTimeout(() => {
    damageTexts.value = damageTexts.value.filter(
      (dt) => dt.id !== damageText.id,
    );
  }, 2000);
};

const performAttackWithAnimation = async (
  attacker: { general: General; side: "player" | "enemy"; position: string },
  target: { general: General; side: "player" | "enemy"; position: string },
  attackType: "physical" | "strategy" = "physical",
) => {
  // 设置攻击中的卡牌
  attackingCard.value = `${attacker.side}-${attacker.position}`;

  const attackerPrefix = attacker.side === "player" ? "我方" : "敌方";
  const targetPrefix = target.side === "player" ? "我方" : "敌方";
  const attackTypeText = attackType === "physical" ? "物理" : "策略";

  // 详细播报：谁开始行动
  addReport(
    `${attackerPrefix}${attacker.position}开始行动`,
    attacker.general,
    attacker.side,
  );
  addReport(
    `攻击距离：${attacker.general.attackRange}，可以攻击到${targetPrefix}${target.position}`,
  );

  // 详细播报：选择攻击目标
  addReport(
    `选择${attackTypeText}攻击${targetPrefix}${target.position}【${target.general.name}】`,
    attacker.general,
    attacker.side,
  );

  // 执行攻击逻辑
  const attackResult = performAttack(attacker, target, attackType);

  if (attackResult.damage > 0) {
    addReport(
      `造成${attackResult.damage}点${attackTypeText}伤害！`,
      attacker.general,
      attacker.side,
    );
    addReport(
      `兵力从${attackResult.oldTroops}降至${attackResult.newTroops}`,
      target.general,
      target.side,
    );

    // 显示伤害数值 - 显示在目标卡牌上
    showDamageText(attackResult.damage, target.side, target.position);

    if (attackResult.isTargetDied) {
      addReport(`阵亡！`, target.general, target.side);
    } else {
      addReport(
        `剩余兵力：${attackResult.newTroops}`,
        target.general,
        target.side,
      );
    }
  } else {
    addReport(`${attackTypeText}攻击被格挡，未造成伤害！`);
  }

  // 模拟动画时间
  await new Promise((resolve) => setTimeout(resolve, 1200)); // 增加动画时间以便用户看到播报

  addReport(
    `${attackerPrefix}${attacker.position}【${attacker.general.name}】行动结束`,
  );
  // 清除攻击状态
  attackingCard.value = null;
};

const checkGameOver = () => {
  if (enemyFormation.value.大营 && enemyFormation.value.大营.isDead) {
    // 胜利结算
    const reward = currentWave.value * 10;
    money.value += reward;
    addReport(`恭喜！你击败了敌方大营，获得胜利！`);
    addReport(`获得奖励：${reward} 金额！`);
    setTimeout(() => {
      alert(`恭喜通关！获得 ${reward} 金额奖励！`);
    }, 1000);
    return true;
  }

  if (playerFormation.value.大营 && playerFormation.value.大营.isDead) {
    // 失败重置
    addReport("我方大营阵亡，战斗失败！");
    setTimeout(() => {
      alert("战斗失败！恢复游戏初始数据！");
      // 恢复游戏开始时的数据
      money.value = initialGameData.money;
      currentYear.value = initialGameData.currentYear;
      currentWave.value = initialGameData.currentWave;
      currentTurn.value = 0;
      currentCommand.value = 0;
      generals.value = [];
      playerFormation.value = {
        大营: null,
        中军: null,
        前锋: null,
      };
      enemyFormation.value = {
        大营: null,
        中军: null,
        前锋: null,
      };
      battleReports.value = [];
    }, 1000);
    return true;
  }

  return false;
};

const checkGameOverByTurns = () => {
  // 首先检查双方大营是否都存活 - 用户要求的新和局逻辑
  const playerCampAlive =
    playerFormation.value.大营 && !playerFormation.value.大营.isDead;
  const enemyCampAlive =
    enemyFormation.value.大营 && !enemyFormation.value.大营.isDead;

  if (playerCampAlive && enemyCampAlive) {
    // 双方大营都存活 - 和局，保留当前状态可以重新开始
    addReport("回合结束！双方大营都未阵亡，和局！");
    addReport('可以再次点击"开始"重新战斗！');
    setTimeout(() => {
      alert('和局！当前状态已保留，可以再次点击"开始"重新战斗！');
    }, 1000);
    return;
  }

  // 如果有大营阵亡，按原本的兵力对比逻辑处理
  let playerTroops = 0;
  let enemyTroops = 0;

  Object.values(playerFormation.value).forEach((general) => {
    if (general && !general.isDead) {
      playerTroops += general.troops;
    }
  });

  Object.values(enemyFormation.value).forEach((general) => {
    if (general && !general.isDead) {
      enemyTroops += general.troops;
    }
  });

  if (playerTroops > enemyTroops) {
    // 胜利结算
    const reward = currentWave.value * 10;
    money.value += reward;
    addReport("回合结束！我方兵力占优，获得胜利！");
    addReport(`获得奖励：${reward} 金额！`);
    setTimeout(() => {
      alert(`恭喜胜利！获得 ${reward} 金额奖励！`);
    }, 1000);
  } else if (enemyTroops > playerTroops) {
    // 失败重置
    addReport("回合结束！敌方兵力占优，战斗失败！");
    setTimeout(() => {
      alert("战斗失败！恢复游戏初始数据！");
      // 恢复游戏开始时的数据
      money.value = initialGameData.money;
      currentYear.value = initialGameData.currentYear;
      currentWave.value = initialGameData.currentWave;
      currentTurn.value = 0;
      currentCommand.value = 0;
      generals.value = [];
      playerFormation.value = {
        大营: null,
        中军: null,
        前锋: null,
      };
      enemyFormation.value = {
        大营: null,
        中军: null,
        前锋: null,
      };
      battleReports.value = [];
    }, 1000);
  }
};

const advanceTime = () => {
  currentYear.value += 10;
  currentWave.value += 1;

  if (currentYear.value > -1600) {
    addReport("恭喜通关夏朝！");
    resetGame();
  }
};

const addReport = (
  message: string,
  general?: General,
  side?: "player" | "enemy",
) => {
  let formattedMessage = message;

  if (general) {
    const avatarUrl = general.avatar
      ? `${API_BASE_URL}${general.avatar}`
      : general.gender === "女"
        ? `${API_BASE_URL}/public/images/ancient_character_women.webp`
        : `${API_BASE_URL}/public/images/ancient_character_men.webp`;

    const sideColor = side === "player" ? "#667eea" : "#e74c3c";

    formattedMessage = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="${avatarUrl}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${sideColor};" />
        <span style="color: ${sideColor}; font-weight: bold;">${general.name}</span>
        <span>${message}</span>
      </div>
    `;
  }

  battleReports.value.push(formattedMessage); // 改为push，从上到下显示
  // 不再限制播报数量，保留全部历史记录

  // 自动滚动到最新播报
  setTimeout(() => {
    const reportContent = document.querySelector(".report-content");
    if (reportContent) {
      reportContent.scrollTop = reportContent.scrollHeight;
    }
  }, 100);
};

const resetGame = () => {
  // 恢复游戏开始时的数据
  money.value = initialGameData.money;
  currentYear.value = initialGameData.currentYear;
  currentWave.value = initialGameData.currentWave;
  currentTurn.value = 0;
  currentCommand.value = 0;
  generals.value = [];
  playerFormation.value = {
    大营: null,
    中军: null,
    前锋: null,
  };
  enemyFormation.value = {
    大营: null,
    中军: null,
    前锋: null,
  };
  battleReports.value = [];
};

const getAllGenerals = () => {
  const allGenerals: Array<{
    general: General;
    side: "player" | "enemy";
    position: string;
  }> = [];

  // 添加我方武将
  Object.entries(playerFormation.value).forEach(([position, general]) => {
    if (general && !general.isDead) {
      allGenerals.push({
        general,
        side: "player" as const,
        position,
      });
    }
  });

  // 添加敌方武将
  Object.entries(enemyFormation.value).forEach(([position, general]) => {
    if (general && !general.isDead) {
      allGenerals.push({
        general,
        side: "enemy" as const,
        position,
      });
    }
  });

  return allGenerals;
};

const initializeSpeedUnits = () => {
  const units: SpeedUnit[] = [];

  // 添加我方武将
  Object.entries(playerFormation.value).forEach(([position, general]) => {
    if (general && !general.isDead) {
      units.push({
        id: `player-${position}-${general.id}`,
        general,
        side: "player" as const,
        position,
        speed: Math.random() * 50, // 给一些初始速度，0-50随机
        isActive: false,
      });
    }
  });

  // 添加敌方武将
  Object.entries(enemyFormation.value).forEach(([position, general]) => {
    if (general && !general.isDead) {
      units.push({
        id: `enemy-${position}-${general.id}`,
        general,
        side: "enemy" as const,
        position,
        speed: Math.random() * 50, // 给一些初始速度，0-50随机
        isActive: false,
      });
    }
  });

  // 按速度排序（初始状态）
  units.sort((a, b) => b.speed - a.speed);
  speedUnits.value = units;
};

const updateSpeed = () => {
  speedUnits.value.forEach((unit) => {
    if (!unit.general.isDead) {
      unit.speed += unit.general.speed / 20; // 降低速度增长速率，使其更慢
      if (unit.speed >= 100) {
        unit.speed = 100;
      }
    }
  });

  // 按当前速度排序
  speedUnits.value.sort((a, b) => b.speed - a.speed);
};

const checkSpeedThreshold = () => {
  const readyUnit = speedUnits.value.find(
    (unit) => unit.speed >= 100 && !unit.general.isDead,
  );
  if (readyUnit) {
    return readyUnit;
  }
  return null;
};

const resetUnitSpeed = (unit: SpeedUnit) => {
  unit.speed = 0;
  unit.isActive = false;
};

const startBattle = async () => {
  const hasEmptySlot = Object.values(playerFormation.value).some(
    (slot) => slot === null,
  );
  if (hasEmptySlot) {
    addReport("请先将武将上阵！");
    return;
  }

  isBattleActive.value = true;
  initializeSpeedUnits();

  // 战斗循环
  for (let i = 1; i <= maxTurns.value; i++) {
    currentTurn.value = i;
    addReport(
      `<span style="color: #667eea; font-weight: bold;">========== 第 ${i} 回合开始！ ==========</span>`,
    );

    // 每回合的行动循环
    let actionCount = 0;
    const maxActions = 20; // 防止无限循环
    let unitIndex = 1;
    let loopCount = 0; // 循环计数器
    let actionThisRound = false; // 本轮是否有行动

    while (actionCount < maxActions) {
      loopCount++;
      if (loopCount % 10 === 0) {
        // 每10次循环播报一次进度
        addReport(`回合进行中...（速度累积中，第${loopCount}轮）`);
      }

      updateSpeed();
      const readyUnit = checkSpeedThreshold();

      if (readyUnit) {
        actionThisRound = true;
        readyUnit.isActive = true;

        // 详细播报当前行动者信息
        const sidePrefix = readyUnit.side === "player" ? "我方" : "敌方";
        addReport(
          `== ${unitIndex}. ${sidePrefix}${readyUnit.position}【${readyUnit.general.name}】开始行动（速度达到100）==`,
        );
        addReport(
          `兵力：${readyUnit.general.troops}，攻击：${readyUnit.general.attack}，防御：${readyUnit.general.defense}，策略：${readyUnit.general.strategy}，速度：${readyUnit.general.speed}，攻击距离：${readyUnit.general.attackRange}，攻城：${readyUnit.general.siege}`,
        );

        // 角色回合开始时触发turnStart事件（用于减少降攻等效果的持续回合数）
        const turnStartContext = {
          type: "turnStart",
          event: "startOfTurn",
          currentTroops: readyUnit.general.troops,
          maxTroops: readyUnit.general.maxTroops,
        };

        // 处理当前角色的技能效果
        triggerSkillEffects(readyUnit.general, turnStartContext);

        // 直接处理当前角色的skillEffects中的持续效果
        if (readyUnit.general.skillEffects) {
          // 处理伤害输出降低效果
          if (readyUnit.general.skillEffects.damageOutputReductionDuration > 0) {
            readyUnit.general.skillEffects.damageOutputReductionDuration -= 1;
            addReport(
              `【${readyUnit.general.name}】的降攻效果剩余${readyUnit.general.skillEffects.damageOutputReductionDuration}回合`,
            );
            if (readyUnit.general.skillEffects.damageOutputReductionDuration === 0) {
              const source = readyUnit.general.skillEffects.damageOutputReductionSource || "";
              readyUnit.general.skillEffects.damageOutputReduction = 0;
              readyUnit.general.skillEffects.damageOutputReductionSource = '';
              addReport(
                `【${readyUnit.general.name}】${source}的伤害输出降低效果结束！`,
              );
            }
          }

          // 处理战法发动概率降低效果
          if (readyUnit.general.skillEffects.skillTriggerReductionDuration > 0) {
            readyUnit.general.skillEffects.skillTriggerReductionDuration -= 1;
            addReport(
              `【${readyUnit.general.name}】的战法发动概率降低效果剩余${readyUnit.general.skillEffects.skillTriggerReductionDuration}回合`,
            );
            if (readyUnit.general.skillEffects.skillTriggerReductionDuration === 0) {
              const source = readyUnit.general.skillEffects.skillTriggerReductionSource || "";
              readyUnit.general.skillEffects.skillTriggerReduction = 0;
              readyUnit.general.skillEffects.skillTriggerReductionSource = '';
              addReport(
                `【${readyUnit.general.name}】${source}的战法发动概率降低效果结束！`,
              );
            }
          }
        }

        // 触发主动战法
        let activeSkillTriggered = false;
        if (readyUnit.general.skills) {
          for (const skill of readyUnit.general.skills) {
            if (skill.type === "active") {
              // 触发前检查是否有战法发动概率降低效果
              const beforeTriggerContext = {
                type: "activeSkill",
                event: "beforeTrigger",
                currentTroops: readyUnit.general.troops,
                maxTroops: readyUnit.general.maxTroops,
                addReport
              };
              const beforeTriggerResult = skill.effect(readyUnit.general, beforeTriggerContext);

              // 应用战法发动概率降低效果
              let finalTriggerChance = 1;
              if (beforeTriggerResult && beforeTriggerResult.triggerReduction) {
                finalTriggerChance = 1 - beforeTriggerResult.triggerReduction;
              }

              // 检查是否触发
              if (Math.random() < finalTriggerChance) {
                const targets = getTargetsInRange({
                  general: readyUnit.general,
                  side: readyUnit.side,
                  position: readyUnit.position,
                });

                // 找到友军目标（用于治疗效果）
                const allies: General[] = [];
                if (readyUnit.side === "player") {
                  Object.values(playerFormation.value).forEach((general) => {
                    if (general && !general.isDead) {
                      allies.push(general);
                    }
                  });
                } else {
                  Object.values(enemyFormation.value).forEach((general) => {
                    if (general && !general.isDead) {
                      allies.push(general);
                    }
                  });
                }

                if (targets.length > 0) {
                  const skillContext = {
                    type: "activeSkill",
                    event: "trigger",
                    currentTroops: readyUnit.general.troops,
                    maxTroops: readyUnit.general.maxTroops,
                    targets: targets.map(t => t.general),
                    allies: allies,
                    addReport
                  };
                  const skillResult = skill.effect(readyUnit.general, skillContext);
                  if (skillResult && skillResult.triggered) {
                    activeSkillTriggered = true;
                    break;
                  }
                }
              }
            }
          }
        }

        // 如果主动战法未触发，执行普通攻击（物理伤害）
        if (!activeSkillTriggered) {
          const targets = getTargetsInRange({
            general: readyUnit.general,
            side: readyUnit.side,
            position: readyUnit.position,
          });

          if (targets.length > 0) {
            addReport(`可攻击目标：${targets.length}个`);
            const target = targets[Math.floor(Math.random() * targets.length)];
            // 普通攻击都是物理伤害
            await performAttackWithAnimation(
              {
                general: readyUnit.general,
                side: readyUnit.side,
                position: readyUnit.position,
              },
              target,
              "physical"
            );
          } else {
            addReport(`范围内没有可攻击的目标！`);
          }
        }

        resetUnitSpeed(readyUnit);
        actionCount++;
        unitIndex++;

        // 检查游戏结束条件
        if (checkGameOver()) {
          isBattleActive.value = false;
          return;
        }

        // 增加行动间隔时间，让用户能看到详细播报
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else {
        // 没有单位可以行动，继续下一轮增速
        if (loopCount % 20 === 0) {
          addReport(`回合进行中...（正在加速累积，预计还需时间）`);
        }

        // 检查是否所有单位都已达最大速度，如果是的话自动给速度最快的单位一个随机数值
        let anyCanAct = false;
        let maxSpeedUnit = null;
        let maxSpeed = 0;

        for (const unit of speedUnits.value) {
          if (!unit.general.isDead && unit.speed < 100) {
            anyCanAct = true;
            if (unit.speed > maxSpeed) {
              maxSpeed = unit.speed;
              maxSpeedUnit = unit;
            }
          }
        }

        // 如果没有任何单位可以达到100速度，给最快单位一些额外加速
        if (!anyCanAct && maxSpeedUnit) {
          maxSpeedUnit.speed += 10 + Math.random() * 10;
          addReport(
            `🔄 加速机制触发：${maxSpeedUnit.side === "player" ? "我方" : "敌方"}${maxSpeedUnit.position}【${maxSpeedUnit.general.name}】获得额外加速`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        // 如果连续多个循环都没有行动，强制退出以避免死循环
        if (loopCount > 50 && !actionThisRound) {
          addReport(`回合等待超时，当前回合无有效行动，进入下一回合...`);
          break;
        }

        continue;
      }
    }

    // 回合统计
    if (actionThisRound) {
      addReport(`本轮共进行了${unitIndex - 1}次有效行动`);
    } else {
      addReport(`本回合没有单位行动`);
    }

    // 回合结束时触发战法效果
    addReport(`===== 回合结束效果 =====`);
    const allAliveGenerals = getAllGenerals().filter((g) => !g.general.isDead);
    for (const generalData of allAliveGenerals) {
      const turnEndContext = {
        type: "turnEnd",
        event: "endOfTurn",
        currentTroops: generalData.general.troops,
        maxTroops: generalData.general.maxTroops,
      };
      triggerSkillEffects(generalData.general, turnEndContext);
    }

    // 如果不是最后一回合，添加回合结束播报
    if (i < maxTurns.value) {
      addReport(`========== 第 ${i} 回合结束！ ==========`);
    } else {
      addReport(`========== 第 ${i} 回合结束！ ==========`);
      addReport("8个回合结束！");
    }

    // 回合间等待时间
    if (i < maxTurns.value) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // 8回合结束后
  addReport("8回合结束！");
  checkGameOverByTurns();
  isBattleActive.value = false;
};

const nextWave = () => {
  currentWave.value++;
  currentTurn.value = 0;
  advanceTime();
  generateEnemyTeam();
  addReport(`第 ${currentWave.value} 波敌人出现！`);
};
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: url('/assets/bg_xuanzhi_1920x1080.jpg') no-repeat center center;
  background-size: cover;
  overflow-y: auto;
}

.game-header {
  padding: 15px 20px;
}

.speed-bar-container {
  margin-bottom: 20px;
}

.speed-bar-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.speed-bar {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 120px;
}

.speed-unit {
  flex: 0 0 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.speed-unit.active {
  border: 2px solid #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.speed-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-bottom: 8px;
  border: 2px solid #667eea;
}

.speed-progress {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.speed-name {
  font-size: 12px;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.damage-text {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 1000;
  animation: damagePop 2s ease-out forwards;
}

.card-speed-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
  padding: 2px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.mini-speed-bar {
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-right: 4px;
}

.mini-speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff9800);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.mini-speed-text {
  font-size: 8px;
  color: #ffd700;
  font-weight: bold;
  min-width: 30px;
}

@keyframes damagePop {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-50px) scale(1.5);
  }
}

.game-info {
  display: flex;
  justify-content: flex-start;
  gap: 40px;
  align-items: center;
  padding: 15px 20px;
}

.ui-top-bar-status {
  width: 100%;
  background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
  background-size: cover;
  padding: 15px 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  transition: all 0.3s ease;
  cursor: help;
}

.info-item:hover {
  transform: translateY(-2px);
}

.info-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.info-item:hover .info-icon-wrapper {
  transform: scale(1.1);
}

.info-icon {
  width: 24px;
  height: 24px;
}

.info-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

/* 悬浮提示框 */
.tooltip-popup {
  position: fixed;
  transform: translate(-50%, 0);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-popup::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(0, 0, 0, 0.85);
}

.info-value {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
}

.command-warning .info-value {
  color: #ff4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}

.game-area {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 30px;
  min-height: 400px;
}

.player-side {
  flex: 1;
  min-height: 530px;
  background-image: url('/assets/ui_frame.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  padding: 60px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.side-label {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.formation.horizontal {
  margin-top: 65px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.card-slot {
  width: 180px;
  height: 280px;
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

.card-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.troops-bar-container {
  margin-bottom: 8px;
  width: 100%;
  display: none;
}

.troops-bar-container.active {
  display: block;
}

.troops-bar {
  width: 100%;
  height: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 7.5px;
  overflow: hidden;
}

.troops-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  border-radius: 7.5px;
  transition: width 0.3s ease;
}

.troops-text {
  display: none;
}

.card {
  width: 100%;
  flex: 1;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(118, 75, 162, 0.05) 100%);
  z-index: 1;
}

.card.enemy::before {
  background: linear-gradient(135deg,
      rgba(231, 76, 60, 0.05) 0%,
      rgba(192, 57, 43, 0.05) 100%);
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.card.selected {
  border: 3px solid #ffd700;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
}

.card.attacking {
  animation: attackHighlight 0.5s ease-in-out;
}

@keyframes attackHighlight {
  0% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  50% {
    box-shadow: 0 0 30px rgba(255, 165, 0, 0.8);
    transform: scale(1.05);
  }

  100% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
}

.card.dead {
  opacity: 0.5;
  filter: grayscale(80%);
  background: rgba(102, 102, 102, 0.8) !important;
}

.card.dead::before {
  opacity: 0.2;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 3;
  position: relative;
}

.card-left-top {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-dynasty {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
}

.card-right-top {
  display: flex;
  align-items: center;
}

.card-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.star.active {
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-middle {
  flex: 1;
  z-index: 1;
  position: relative;
}

.card-troops {
  position: relative;
  z-index: 3;
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  background: linear-gradient(180deg,
      rgba(231, 76, 60, 0.9) 0%,
      rgba(192, 57, 43, 0.9) 100%);
  padding: 8px 20px;
  border-radius: 25px;
  margin-top: auto;
  margin-bottom: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.card-bottom {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 3;
  position: relative;
}

.card-bottom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.card-level {
  font-size: 10px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-command {
  font-size: 12px;
  font-weight: bold;
  color: #f39c12;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-soldier-type {
  font-size: 10px;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-range {
  font-size: 12px;
  font-weight: bold;
  color: #3498db;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-bottom-label {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-area {
    flex-direction: column;
    gap: 20px;
  }

  .formation.horizontal {
    flex-wrap: wrap;
  }

  .card-slot {
    width: 140px;
    height: 220px;
  }

  .card {
    padding: 8px;
  }

  .card-name {
    font-size: 12px;
  }

  .card-dynasty {
    font-size: 8px;
  }

  .card-troops {
    font-size: 18px;
    padding: 4px 12px;
  }

  .card-level,
  .card-command,
  .card-range {
    font-size: 10px;
  }

  .card-soldier-type {
    font-size: 8px;
    padding: 1px 4px;
  }

  .card-bottom-label {
    font-size: 6px;
  }

  .battle-report {
    width: 100%;
    max-width: 100%;
  }

  .game-footer {
    flex-direction: column;
    gap: 10px;
  }

  .action-button {
    padding: 15px;
    font-size: 16px;
  }

  .general-items {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

/* 小屏幕移动端适配 */
@media (max-width: 480px) {
  .card-slot {
    width: 120px;
    height: 180px;
  }

  .card-name {
    font-size: 10px;
  }

  .card-dynasty {
    font-size: 7px;
  }

  .card-troops {
    font-size: 16px;
    padding: 3px 10px;
  }

  .card-level,
  .card-command,
  .card-range {
    font-size: 8px;
  }

  .card-soldier-type {
    font-size: 7px;
    padding: 1px 3px;
  }

  .card-bottom-label {
    font-size: 5px;
  }

  .general-items {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
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
  content: "兵";
  font-size: 10px;
  position: absolute;
  top: -2px;
  right: -12px;
  color: rgba(255, 255, 255, 0.8);
}

.card-stats.simple .command {
  font-size: 20px;
  font-weight: bold;
  color: #4caf50;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
}

.card-stats.simple .command::after {
  content: "统";
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
  content: "距";
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

.tooltip-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.tooltip-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
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
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

.general-item {
  transition: all 0.3s ease;
  height: 100%;
}

.general-item:hover {
  transform: translateY(-2px);
}

.general-item .card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.general-item .card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.general-item .card::before {
  opacity: 0.35;
}

.game-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 15px 20px;
  background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
  background-size: cover;
}

.action-button {
  flex: none;
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  min-width: 100px;
}

.action-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.2);
}

.action-button.recruit {
  background: rgba(255, 255, 255, 0.4);
  color: white;
}

.action-button.recruit:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.6);
}

.action-button.recruit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.2);
}

.action-button.end-turn {
  background: rgba(255, 255, 255, 0.4);
  color: white;
}

.action-button.end-turn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.6);
}

.action-button.next-wave {
  background: rgba(255, 255, 255, 0.4);
  color: white;
}

.action-button.next-wave:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.6);
}

.button-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.action-button:hover .button-icon {
  transform: scale(1.2);
}

.button-text {
  font-weight: bold;
  font-size: 14px;
}

.button-cost {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
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
    flex-direction: row;
    flex-wrap: wrap;
    background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
    background-size: cover;
  }

  .action-button {
    padding: 15px;
  }
}

/* 状态标记样式 */
.card-status {
  position: absolute;
  top: 40px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 4;
}

.status-icon {
  background: rgba(102, 126, 234, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 10px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  cursor: help;
  transition: all 0.2s ease;
}

.status-icon:hover {
  background: rgba(118, 75, 162, 0.9);
  transform: scale(1.05);
}

.status-icon-inner {
  display: block;
  text-align: center;
}

/* Debuff状态标记 - 红色 */
.status-icon.debuff {
  background: rgba(220, 53, 69, 0.85);
  border: 1px solid rgba(255, 200, 200, 0.4);
}

.status-icon.debuff:hover {
  background: rgba(180, 40, 50, 0.9);
}

/* 游戏开始界面 */
.game-start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-start-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.7);
}

.game-start-content {
  position: relative;
  z-index: 1001;
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
  max-width: 500px;
  width: 90%;
}

.game-title {
  font-size: 3rem;
  margin-bottom: 40px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.progress-container {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 10px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.progress-text {
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-title {
    font-size: 2rem;
  }

  .game-start-content {
    padding: 30px;
  }

  .progress-container {
    height: 15px;
  }

  .progress-text {
    font-size: 1rem;
  }
}
</style>
