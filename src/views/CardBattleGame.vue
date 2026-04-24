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
            <span class="info-label">金额:</span>
            <span class="info-value">{{ money }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">波次:</span>
            <span class="info-value">{{ currentWave }}/{{ totalWaves }}</span>
          </div>

          <div
            class="info-item"
            :class="{ 'command-warning': currentCommand > maxCommand }"
          >
            <span class="info-label">统率:</span>
            <span class="info-value"
              >{{ currentCommand }}/{{ maxCommand }}</span
            >
          </div>
        </div>

        <div class="game-area">
          <div
            v-for="(damageText, index) in damageTexts"
            :key="index"
            class="damage-text"
            :style="{
              left: damageText.x + 'px',
              top: damageText.y + 'px',
              animationDelay: damageText.delay + 's',
            }"
          >
            {{ damageText.text }}
          </div>
          <div class="player-side">
            <div class="side-label">我方</div>
            <div class="formation horizontal">
              <div class="card-slot" @click="selectSlot('player', '大营')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && playerFormation.大营 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{ width: playerFormation.大营 ? (playerFormation.大营.troops / (playerFormation.大营.level * 100)) * 100 + '%' : '0%' }"></div>
                    </div>
                    <div class="troops-text">{{ playerFormation.大营 ? playerFormation.大营.troops : 0 }}</div>
                  </div>
                  <div
                    v-if="playerFormation.大营"
                    class="card player"
                    :style="{
                      backgroundImage: `url(${playerFormation.大营.avatar ? API_BASE_URL + playerFormation.大营.avatar : (playerFormation.大营.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                    }"
                    :class="{
                      selected: selectedSlot === 'player-大营',
                      dead: playerFormation.大营.isDead,
                      attacking: attackingCard === 'player-大营',
                    }"
                    data-card-side="player"
                    data-card-position="大营"
                    @contextmenu="showTooltip('player-大营', $event)"
                    @click="hideTooltip"
                  >
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">{{ playerFormation.大营.dynasty }}</div>
                        <div class="card-name">{{ playerFormation.大营.name }}</div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars" :class="{
                          'star-level-3': playerFormation.大营.level === 3,
                          'star-level-4': playerFormation.大营.level === 4,
                          'star-level-5': playerFormation.大营.level === 5
                        }">
                          <span
                            v-for="i in playerFormation.大营.level"
                            :key="i"
                            class="star active"
                            >★</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="card-middle">
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ playerFormation.大营.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{ playerFormation.大营.command }}</span>
                        <span class="card-bottom-label">统</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{ playerFormation.大营.soldierType }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{ playerFormation.大营.attackRange }}</span>
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
                      <div class="troops-fill" :style="{ width: playerFormation.中军 ? (playerFormation.中军.troops / (playerFormation.中军.level * 100)) * 100 + '%' : '0%' }"></div>
                    </div>
                    <div class="troops-text">{{ playerFormation.中军 ? playerFormation.中军.troops : 0 }}</div>
                  </div>
                  <div
                    v-if="playerFormation.中军"
                    class="card player"
                    :style="{
                      backgroundImage: `url(${playerFormation.中军.avatar ? API_BASE_URL + playerFormation.中军.avatar : (playerFormation.中军.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                    }"
                    :class="{
                      selected: selectedSlot === 'player-中军',
                      dead: playerFormation.中军.isDead,
                      attacking: attackingCard === 'player-中军',
                    }"
                    data-card-side="player"
                    data-card-position="中军"
                    @contextmenu="showTooltip('player-中军', $event)"
                    @click="hideTooltip"
                  >
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">{{ playerFormation.中军.dynasty }}</div>
                        <div class="card-name">{{ playerFormation.中军.name }}</div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars" :class="{
                          'star-level-3': playerFormation.中军.level === 3,
                          'star-level-4': playerFormation.中军.level === 4,
                          'star-level-5': playerFormation.中军.level === 5
                        }">
                          <span
                            v-for="i in playerFormation.中军.level"
                            :key="i"
                            class="star active"
                            >★</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ playerFormation.中军.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{ playerFormation.中军.command }}</span>
                        <span class="card-bottom-label">统</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{ playerFormation.中军.soldierType }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{ playerFormation.中军.attackRange }}</span>
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
                      <div class="troops-fill" :style="{ width: playerFormation.前锋 ? (playerFormation.前锋.troops / (playerFormation.前锋.level * 100)) * 100 + '%' : '0%' }"></div>
                    </div>
                    <div class="troops-text">{{ playerFormation.前锋 ? playerFormation.前锋.troops : 0 }}</div>
                  </div>
                  <div
                    v-if="playerFormation.前锋"
                    class="card player"
                    :style="{
                      backgroundImage: `url(${playerFormation.前锋.avatar ? API_BASE_URL + playerFormation.前锋.avatar : (playerFormation.前锋.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                    }"
                    :class="{
                      selected: selectedSlot === 'player-前锋',
                      dead: playerFormation.前锋.isDead,
                      attacking: attackingCard === 'player-前锋',
                    }"
                    data-card-side="player"
                    data-card-position="前锋"
                    @contextmenu="showTooltip('player-前锋', $event)"
                    @click="hideTooltip"
                  >
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">{{ playerFormation.前锋.dynasty }}</div>
                        <div class="card-name">{{ playerFormation.前锋.name }}</div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars" :class="{
                          'star-level-3': playerFormation.前锋.level === 3,
                          'star-level-4': playerFormation.前锋.level === 4,
                          'star-level-5': playerFormation.前锋.level === 5
                        }">
                          <span
                            v-for="i in playerFormation.前锋.level"
                            :key="i"
                            class="star active"
                            >★</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ playerFormation.前锋.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{ playerFormation.前锋.command }}</span>
                        <span class="card-bottom-label">统</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{ playerFormation.前锋.soldierType }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{ playerFormation.前锋.attackRange }}</span>
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

          <div class="battle-report">
            <div class="report-header">
              <h3>战况播报</h3>
            </div>
            <div class="report-content">
              <div
                v-for="(report, index) in battleReports"
                :key="index"
                class="report-item"
                v-html="report"
              ></div>
            </div>
          </div>

          <div class="player-side enemy">
            <div class="side-label">敌方</div>
            <div class="formation horizontal enemy">
              <div class="card-slot" @click="selectSlot('enemy', '前锋')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && enemyFormation.前锋 }">
                    <div class="troops-bar">
                      <div class="troops-fill" :style="{ width: enemyFormation.前锋 ? (enemyFormation.前锋.troops / (enemyFormation.前锋.level * 100)) * 100 + '%' : '0%' }"></div>
                    </div>
                    <div class="troops-text">{{ enemyFormation.前锋 ? enemyFormation.前锋.troops : 0 }}</div>
                  </div>
                  <div
                    v-if="enemyFormation.前锋"
                    class="card enemy"
                    :style="{
                      backgroundImage: `url(${enemyFormation.前锋.avatar ? API_BASE_URL + enemyFormation.前锋.avatar : (enemyFormation.前锋.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                    }"
                    :class="{
                      selected: selectedSlot === 'enemy-前锋',
                      dead: enemyFormation.前锋.isDead,
                      attacking: attackingCard === 'enemy-前锋',
                    }"
                    data-card-side="enemy"
                    data-card-position="前锋"
                    @contextmenu="showTooltip('enemy-前锋', $event)"
                    @click="hideTooltip"
                  >
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">{{ enemyFormation.前锋.dynasty }}</div>
                        <div class="card-name">{{ enemyFormation.前锋.name }}</div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars" :class="{
                          'star-level-3': enemyFormation.前锋.level === 3,
                          'star-level-4': enemyFormation.前锋.level === 4,
                          'star-level-5': enemyFormation.前锋.level === 5
                        }">
                          <span
                            v-for="i in enemyFormation.前锋.level"
                            :key="i"
                            class="star active"
                            >★</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ enemyFormation.前锋.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{ enemyFormation.前锋.command }}</span>
                        <span class="card-bottom-label">统</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{ enemyFormation.前锋.soldierType }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{ enemyFormation.前锋.attackRange }}</span>
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
                      <div class="troops-fill" :style="{ width: enemyFormation.中军 ? (enemyFormation.中军.troops / (enemyFormation.中军.level * 100)) * 100 + '%' : '0%' }"></div>
                    </div>
                    <div class="troops-text">{{ enemyFormation.中军 ? enemyFormation.中军.troops : 0 }}</div>
                  </div>
                  <div
                    v-if="enemyFormation.中军"
                    class="card enemy"
                    :style="{
                      backgroundImage: `url(${enemyFormation.中军.avatar ? API_BASE_URL + enemyFormation.中军.avatar : (enemyFormation.中军.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                    }"
                    :class="{
                      selected: selectedSlot === 'enemy-中军',
                      dead: enemyFormation.中军.isDead,
                      attacking: attackingCard === 'enemy-中军',
                    }"
                    data-card-side="enemy"
                    data-card-position="中军"
                    @contextmenu="showTooltip('enemy-中军', $event)"
                    @click="hideTooltip"
                  >
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">{{ enemyFormation.中军.dynasty }}</div>
                        <div class="card-name">{{ enemyFormation.中军.name }}</div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars" :class="{
                          'star-level-3': enemyFormation.中军.level === 3,
                          'star-level-4': enemyFormation.中军.level === 4,
                          'star-level-5': enemyFormation.中军.level === 5
                        }">
                          <span
                            v-for="i in enemyFormation.中军.level"
                            :key="i"
                            class="star active"
                            >★</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ enemyFormation.中军.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{ enemyFormation.中军.command }}</span>
                        <span class="card-bottom-label">统</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{ enemyFormation.中军.soldierType }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{ enemyFormation.中军.attackRange }}</span>
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
                      <div class="troops-fill" :style="{ width: enemyFormation.大营 ? (enemyFormation.大营.troops / (enemyFormation.大营.level * 100)) * 100 + '%' : '0%' }"></div>
                    </div>
                    <div class="troops-text">{{ enemyFormation.大营 ? enemyFormation.大营.troops : 0 }}</div>
                  </div>
                  <div
                    v-if="enemyFormation.大营"
                    class="card enemy"
                    :style="{
                      backgroundImage: `url(${enemyFormation.大营.avatar ? API_BASE_URL + enemyFormation.大营.avatar : (enemyFormation.大营.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                    }"
                    :class="{
                      selected: selectedSlot === 'enemy-大营',
                      dead: enemyFormation.大营.isDead,
                      attacking: attackingCard === 'enemy-大营',
                    }"
                    data-card-side="enemy"
                    data-card-position="大营"
                    @contextmenu="showTooltip('enemy-大营', $event)"
                    @click="hideTooltip"
                  >
                    <div class="card-top">
                      <div class="card-left-top">
                        <div class="card-dynasty">{{ enemyFormation.大营.dynasty }}</div>
                        <div class="card-name">{{ enemyFormation.大营.name }}</div>
                      </div>
                      <div class="card-right-top">
                        <div class="card-stars" :class="{
                          'star-level-3': enemyFormation.大营.level === 3,
                          'star-level-4': enemyFormation.大营.level === 4,
                          'star-level-5': enemyFormation.大营.level === 5
                        }">
                          <span
                            v-for="i in enemyFormation.大营.level"
                            :key="i"
                            class="star active"
                            >★</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="card-bottom">
                      <div class="card-bottom-item">
                        <span class="card-level">Lv.{{ enemyFormation.大营.level }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-command">{{ enemyFormation.大营.command }}</span>
                        <span class="card-bottom-label">统</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-soldier-type">{{ enemyFormation.大营.soldierType }}</span>
                      </div>
                      <div class="card-bottom-item">
                        <span class="card-range">{{ enemyFormation.大营.attackRange }}</span>
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

        <div
          v-if="showGeneralList"
          class="general-list-overlay"
          @click="closeGeneralList"
        >
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
                @click="deployGeneral(general); hideTooltip()"
                @contextmenu="showGeneralTooltip(general, $event)"
              >
                <div class="card player" :style="{
                    backgroundImage: `url(${general.avatar ? API_BASE_URL + general.avatar : (general.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                  }">
                  <div class="card-top">
                    <div class="card-left-top">
                      <div class="card-dynasty">{{ general.dynasty }}</div>
                      <div class="card-name">{{ general.name }}</div>
                    </div>
                    <div class="card-right-top">
                      <div class="card-stars" :class="{
                        'star-level-3': general.level === 3,
                        'star-level-4': general.level === 4,
                        'star-level-5': general.level === 5
                      }">
                        <span
                          v-for="i in general.level"
                          :key="i"
                          class="star active"
                          >★</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="card-middle">
                  </div>
                  <div class="card-bottom">
                    <div class="card-bottom-item">
                      <span class="card-level">Lv.{{ general.level }}</span>
                    </div>
                    <div class="card-bottom-item">
                      <span class="card-command">{{ general.command }}</span>
                      <span class="card-bottom-label">统</span>
                    </div>
                    <div class="card-bottom-item">
                      <span class="card-soldier-type">{{ general.soldierType }}</span>
                    </div>
                    <div class="card-bottom-item">
                      <span class="card-range">{{ general.attackRange }}</span>
                      <span class="card-bottom-label">距</span>
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
              <button class="tooltip-close" @click="hideTooltip">×</button>
            </div>
            <div class="tooltip-stats">
              <div class="tooltip-stat-row">
                <span>攻击: {{ tooltipData.attack }} (<span class="growth-value">{{ tooltipData.attackGrowth || 0 }}</span>)</span>
                <span>防御: {{ tooltipData.defense }} (<span class="growth-value">{{ tooltipData.defenseGrowth || 0 }}</span>)</span>
              </div>
              <div class="tooltip-stat-row">
                <span>策略: {{ tooltipData.strategy }} (<span class="growth-value">{{ tooltipData.strategyGrowth || 0 }}</span>)</span>
                <span>速度: {{ tooltipData.speed }} (<span class="growth-value">{{ tooltipData.speedGrowth || 0 }}</span>)</span>
              </div>
              <div class="tooltip-stat-row">
                <span>兵力: {{ tooltipData.troops }}</span>
                <span>攻击距离: {{ tooltipData.attackRange }}</span>
              </div>
              <div class="tooltip-stat-row">
                <span>攻城: {{ tooltipData.siege }} (<span class="growth-value">{{ tooltipData.siegeGrowth || 0 }}</span>)</span>
                <span>统御: {{ tooltipData.command }} (<span class="growth-value">{{ tooltipData.commandGrowth || 0 }}</span>)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="game-footer">
          <button
            class="action-button recruit"
            @click="openCardPackModal"
            :disabled="money < 100"
          >
            <span class="button-icon">📦</span>
            <span class="button-text">卡包招募</span>
            <span class="button-cost">100金额</span>
          </button>
          <button class="action-button end-turn" @click="endTurn">
            <span class="button-text">开始</span>
          </button>
          <button class="action-button next-wave" @click="nextWave">
            <span class="button-text">下一轮</span>
          </button>
        </div>

        <!-- 卡包模态框 -->
        <div v-if="showCardPackModal" class="modal-overlay">
          <div class="modal-content card-pack-modal">
            <div class="modal-header">
              <h2>选择卡包</h2>
              <button class="modal-close" @click="closeCardPackModal">×</button>
            </div>
            <div class="modal-body">
              <div v-if="!isOpeningPack" class="card-pack-selection">
                <div 
                  class="card-pack-option" 
                  :class="{ active: selectedCardPack === 'sui' }"
                  @click="selectCardPack('sui')"
                >
                  <h3>隋朝卡包</h3>
                  <p>包含隋朝时期的武将</p>
                  <p class="pack-price">价格: $100</p>
                </div>
                <div 
                  class="card-pack-option" 
                  :class="{ active: selectedCardPack === 'tang' }"
                  @click="selectCardPack('tang')"
                >
                  <h3>唐朝卡包</h3>
                  <p>包含唐朝时期的武将</p>
                  <p class="pack-price">价格: $100</p>
                </div>
              </div>
              <div v-else class="pack-opening">
                <h3>开包中...</h3>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: packOpeningProgress + '%' }"></div>
                </div>
                <p>鼠标右滑开包</p>
              </div>
              <div v-if="packResult.length > 0" class="pack-result">
                <h3>获得武将</h3>
                <div class="pack-generals">
                  <div v-for="(general, index) in packResult" :key="index" class="pack-general-item">
                    <div class="card player" :style="{
                      backgroundImage: `url(${general.avatar ? API_BASE_URL + general.avatar : (general.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp')})`
                    }">
                      <div class="card-top">
                        <div class="card-left-top">
                          <div class="card-dynasty">{{ general.dynasty }}</div>
                          <div class="card-name">{{ general.name }}</div>
                        </div>
                        <div class="card-right-top">
                          <div class="card-stars" :class="{
                            'star-level-3': general.level === 3,
                            'star-level-4': general.level === 4,
                            'star-level-5': general.level === 5
                          }">
                            <span
                              v-for="i in general.level"
                              :key="i"
                              class="star active"
                              >★</span
                            >
                          </div>
                        </div>
                      </div>
                      <div class="card-bottom">
                        <div class="card-bottom-item">
                          <span class="card-level">Lv.{{ general.level }}</span>
                        </div>
                        <div class="card-bottom-item">
                          <span class="card-command">{{ general.command }}</span>
                          <span class="card-bottom-label">统</span>
                        </div>
                        <div class="card-bottom-item">
                          <span class="card-soldier-type">{{ general.soldierType }}</span>
                        </div>
                        <div class="card-bottom-item">
                          <span class="card-range">{{ general.attackRange }}</span>
                          <span class="card-bottom-label">距</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                class="modal-button cancel" 
                @click="closeCardPackModal"
                :disabled="isOpeningPack"
              >
                取消
              </button>
              <button 
                class="modal-button open" 
                @click="openCardPack"
                :disabled="isOpeningPack || money < 100"
              >
                抽取
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        v-if="showAuthModal"
        :is-login="isLogin"
        @close="showAuthModal = false"
        @login="handleLogin"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AuthModal from "../components/AuthModal.vue";

const isLoggedIn = ref(false);
const showAuthModal = ref(false);
const isLogin = ref(true);

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
const maxCommand = ref(8);
const currentCommand = ref(0);

// API配置
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// 人物数据
const characters = ref<any[]>([]);
const loadingCharacters = ref(false);

// 兵种类型
type SoldierType = "步兵" | "弓兵" | "骑兵";

// 兵种克制关系
const soldierType克制 = {
  骑兵: "步兵",
  步兵: "弓兵",
  弓兵: "骑兵",
};

// 随机兵种
const getRandomSoldierType = (): SoldierType => {
  const types: SoldierType[] = ["步兵", "弓兵", "骑兵"];
  return types[Math.floor(Math.random() * types.length)];
};

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

// 卡包相关状态
const showCardPackModal = ref(false);
const selectedCardPack = ref('sui'); // sui: 隋朝, tang: 唐朝
const isOpeningPack = ref(false);
const packOpeningProgress = ref(0);
const packResult = ref<General[]>([]);

// 卡包概率配置
const cardPackProbabilities = {
  level3: 70,  // 3星概率70%
  level4: 20,  // 4星概率20%
  level5: 10   // 5星概率10%
};

interface General {
  id: number;
  name: string;
  attack: number;
  attackGrowth: number;
  defense: number;
  defenseGrowth: number;
  strategy: number;
  strategyGrowth: number;
  speed: number;
  speedGrowth: number;
  attackRange: number;
  siege: number;
  siegeGrowth: number;
  troops: number;
  maxTroops: number;
  level: number;
  command: number;
  commandGrowth: number;
  isDead: boolean;
  dynasty?: string;
  soldierType?: SoldierType;
  avatar?: string;
  gender?: string;
}

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
    if (g) total += g.command;
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
  const formation = side === "player" ? playerFormation.value : enemyFormation.value;
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

// 卡包相关函数
const openCardPackModal = () => {
  showCardPackModal.value = true;
};

const closeCardPackModal = () => {
  showCardPackModal.value = false;
  isOpeningPack.value = false;
  packOpeningProgress.value = 0;
  packResult.value = [];
};

const selectCardPack = (packType: string) => {
  selectedCardPack.value = packType;
};

const openCardPack = async () => {
  if (money.value < 100) {
    addReport("金额不足，无法抽取卡包！");
    return;
  }

  money.value -= 100;
  isOpeningPack.value = true;
  packOpeningProgress.value = 0;
  packResult.value = [];

  // 开包动画（模拟鼠标右滑）
  const animationDuration = 1500; // 1.5秒
  const stepDuration = 50; // 每50毫秒更新一次
  const steps = animationDuration / stepDuration;

  for (let i = 0; i <= steps; i++) {
    packOpeningProgress.value = (i / steps) * 100;
    await new Promise(resolve => setTimeout(resolve, stepDuration));
  }

  // 生成卡包结果
  const packGenerals: General[] = [];
  // 每个卡包包含5张卡
  for (let i = 0; i < 5; i++) {
    const level = getRandomLevel();
    packGenerals.push(generatePackGeneral(level));
  }

  packResult.value = packGenerals;
  
  // 显示获得的武将
  packGenerals.forEach(general => {
    generals.value.push(general);
    addReport(
      `恭喜获得【${general.name}】！等级:${general.level} 攻:${general.attack} 防:${general.defense} 策:${general.strategy} 速:${general.speed} 兵:${general.troops} 距:${general.attackRange} 统率:${general.command} 兵种:${general.soldierType}`
    );
  });
};

// 根据概率获取随机等级
const getRandomLevel = (): number => {
  const random = Math.random() * 100;
  if (random <= cardPackProbabilities.level3) {
    return 3;
  } else if (random <= cardPackProbabilities.level3 + cardPackProbabilities.level4) {
    return 4;
  } else {
    return 5;
  }
};

// 生成卡包武将
const generatePackGeneral = (level: number): General => {
  const commandValues = [2, 2.5, 3, 3.5];
  const command = commandValues[Math.floor(Math.random() * commandValues.length)];
  const troops = level * 100;

  // 从API获取的人物中随机选择，或者使用默认人物
  let character = null;
  if (characters.value.length > 0) {
    character = characters.value[Math.floor(Math.random() * characters.value.length)];
  }

  // 根据卡包类型选择不同朝代的武将
  let generalName = '';
  let dynasty = '';
  if (selectedCardPack.value === 'sui') {
    // 隋朝武将
    const suiDynastyGenerals = ['杨坚', '杨广', '杨素', '高颎', '韩擒虎', '贺若弼', '史万岁', '李密', '窦建德', '王世充'];
    generalName = character?.name || suiDynastyGenerals[Math.floor(Math.random() * suiDynastyGenerals.length)];
    dynasty = '隋朝';
  } else {
    // 唐朝武将
    const tangDynastyGenerals = ['李渊', '李世民', '李治', '李隆基', '郭子仪', '李光弼', '李靖', '李勣', '秦琼', '尉迟恭'];
    generalName = character?.name || tangDynastyGenerals[Math.floor(Math.random() * tangDynastyGenerals.length)];
    dynasty = '唐朝';
  }

  return {
    id: character?.id || Date.now() + Math.random(),
    name: generalName,
    attack: Math.floor(Math.random() * 100) + 50,
    attackGrowth: Math.round((Math.random() * 3) * 100) / 100,
    defense: Math.floor(Math.random() * 100) + 50,
    defenseGrowth: Math.round((Math.random() * 3) * 100) / 100,
    strategy: Math.floor(Math.random() * 100) + 50,
    strategyGrowth: Math.round((Math.random() * 3) * 100) / 100,
    speed: Math.floor(Math.random() * 100) + 50,
    speedGrowth: Math.round((Math.random() * 3) * 100) / 100,
    attackRange: Math.floor(Math.random() * 3) + 1,
    siege: Math.floor(Math.random() * 100) + 50,
    siegeGrowth: Math.round((Math.random() * 3) * 100) / 100,
    troops: troops,
    maxTroops: troops,
    level: level,
    command: command,
    commandGrowth: Math.round((Math.random() * 3) * 100) / 100,
    isDead: false,
    dynasty: dynasty,
    soldierType: getRandomSoldierType(),
    avatar: character?.avatar,
    gender: character?.gender,
  };
};

const deployGeneral = (general: General) => {
  if (selectedSlot.value) {
    const [, position] = selectedSlot.value.split("-");
    const oldGeneral =
      playerFormation.value[position as keyof typeof playerFormation.value];
    const oldCommand = oldGeneral ? oldGeneral.command : 0;
    const newTotalCommand = currentCommand.value - oldCommand + general.command;

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
    const commandValues = [2, 2.5, 3, 3.5];
    const command =
      commandValues[Math.floor(Math.random() * commandValues.length)];
    const troops = level * 100;

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
      attackGrowth: Math.round((Math.random() * 3) * 100) / 100,
      defense: Math.floor(Math.random() * 100) + 50,
      defenseGrowth: Math.round((Math.random() * 3) * 100) / 100,
      strategy: Math.floor(Math.random() * 100) + 50,
      strategyGrowth: Math.round((Math.random() * 3) * 100) / 100,
      speed: Math.floor(Math.random() * 100) + 50,
      speedGrowth: Math.round((Math.random() * 3) * 100) / 100,
      attackRange: Math.floor(Math.random() * 3) + 1,
      siege: Math.floor(Math.random() * 100) + 50,
      siegeGrowth: Math.round((Math.random() * 3) * 100) / 100,
      troops: troops,
      maxTroops: troops,
      level: level,
      command: command,
      commandGrowth: Math.round((Math.random() * 3) * 100) / 100,
      isDead: false,
      dynasty: "夏朝",
      soldierType: getRandomSoldierType(),
      avatar: character?.avatar,
      gender: character?.gender,
    };
  });
  addReport("敌方队伍已集结完毕！");
};

const endTurn = () => {
  startBattle();
};

const advanceTime = () => {
  currentYear.value += 10;
  currentWave.value += 1;

  if (currentYear.value > -1600) {
    addReport("恭喜通关夏朝！");
    resetGame();
  }
};

const addReport = (message: string, general?: General, side?: 'player' | 'enemy') => {
  let formattedMessage = message;
  
  if (general) {
    const avatarUrl = general.avatar 
      ? `${API_BASE_URL}${general.avatar}` 
      : (general.gender === '女' 
        ? `${API_BASE_URL}/public/images/ancient_character_women.webp` 
        : `${API_BASE_URL}/public/images/ancient_character_men.webp`);
    
    const sideColor = side === 'player' ? '#667eea' : '#e74c3c';
    
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

const getCardSpeed = (side: "player" | "enemy", position: string): number => {
  // 查找当前卡牌在speedUnits中的速度值
  const unit = speedUnits.value.find(
    (u) => u.side === side && u.position === position,
  );
  return unit ? unit.speed : 0;
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

        // 执行攻击
        const targets = getTargetsInRange({
          general: readyUnit.general,
          side: readyUnit.side,
          position: readyUnit.position,
        });

        if (targets.length > 0) {
          addReport(`可攻击目标：${targets.length}个`);
          const target = targets[Math.floor(Math.random() * targets.length)];
          await performAttackWithAnimation(
            {
              general: readyUnit.general,
              side: readyUnit.side,
              position: readyUnit.position,
            },
            target,
          );
        } else {
          addReport(`范围内没有可攻击的目标！`);
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
  max-width: 1800px;
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
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%);
  z-index: 1;
}

.card.enemy::before {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.85) 0%, rgba(192, 57, 43, 0.85) 100%);
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

.card-stars.star-level-3 {
  border: 1px solid white;
  padding: 2px 4px;
  border-radius: 4px;
}

.card-stars.star-level-4 {
  border: 1px solid #4caf50;
  padding: 2px 4px;
  border-radius: 4px;
}

.card-stars.star-level-5 {
  border: 1px solid #ffd700;
  padding: 2px 4px;
  border-radius: 4px;
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
  background: linear-gradient(180deg, rgba(231, 76, 60, 0.9) 0%, rgba(192, 57, 43, 0.9) 100%);
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

.growth-value {
  color: #4caf50;
  font-weight: bold;
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
  width: 350px;
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
  max-height: 600px;
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

/* 登录模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease;
}

.modal-button.cancel {
  background-color: #f0f0f0;
  color: #333;
}

.modal-button.cancel:hover {
  background-color: #e0e0e0;
}

.modal-button.confirm {
  background-color: #4caf50;
  color: white;
}

.modal-button.confirm:hover {
  background-color: #45a049;
}

.modal-button.open {
  background-color: #2196f3;
  color: white;
}

.modal-button.open:hover {
  background-color: #1976d2;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.error-message {
  color: #f44336;
  margin-top: 5px;
  font-size: 14px;
}

.success-message {
  color: #4caf50;
  margin-top: 5px;
  font-size: 14px;
}

/* 卡包模态框样式 */
.card-pack-modal {
  max-width: 600px;
}

.card-pack-selection {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.card-pack-option {
  flex: 1;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.card-pack-option:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-pack-option.active {
  border-color: #4caf50;
  background: #e8f5e9;
}

.card-pack-option h3 {
  margin-top: 0;
  color: #333;
}

.pack-price {
  font-weight: bold;
  color: #4caf50;
}

.pack-opening {
  text-align: center;
  padding: 30px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin: 20px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  transition: width 0.3s ease;
}

.pack-result {
  margin-top: 20px;
}

.pack-generals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.pack-general-item {
  text-align: center;
}

.pack-general-item .card {
  width: 100%;
  max-width: 120px;
  margin: 0 auto;
}
</style>
