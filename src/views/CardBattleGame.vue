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
    <div v-else class="game-container" :class="{ 'screen-shake': isScreenShaking }">
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
            <div class="info-item" @mouseenter="showHeaderTooltip($event, 'conscript')" @mouseleave="hideHeaderTooltip">
              <img src="/assets/command.webp" alt="征召兵" class="info-icon">
              <span class="info-value">{{ displayAvailableConscripts }}/{{ displayTotalConscripts }}</span>
            </div>
          </div>
        </div>

        <!-- 悬浮提示框 -->
        <div v-show="tooltip.visible" class="tooltip-popup" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
          {{ tooltip.text }}
        </div>

        <div class="game-area">
          <div v-if="showRelicSelector" class="relic-selector-mask">
            <div class="relic-selector-panel">
              <h3>请选择本局遗物（3选1）</h3>
              <div class="cui-jue-dialog">
                <img class="cui-jue-portrait" :src="cuiJuePortrait" alt="崔珏" />
                <div class="cui-jue-bubble">
                  {{ cuiJueRelicDialogLine }}
                </div>
              </div>
              <div class="relic-candidate-list">
                <div v-for="relic in playerRelicCandidates" :key="relic.id" class="relic-candidate-card" :class="`rarity-${relic.rarity}`"
                  @click="selectPlayerRelic(relic)">
                  <div class="relic-candidate-icon">{{ relic.icon }}</div>
                  <div class="relic-candidate-name">{{ relic.name }}</div>
                  <div class="relic-candidate-effect">{{ relic.effectText }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="showVictoryRewardSelector" class="relic-selector-mask">
            <div class="relic-selector-panel reward-panel">
              <h3>战斗胜利 · 崔珏裁赏（三选一）</h3>
              <div class="cui-jue-dialog">
                <img class="cui-jue-portrait" :src="cuiJuePortrait" alt="崔珏" />
                <div class="cui-jue-bubble">{{ cuiJueRewardDialogLine }}</div>
              </div>
              <div class="relic-candidate-list">
                <div
                  v-for="reward in victoryRewardOptions"
                  :key="reward.id"
                  class="relic-candidate-card reward-candidate-card"
                  @click="selectVictoryReward(reward)"
                >
                  <div class="relic-candidate-icon">{{ reward.icon }}</div>
                  <div class="relic-candidate-name">{{ reward.name }}</div>
                  <div class="relic-candidate-effect">{{ reward.description }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="showLayerRewardSelector" class="relic-selector-mask">
            <div class="relic-selector-panel reward-panel layer-reward-panel">
              <h3>第 {{ currentAct }} 层完成 · 崔珏犒赏</h3>
              <div class="cui-jue-dialog">
                <img class="cui-jue-portrait" :src="cuiJuePortrait" alt="崔珏" />
                <div class="cui-jue-bubble">{{ layerRewardDialogLine }}</div>
              </div>
              <div class="relic-candidate-list">
                <div
                  v-for="reward in layerRewardOptions"
                  :key="reward.id"
                  class="relic-candidate-card reward-candidate-card"
                  @click="selectLayerReward(reward)"
                >
                  <div class="relic-candidate-icon">{{ reward.icon }}</div>
                  <div class="relic-candidate-name">{{ reward.name }}</div>
                  <div class="relic-candidate-effect">{{ reward.description }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-for="(damageText, index) in damageTexts" :key="index" class="damage-text"
            :class="[`damage-${damageText.kind || 'normal'}`, { crit: !!damageText.critical }]" :style="{
            left: damageText.x + 'px',
            top: damageText.y + 'px',
            animationDelay: damageText.delay + 's',
          }">
            <span v-if="damageText.tag" class="damage-tag">{{ damageText.tag }}</span>{{ damageText.text }}
          </div>
          <div v-for="(quoteText, index) in quoteTexts" :key="index" class="quote-text" :style="{
            left: quoteText.x + 'px',
            top: quoteText.y + 'px',
            animationDelay: quoteText.delay + 's',
          }">
            {{ quoteText.text }}
          </div>
          <div v-if="!showBattleBoard" class="middle-hub">
            <div class="middle-hub-left">
              <div class="event-map-panel">
                <div class="event-map-header">
                  <span>事件树 · 当前可选层 {{ currentMapFloor }}</span>
                </div>
                <div class="event-map-board">
                  <svg class="event-map-links" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      v-for="line in mapLinkLines"
                      :key="line.id"
                      :d="line.path"
                      class="event-map-link"
                      :class="{ reachable: line.reachable, visited: line.visited }"
                    />
                  </svg>
                  <button
                    v-for="node in (runMap?.nodes || [])"
                    :key="node.id"
                    class="event-node-btn"
                    :class="[
                      `type-${node.type}`,
                      {
                        selectable: canSelectMapNode(node),
                        visited: node.visited,
                        pending: pendingNodeId === node.id,
                        current: runMap?.currentNodeId === node.id,
                      },
                    ]"
                    :style="getNodeStyle(node)"
                    :disabled="!canSelectMapNode(node)"
                    :title="`第${node.floor}层 · ${nodeTypeTitle[node.type]}`"
                    @click="selectEventNode(node)"
                  >
                    <img class="event-node-icon" :src="mapNodeIconByType[node.type]" :alt="nodeTypeTitle[node.type]" />
                  </button>
                  <div class="map-legend">
                    <div class="map-legend-header">
                      <div class="map-legend-title">图例</div>
                      <button class="map-legend-toggle" @click="toggleMapLegend">
                        {{ isMapLegendCollapsed ? "展开" : "收起" }}
                      </button>
                    </div>
                    <div v-if="!isMapLegendCollapsed">
                      <div
                        v-for="item in mapLegendItems"
                        :key="item.type"
                        class="map-legend-item"
                      >
                        <img class="map-legend-icon" :src="item.icon" :alt="item.label" />
                        <span class="map-legend-text">{{ item.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="middle-hub-right">
              <BattleReport :reports="battleReports" />
            </div>
          </div>
          <button
            v-if="showBattleBoard"
            class="map-toggle-btn"
            @click="showBattleMapDrawer = !showBattleMapDrawer"
          >
            {{ showBattleMapDrawer ? "收起事件树" : "展开事件树" }}
          </button>
          <div v-if="showBattleBoard" class="battle-map-drawer" :class="{ open: showBattleMapDrawer }">
            <div class="event-map-panel">
              <div class="event-map-header">
                <span>事件树 · 当前可选层 {{ currentMapFloor }}</span>
              </div>
              <div class="event-map-board">
                <svg class="event-map-links" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    v-for="line in mapLinkLines"
                    :key="line.id"
                    :d="line.path"
                    class="event-map-link"
                    :class="{ reachable: line.reachable, visited: line.visited }"
                  />
                </svg>
                <button
                  v-for="node in (runMap?.nodes || [])"
                  :key="node.id"
                  class="event-node-btn"
                  :class="[
                    `type-${node.type}`,
                    {
                      selectable: canSelectMapNode(node),
                      visited: node.visited,
                      pending: pendingNodeId === node.id,
                      current: runMap?.currentNodeId === node.id,
                    },
                  ]"
                  :style="getNodeStyle(node)"
                  :disabled="!canSelectMapNode(node)"
                  :title="`第${node.floor}层 · ${nodeTypeTitle[node.type]}`"
                  @click="selectEventNode(node)"
                >
                  <img class="event-node-icon" :src="mapNodeIconByType[node.type]" :alt="nodeTypeTitle[node.type]" />
                </button>
                <div class="map-legend">
                  <div class="map-legend-header">
                    <div class="map-legend-title">图例</div>
                    <button class="map-legend-toggle" @click="toggleMapLegend">
                      {{ isMapLegendCollapsed ? "展开" : "收起" }}
                    </button>
                  </div>
                  <div v-if="!isMapLegendCollapsed">
                    <div
                      v-for="item in mapLegendItems"
                      :key="item.type"
                      class="map-legend-item"
                    >
                      <img class="map-legend-icon" :src="item.icon" :alt="item.label" />
                      <span class="map-legend-text">{{ item.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="showBattleBoard" class="battle-stage">
          <div class="player-side">
            <div class="side-label">我方</div>
            <div class="relic-bar">
              <div
                v-for="relic in playerRelics"
                :key="relic.id"
                class="relic-item"
                :class="`rarity-${relic.rarity}`"
                :title="getRelicTooltip(relic)"
              >
                <span class="relic-icon">{{ relic.icon }}</span>
                <span class="relic-name">{{ relic.name }}</span>
              </div>
              <div v-if="playerRelics.length === 0" class="relic-item empty">未选择遗物</div>
            </div>
            <div class="troop-ops-bar">
              <button
                class="relic-auto-btn"
                :disabled="isBattleActive"
                @click="autoAllocateTroopsEvenly"
              >
                自动分配兵力
              </button>
            </div>
            <div class="formation horizontal">
              <div class="card-slot" @click="selectSlot('player', '大营')">
                <div class="card-container">
                  <div class="troops-bar-container" :class="{ active: isBattleActive && playerFormation.大营 }">
                    <div class="troops-bar" @mousedown.stop="handleTroopsBarMouseDown('大营', $event)">
                      <div class="troops-fill" :style="{
                        width: playerFormation.大营
                          ? (playerFormation.大营.troops /
                            playerFormation.大营.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                      <div class="troops-text">
                        {{ playerFormation.大营 ? playerFormation.大营.troops : 0 }}
                      </div>
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
                            active: i <= getSynthStar(playerFormation.大营),
                            enhanced: getSynthStar(playerFormation.大营) > 0,
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <StatusEffects :general="playerFormation.大营" />
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
                    <div class="troops-bar" @mousedown.stop="handleTroopsBarMouseDown('中军', $event)">
                      <div class="troops-fill" :style="{
                        width: playerFormation.中军
                          ? (playerFormation.中军.troops /
                            playerFormation.中军.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                      <div class="troops-text">
                        {{ playerFormation.中军 ? playerFormation.中军.troops : 0 }}
                      </div>
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
                            active: i <= getSynthStar(playerFormation.中军),
                            enhanced: getSynthStar(playerFormation.中军) > 0,
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <StatusEffects :general="playerFormation.中军" />
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
                    <div class="troops-bar" @mousedown.stop="handleTroopsBarMouseDown('前锋', $event)">
                      <div class="troops-fill" :style="{
                        width: playerFormation.前锋
                          ? (playerFormation.前锋.troops /
                            playerFormation.前锋.maxTroops) *
                          100 +
                          '%'
                          : '0%',
                      }"></div>
                      <div class="troops-text">
                        {{ playerFormation.前锋 ? playerFormation.前锋.troops : 0 }}
                      </div>
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
                            active: i <= getSynthStar(playerFormation.前锋),
                            enhanced: getSynthStar(playerFormation.前锋) > 0,
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <StatusEffects :general="playerFormation.前锋" />
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
            <div class="relic-bar">
              <div
                v-for="relic in enemyRelics"
                :key="relic.id"
                class="relic-item"
                :class="`rarity-${relic.rarity}`"
                :title="getRelicTooltip(relic)"
              >
                <span class="relic-icon">{{ relic.icon }}</span>
                <span class="relic-name">{{ relic.name }}</span>
              </div>
              <div v-if="enemyRelics.length === 0" class="relic-item empty">未选择遗物</div>
            </div>
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
                      <div class="troops-text">
                        {{ enemyFormation.前锋 ? enemyFormation.前锋.troops : 0 }}
                      </div>
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
                            active: i <= getSynthStar(enemyFormation.前锋),
                            enhanced: getSynthStar(enemyFormation.前锋) > 0,
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <StatusEffects :general="enemyFormation.前锋" />
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
                      <div class="troops-text">
                        {{ enemyFormation.中军 ? enemyFormation.中军.troops : 0 }}
                      </div>
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
                            active: i <= getSynthStar(enemyFormation.中军),
                            enhanced: getSynthStar(enemyFormation.中军) > 0,
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <StatusEffects :general="enemyFormation.中军" />
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
                      <div class="troops-text">
                        {{ enemyFormation.大营 ? enemyFormation.大营.troops : 0 }}
                      </div>
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
                            active: i <= getSynthStar(enemyFormation.大营),
                            enhanced: getSynthStar(enemyFormation.大营) > 0,
                          }">★</span>
                        </div>
                      </div>
                    </div>
                    <!-- 状态标记区域 -->
                    <StatusEffects :general="enemyFormation.大营" />
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
        </div>

        <!-- 选择武将界面 -->
        <GeneralList v-if="showGeneralList" :generals="generals" :API_BASE_URL="API_BASE_URL"
          :deployed-general-ids="deployedGeneralIds"
          :active-slot-general-id="activeSlotGeneralId"
          :rest-rounds-by-id="playerRecoveryRounds"
          @close="closeGeneralList" @select="(general) => {
            deployGeneral(general);
            hideTooltip();
          }" @show-tooltip="showGeneralTooltip" />

        <!-- 武将信息 -->
        <GeneralTooltip v-if="tooltipData" :general="tooltipData" @close="hideTooltip" />

        <!-- 底部操作按钮 -->
        <div v-if="showBattleBoard" class="game-footer">
          <button class="action-button recruit" @click="recruitCard" :disabled="money < recruitCost || isBattleActive"
            @mouseenter="showHeaderTooltip($event, 'recruit')" @mouseleave="hideHeaderTooltip">
            <img src="/assets/open.webp" alt="卡包招募" class="button-icon">
          </button>
          <button class="action-button end-turn" @click="endTurn"
            @mouseenter="showBattleControlTooltip($event)" @mouseleave="hideHeaderTooltip">
            <img :src="battleControlIcon" :alt="battleControlAlt" class="button-icon">
          </button>
          <div class="speed-controls">
            <button v-for="speed in speedOptions" :key="speed" class="speed-btn"
              :class="{ active: battleSpeed === speed }" @click="setBattleSpeed(speed)">
              {{ speed }}x
            </button>
            <button class="speed-btn skip-toggle" :class="{ active: skipBattleAnimation }" @click="toggleSkipBattle">
              {{ skipBattleAnimation ? "跳过战斗:开" : "跳过战斗:关" }}
            </button>
          </div>
          <!-- <button class="action-button next-wave" @click="nextWave" :disabled="isBattleActive" @mouseenter="showHeaderTooltip($event, 'next')"
            @mouseleave="hideHeaderTooltip">
            <img src="/assets/next.webp" alt="下一轮" class="button-icon">
          </button> -->
        </div>
      </div>

      <AuthModal v-if="showAuthModal" :is-login="isLogin" @close="showAuthModal = false" @login="handleLogin" />
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck - 跳过此文件的类型检查以允许未使用的变量
import { ref, computed, onMounted, watch } from "vue";
import AuthModal from "../components/AuthModal.vue";
import GeneralTooltip from "../components/GeneralTooltip.vue";
import GeneralList from "../components/GeneralList.vue";
import BattleReport from "../components/BattleReport.vue";
import StatusEffects from "../components/StatusEffects.vue";
import type { General } from "../skills/types";
import { RECRUIT_CONFIG as RECRUIT_CONFIG_BASE, getFetchFunction as getFetchFunctionBase } from "../skills/index";

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
  conscript: '可分配征召兵/总征召兵（开局3000）',
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

const showBattleControlTooltip = (event: MouseEvent) => {
  const text = !isBattleActive.value
    ? "开始战斗"
    : isBattlePaused.value
      ? "继续战斗"
      : "暂停战斗";
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  tooltip.value = {
    visible: true,
    text,
    x: rect.left + rect.width / 2,
    y: rect.bottom + 10,
  };
};

// 游戏初始数据
const initialGameData = {
  money: 10000,
  currentYear: -2070,
  currentWave: 1,
};

const money = ref(initialGameData.money);
const currentYear = ref(initialGameData.currentYear);
const currentWave = ref(initialGameData.currentWave);
const totalWaves = ref(300);
const currentTurn = ref(0);
const recruitCost = ref(100);
const maxCommand = ref(100);
const currentCommand = ref(0);
const maxConscripts = 3000;
const totalConscripts = ref(maxConscripts);

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
const _getRandomSoldierType = (): "步兵" | "弓兵" | "骑兵" => {
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

type FormationPosition = keyof typeof playerFormation.value;
type GeneralBattleSnapshot = {
  attack: number;
  defense: number;
  strategy: number;
  speed: number;
  siege: number;
  troops: number;
  maxTroops: number;
  isDead: boolean;
  skillEffects: Record<string, any>;
};

const battleStartSnapshot = ref<{
  player: Record<FormationPosition, GeneralBattleSnapshot | null>;
  enemy: Record<FormationPosition, GeneralBattleSnapshot | null>;
}>({
  player: {
    大营: null,
    中军: null,
    前锋: null,
  },
  enemy: {
    大营: null,
    中军: null,
    前锋: null,
  },
});

const createGeneralSnapshot = (
  general: General | null,
): GeneralBattleSnapshot | null => {
  if (!general) return null;
  return {
    attack: general.attack,
    defense: general.defense,
    strategy: general.strategy,
    speed: general.speed,
    siege: general.siege,
    troops: general.troops,
    maxTroops: general.maxTroops,
    isDead: general.isDead,
    skillEffects: { ...(general.skillEffects || {}) },
  };
};

const captureBattleStartSnapshot = () => {
  (Object.keys(playerFormation.value) as FormationPosition[]).forEach((position) => {
    battleStartSnapshot.value.player[position] = createGeneralSnapshot(
      playerFormation.value[position],
    );
    battleStartSnapshot.value.enemy[position] = createGeneralSnapshot(
      enemyFormation.value[position],
    );
  });
};

const restoreGeneralFromSnapshot = (
  general: General | null,
  snapshot: GeneralBattleSnapshot | null,
  options?: {
    preserveTroops?: boolean;
  },
) => {
  if (!general || !snapshot) return;
  const preserveTroops = !!options?.preserveTroops;
  const currentTroops = general.troops;
  const currentIsDead = general.isDead;

  general.attack = snapshot.attack;
  general.defense = snapshot.defense;
  general.strategy = snapshot.strategy;
  general.speed = snapshot.speed;
  general.siege = snapshot.siege;
  general.maxTroops = snapshot.maxTroops;
  if (preserveTroops) {
    general.troops = Math.max(0, Math.min(currentTroops, snapshot.maxTroops));
    general.isDead = currentIsDead || general.troops <= 0;
  } else {
    general.troops = snapshot.maxTroops;
    general.isDead = false;
  }
  general.skillEffects = {};
};

const restoreBattleStateToInitial = (options?: {
  preserveTroops?: boolean;
}) => {
  (Object.keys(playerFormation.value) as FormationPosition[]).forEach((position) => {
    restoreGeneralFromSnapshot(
      playerFormation.value[position],
      battleStartSnapshot.value.player[position],
      options,
    );
    restoreGeneralFromSnapshot(
      enemyFormation.value[position],
      battleStartSnapshot.value.enemy[position],
      options,
    );
  });
};

const generals = ref<General[]>([]);
const playerRecoveryRounds = ref<Record<number, number>>({});
const selectedSlot = ref<string | null>(null);
const showGeneralList = ref(false);
const battleReports = ref<string[]>([]);
const speedUnits = ref<any[]>([]);
const isBattleActive = ref(false);
const isBattlePaused = ref(false);
const isBattleStarting = ref(false);
const battleSpeed = ref(1);
const skipBattleAnimation = ref(false);
const speedOptions = [1, 2, 4, 8];
const battleControlIcon = computed(() => {
  if (!isBattleActive.value || isBattlePaused.value) return "/assets/start.webp";
  return "/assets/pause_btn.png";
});
const battleControlAlt = computed(() => {
  if (!isBattleActive.value) return "开始";
  return isBattlePaused.value ? "继续" : "暂停";
});
const committedConscripts = ref(0);
const battleLockedUsedConscripts = ref<number | null>(null);
const battleLockedAvailableConscripts = ref<number | null>(null);
const battleLockedTotalConscripts = ref<number | null>(null);
const syncCommittedConscriptsFromFormation = () => {
  committedConscripts.value = calculateUsedConscripts();
};
const lockBattleConscriptSnapshot = () => {
  const used = committedConscripts.value;
  battleLockedUsedConscripts.value = used;
  battleLockedAvailableConscripts.value = Math.max(0, totalConscripts.value - used);
  battleLockedTotalConscripts.value = totalConscripts.value;
};
const unlockBattleConscriptSnapshot = () => {
  battleLockedUsedConscripts.value = null;
  battleLockedAvailableConscripts.value = null;
  battleLockedTotalConscripts.value = null;
};
const calculateUsedConscripts = () =>
  Object.values(playerFormation.value).reduce((sum, general) => {
    if (!general) return sum;
    return sum + Math.max(0, general.troops || 0);
  }, 0);
const usedConscripts = computed(() => {
  return Math.max(0, committedConscripts.value);
});
const availableConscripts = computed(() => {
  if (
    isBattleActive.value &&
    battleLockedAvailableConscripts.value !== null
  ) {
    return battleLockedAvailableConscripts.value;
  }
  return Math.max(0, totalConscripts.value - usedConscripts.value);
});
const displayAvailableConscripts = computed(() => {
  if (
    isBattleActive.value &&
    battleLockedAvailableConscripts.value !== null
  ) {
    return battleLockedAvailableConscripts.value;
  }
  return availableConscripts.value;
});
const displayTotalConscripts = computed(() => {
  if (
    isBattleActive.value &&
    battleLockedTotalConscripts.value !== null
  ) {
    return battleLockedTotalConscripts.value;
  }
  return totalConscripts.value;
});
const damageTexts = ref<any[]>([]);
const quoteTexts = ref<any[]>([]);
const attackingCard = ref<string | null>(null);
const battleFxLevel = ref<"low" | "medium" | "high">("medium");
const isScreenShaking = ref(false);

const FX_PROFILES = {
  low: {
    windupMs: 60,
    dashMs: 90,
    recoverMs: 120,
    hitShakeMs: 90,
    hitFlashMs: 70,
    hitOutlineMs: 130,
    hitThrottleMs: 120,
    dashDistance: 56,
    highDamageRatio: 0.1,
    critDamageRatio: 0.18,
  },
  medium: {
    windupMs: 80,
    dashMs: 120,
    recoverMs: 180,
    hitShakeMs: 140,
    hitFlashMs: 110,
    hitOutlineMs: 220,
    hitThrottleMs: 80,
    dashDistance: 96,
    highDamageRatio: 0.08,
    critDamageRatio: 0.16,
  },
  high: {
    windupMs: 90,
    dashMs: 140,
    recoverMs: 220,
    hitShakeMs: 180,
    hitFlashMs: 140,
    hitOutlineMs: 260,
    hitThrottleMs: 70,
    dashDistance: 120,
    highDamageRatio: 0.07,
    critDamageRatio: 0.14,
  },
} as const;

type FxProfile = (typeof FX_PROFILES)[keyof typeof FX_PROFILES];

const getFxProfile = (): FxProfile => FX_PROFILES[battleFxLevel.value];

const activeFxTimers = new Map<string, number[]>();
const targetHitLastAt = new Map<string, number>();

const clearFxTimers = (key: string) => {
  const timers = activeFxTimers.get(key);
  if (!timers) return;
  timers.forEach((timerId) => window.clearTimeout(timerId));
  activeFxTimers.delete(key);
};

const clearAllBattleFx = () => {
  for (const key of activeFxTimers.keys()) {
    clearFxTimers(key);
  }
  targetHitLastAt.clear();
  isScreenShaking.value = false;
  attackingCard.value = null;
  (["player", "enemy"] as const).forEach((side) => {
    (["大营", "中军", "前锋"] as const).forEach((position) => {
      clearAttackerPhase(side, position);
      const card = getCardElement(side, position);
      if (!card) return;
      card.classList.remove(
        "target-hit-shake",
        "target-hit-flash",
        "target-hit-outline",
        "target-hit-heavy",
      );
    });
  });
};

const registerFxTimer = (key: string, timerId: number) => {
  const timers = activeFxTimers.get(key) || [];
  timers.push(timerId);
  activeFxTimers.set(key, timers);
};

const getCardElement = (side: "player" | "enemy", position: string) =>
  document.querySelector(
    `[data-card-side="${side}"][data-card-position="${position}"]`,
  ) as HTMLElement | null;

const markAttackerPhase = (
  side: "player" | "enemy",
  position: string,
  phase: "windup" | "dash" | "recover",
) => {
  const key = `${side}-${position}`;
  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove("attacker-windup", "attacker-dash", "attacker-recover");
  card.style.removeProperty("--dash-distance");
  card.style.removeProperty("--dash-direction");
  if (phase === "dash") {
    const direction = side === "player" ? 1 : -1;
    card.style.setProperty("--dash-distance", `${getFxProfile().dashDistance}px`);
    card.style.setProperty("--dash-direction", `${direction}`);
  }
  card.classList.add(`attacker-${phase}`);
  attackingCard.value = key;
};

const clearAttackerPhase = (side: "player" | "enemy", position: string) => {
  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove("attacker-windup", "attacker-dash", "attacker-recover");
  card.style.removeProperty("--dash-distance");
  card.style.removeProperty("--dash-direction");
  attackingCard.value = null;
};

const triggerTargetHitReaction = (
  side: "player" | "enemy",
  position: string,
  isHighDamage: boolean,
) => {
  const key = `${side}-${position}`;
  const now = Date.now();
  if (now - (targetHitLastAt.get(key) || 0) < getFxProfile().hitThrottleMs) {
    return;
  }
  targetHitLastAt.set(key, now);
  clearFxTimers(key);

  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove(
    "target-hit-shake",
    "target-hit-flash",
    "target-hit-outline",
    "target-hit-heavy",
  );
  void card.offsetWidth;
  card.classList.add("target-hit-shake", "target-hit-flash", "target-hit-outline");
  if (isHighDamage) {
    card.classList.add("target-hit-heavy");
  }

  registerFxTimer(
    key,
    window.setTimeout(() => {
      card.classList.remove("target-hit-shake", "target-hit-heavy");
    }, getFxProfile().hitShakeMs),
  );
  registerFxTimer(
    key,
    window.setTimeout(() => {
      card.classList.remove("target-hit-flash");
    }, getFxProfile().hitFlashMs),
  );
  registerFxTimer(
    key,
    window.setTimeout(() => {
      card.classList.remove("target-hit-outline");
      clearFxTimers(key);
    }, getFxProfile().hitOutlineMs),
  );
};

interface SpeedUnit {
  id: string;
  general: General;
  side: "player" | "enemy";
  position: string;
  speed: number;
  isActive: boolean;
}

interface RelicEffects {
  defensePct?: number;
  debuffResistChance?: number;
  turnEndHealPct?: number;
  commandPct?: number;
  siegePct?: number;
  physicalDamagePct?: number;
  strategyPct?: number;
  activeSkillChancePct?: number;
  strategyDamagePct?: number;
  resourcePerTurn?: number;
  resourceEfficiencyPct?: number;
  cavalrySpeedPct?: number;
  cavalryDoubleStrikeChance?: number;
  strategyDamageReductionPct?: number;
  speedPct?: number;
  physicalDamageReductionPct?: number;
  lowTroopsDefenseBonusPct?: number;
  lowTroopsThreshold?: number;
  healEffectPct?: number;
}

interface Relic {
  id: string;
  name: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  history: string;
  effectText: string;
  effects: RelicEffects;
}

interface VictoryRewardOption {
  id: string;
  type: "gold" | "conscript" | "promote" | "layerHeal";
  icon: string;
  name: string;
  description: string;
  value: number;
}

type NodeType =
  | "battle"
  | "elite"
  | "event"
  | "treasure"
  | "rest"
  | "shop"
  | "boss";
type GamePhase = "map_select" | "encounter_resolve" | "reward_resolve" | "map_advance";

interface MapNode {
  id: string;
  floor: number;
  lane: number;
  yOffset: number;
  type: NodeType;
  linksTo: string[];
  visited: boolean;
}

interface RunMap {
  act: number;
  floors: number;
  lanes: number;
  nodes: MapNode[];
  currentNodeId: string;
}

const relicPool: Relic[] = [
  {
    id: "kaihuanglvjian",
    name: "开皇律简",
    icon: "📜",
    rarity: "rare",
    history:
      "隋文帝时期颁布的《开皇律》竹简残卷，是隋唐法律制度的基础，规范朝纲、安定民心。",
    effectText: "全队防御+8%，受负面概率-5%，每回合结束恢复全队3%兵力。",
    effects: { defensePct: 0.08, debuffResistChance: 0.05, turnEndHealPct: 0.03 },
  },
  {
    id: "suidaibingfu",
    name: "隋代兵符",
    icon: "🛡️",
    rarity: "rare",
    history: "隋代调兵遣将兵符，象征古代军事权力。",
    effectText: "全队统御+10%，攻城+15%，物理伤害+8%。",
    effects: { commandPct: 0.1, siegePct: 0.15, physicalDamagePct: 0.08 },
  },
  {
    id: "lantingxumoben",
    name: "兰亭序摹本（隋唐版）",
    icon: "🖌️",
    rarity: "rare",
    history: "隋唐时期临摹《兰亭序》珍品，体现文化繁荣。",
    effectText: "全队谋略+12%，战法发动概率+5%，谋略伤害+6%。",
    effects: { strategyPct: 0.12, activeSkillChancePct: 0.05, strategyDamagePct: 0.06 },
  },
  {
    id: "dayunhecaoyin",
    name: "大运河漕印",
    icon: "🚢",
    rarity: "rare",
    history: "隋唐漕运管理官印，见证大运河贯通南北。",
    effectText: "全队攻城+12%，每回合获得资源，防御+8%。",
    effects: { siegePct: 0.12, resourcePerTurn: 18, defensePct: 0.08 },
  },
  {
    id: "tangsancaimayong",
    name: "唐三彩马俑",
    icon: "🐎",
    rarity: "rare",
    history: "隋唐代表性马俑工艺，见证时代繁荣与交流。",
    effectText: "全队骑兵速度+10%，物理伤害+7%，每回合6%概率骑兵连击一次。",
    effects: { cavalrySpeedPct: 0.1, physicalDamagePct: 0.07, cavalryDoubleStrikeChance: 0.06 },
  },
  {
    id: "fangkongqianfan",
    name: "隋代方孔钱范",
    icon: "🪙",
    rarity: "rare",
    history: "隋代五铢钱钱范，规范全国货币制度。",
    effectText: "全队统御+8%，资源产出效率+10%，受谋略伤害-6%。",
    effects: { commandPct: 0.08, resourceEfficiencyPct: 0.1, strategyDamageReductionPct: 0.06 },
  },
  {
    id: "yantabeitie",
    name: "雁塔碑帖",
    icon: "🗿",
    rarity: "rare",
    history: "隋唐碑帖文献，见证文化鼎盛。",
    effectText: "全队谋略+10%，战法发动概率+4%，谋略属性额外+7%。",
    effects: { strategyPct: 0.17, activeSkillChancePct: 0.04 },
  },
  {
    id: "suidaikaijiacanpian",
    name: "隋代铠甲残片",
    icon: "🧱",
    rarity: "rare",
    history: "隋代军用铠甲残片，体现军事装备水平。",
    effectText: "全队防御+11%，受物理伤害-7%，兵力低于60%额外防御+5%。",
    effects: {
      defensePct: 0.11,
      physicalDamageReductionPct: 0.07,
      lowTroopsDefenseBonusPct: 0.05,
      lowTroopsThreshold: 0.6,
    },
  },
  {
    id: "tangdaichajingchaoben",
    name: "唐代茶经抄本",
    icon: "🍵",
    rarity: "rare",
    history: "唐代《茶经》手抄本，见证茶文化兴起。",
    effectText: "全队谋略+9%，治疗效果+10%，每回合恢复全队4%兵力。",
    effects: { strategyPct: 0.09, healEffectPct: 0.1, turnEndHealPct: 0.04 },
  },
  {
    id: "suitangfenghuotailingpai",
    name: "隋唐烽火台令牌",
    icon: "🔥",
    rarity: "rare",
    history: "隋唐烽火台军情令牌，见证边防通讯体系。",
    effectText: "全队速度+8%，物理伤害+6%，强化侦查能力。",
    effects: { speedPct: 0.08, physicalDamagePct: 0.06 },
  },
  {
    id: "white_copper_tally",
    name: "铜节残符",
    icon: "🪙",
    rarity: "common",
    history: "旧军营遗落的铜节，虽不起眼，却能稳住军心。",
    effectText: "全队防御+2%。",
    effects: { defensePct: 0.02 },
  },
  {
    id: "white_oil_lamp",
    name: "行营油灯",
    icon: "🪔",
    rarity: "common",
    history: "夜行点灯，照路亦照心。",
    effectText: "全队速度+2%。",
    effects: { speedPct: 0.02 },
  },
  {
    id: "white_worn_sheath",
    name: "旧鞘",
    icon: "🗡️",
    rarity: "common",
    history: "磨损严重的刀鞘，仍能提醒武人守序。",
    effectText: "全队物理伤害+2%。",
    effects: { physicalDamagePct: 0.02 },
  },
  {
    id: "white_bamboo_abacus",
    name: "竹算筹",
    icon: "🧮",
    rarity: "common",
    history: "军需官常备小器，精打细算。",
    effectText: "每回合获得金币+6。",
    effects: { resourcePerTurn: 6 },
  },
  {
    id: "white_horse_bell",
    name: "驿马铃",
    icon: "🔔",
    rarity: "common",
    history: "驿卒铃响，队列更易齐步。",
    effectText: "骑兵速度+3%。",
    effects: { cavalrySpeedPct: 0.03 },
  },
  {
    id: "white_herb_bag",
    name: "草药囊",
    icon: "🌿",
    rarity: "common",
    history: "行军常备，聊胜于无。",
    effectText: "每回合结束恢复全队1%兵力。",
    effects: { turnEndHealPct: 0.01 },
  },
  {
    id: "white_small_banner",
    name: "小纛旗",
    icon: "🚩",
    rarity: "common",
    history: "伍长所持，鼓舞邻队。",
    effectText: "全队统率+2%。",
    effects: { commandPct: 0.02 },
  },
  {
    id: "white_old_manual",
    name: "旧操典",
    icon: "📘",
    rarity: "common",
    history: "残卷犹在，仍可习阵。",
    effectText: "全队攻城+3%。",
    effects: { siegePct: 0.03 },
  },
  {
    id: "green_war_drum",
    name: "行军战鼓",
    icon: "🥁",
    rarity: "uncommon",
    history: "鼓点稳阵，前后呼应。",
    effectText: "全队速度+4%，统率+3%。",
    effects: { speedPct: 0.04, commandPct: 0.03 },
  },
  {
    id: "green_quiver",
    name: "鹰羽箭囊",
    icon: "🏹",
    rarity: "uncommon",
    history: "精选箭羽，破甲更稳。",
    effectText: "全队物理伤害+4%。",
    effects: { physicalDamagePct: 0.04 },
  },
  {
    id: "green_tactic_slip",
    name: "战术简牍",
    icon: "📗",
    rarity: "uncommon",
    history: "简明战术，强调协同。",
    effectText: "全队谋略+5%。",
    effects: { strategyPct: 0.05 },
  },
  {
    id: "green_supply_cart",
    name: "补给车契",
    icon: "🛒",
    rarity: "uncommon",
    history: "登记军需，减少浪费。",
    effectText: "每回合获得金币+10，资源效率+4%。",
    effects: { resourcePerTurn: 10, resourceEfficiencyPct: 0.04 },
  },
  {
    id: "green_guard_plate",
    name: "护心铜片",
    icon: "🛡",
    rarity: "uncommon",
    history: "贴甲于胸，聊增生机。",
    effectText: "全队防御+5%，受物理伤害-2%。",
    effects: { defensePct: 0.05, physicalDamageReductionPct: 0.02 },
  },
  {
    id: "green_signal_fire",
    name: "烽火引",
    icon: "🔥",
    rarity: "uncommon",
    history: "边烽传令，军情更快。",
    effectText: "战法发动概率+2%。",
    effects: { activeSkillChancePct: 0.02 },
  },
  {
    id: "green_horse_hoof",
    name: "铁蹄钉",
    icon: "🐴",
    rarity: "uncommon",
    history: "稳蹄易行，利于追击。",
    effectText: "骑兵速度+6%，骑兵连击率+2%。",
    effects: { cavalrySpeedPct: 0.06, cavalryDoubleStrikeChance: 0.02 },
  },
  {
    id: "green_medical_scroll",
    name: "军医札记",
    icon: "📙",
    rarity: "uncommon",
    history: "营中急救要诀，重在止损。",
    effectText: "治疗效果+5%，每回合结束恢复全队2%兵力。",
    effects: { healEffectPct: 0.05, turnEndHealPct: 0.02 },
  },
];

const playerRelicCandidates = ref<Relic[]>([]);
const playerRelics = ref<Relic[]>([]);
const enemyRelics = ref<Relic[]>([]);
const showRelicSelector = ref(false);
const showVictoryRewardSelector = ref(false);
const victoryRewardOptions = ref<VictoryRewardOption[]>([]);
const isResolvingVictoryReward = ref(false);
const cuiJueRewardDialogLine = ref("此战有功，生死簿前，许你择其一赏。");
const gamePhase = ref<GamePhase>("map_select");
const showEventMap = ref(true);
const runMap = ref<RunMap | null>(null);
const pendingNodeId = ref<string | null>(null);
const pendingBattleNodeType = ref<NodeType | null>(null);
const currentAct = ref(1);
const _isLayerComplete = ref(false);
const layerRewardOptions = ref<VictoryRewardOption[]>([]);
const showLayerRewardSelector = ref(false);
const layerRewardDialogLine = ref("");
const _cuiJueLayerQuote = ref("");

const MAP_CONFIG = {
  minFloors: 8,
  maxFloors: 10,
  minNodesPerFloor: 2,
  maxNodesPerFloor: 4,
  maxConnectionsPerNode: 2,
  defaultNodePool: ["battle", "event", "treasure", "rest", "shop"] as NodeType[],
} as const;

const ENEMY_WAVE_RELIC_CONFIG: Record<number, string> = {
  3: "suidaibingfu",
  5: "kaihuanglvjian",
  8: "suitangfenghuotailingpai",
  12: "suidaikaijiacanpian",
};

const cuiJueQuotes = {
  newRun: [
    "生死簿上，名字又添一笔。这一世，你打算如何书写？",
    "我见过无数魂魄来来去去，却少有人能真正改写命数。你，会是例外吗？",
    "又回到起点了。记住，每一步选择，都在命运的天平上。",
  ],
  relic: [
    "这些是前人留下的痕迹。有的带着荣耀，有的染着遗憾——你选哪个？",
    "命运从不免费馈赠，每一次获得，背后都有代价。想清楚了吗？",
  ],
  battle: [
    "前方凶险，但你心中自有明灯。去吧，判官看着你呢。",
    "我判过无数善恶，却判不出你的命数——因为那在你自己手中。",
  ],
  defeat: [
    "又一个轮回落幕……但故事未完。休息片刻，再重新开始吧。",
    "虚负凌云万丈才，一生襟抱未曾开——你还有机会，别让这句话成真。",
  ],
  victory: [
    "这一局，你赢了。生死簿上，又多了一个传奇。",
    "判官见证过无数成败，而你——值得被记住。",
  ],
};

const hasShownNewRunQuote = ref(false);
const cuiJuePortrait = "/assets/cui_jue.webp";
const cuiJueRelicDialogLine = ref("这些是前人留下的痕迹。有的带着荣耀，有的染着遗憾——你选哪个？");

const mapNodeIconByType: Record<NodeType, string> = {
  event: "/assets/icon_event.png",
  battle: "/assets/icon_sword.png",
  treasure: "/assets/icon_treasure.png",
  shop: "/assets/wallet_icon.png",
  rest: "/assets/campfire_single.png",
  elite: "/assets/emenry_load.png",
  boss: "/assets/crown_icon.png",
};

const nodeTypeTitle: Record<NodeType, string> = {
  battle: "普通战斗",
  elite: "精英战斗",
  event: "随机事件",
  treasure: "宝物节点",
  rest: "休整节点",
  shop: "商店节点",
  boss: "Boss战",
};

const hashSeed = (seed: number) => {
  let h = seed >>> 0;
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

const pickWeightedNodeType = (rng: () => number, floor: number, totalFloors: number): NodeType => {
  if (floor === totalFloors) return "boss";
  const eliteWeight = floor >= 3 && floor <= totalFloors - 2 ? 0.2 : 0.08;
  const roll = rng();
  if (roll < eliteWeight) return "elite";
  const pool = MAP_CONFIG.defaultNodePool;
  return pool[Math.floor(rng() * pool.length)];
};

const connectTwoFloorsNoCross = (left: MapNode[], right: MapNode[], rng: () => number) => {
  const edges = new Set<string>();
  const leftCount = left.length;
  const rightCount = right.length;
  const addEdge = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || fromIdx >= leftCount || toIdx < 0 || toIdx >= rightCount) return;
    edges.add(`${fromIdx}-${toIdx}`);
  };
  const parseEdge = (edge: string) => edge.split("-").map(Number) as [number, number];

  for (let i = 0; i < leftCount; i++) {
    const j =
      leftCount === 1
        ? Math.floor((rightCount - 1) / 2)
        : Math.round((i * (rightCount - 1)) / (leftCount - 1));
    addEdge(i, j);
  }

  for (let j = 0; j < rightCount; j++) {
    const i =
      rightCount === 1
        ? Math.floor((leftCount - 1) / 2)
        : Math.round((j * (leftCount - 1)) / (rightCount - 1));
    addEdge(i, j);
  }

  for (let i = 0; i < leftCount; i++) {
    const currentTargets = [...edges]
      .map(parseEdge)
      .filter(([fromIdx]) => fromIdx === i)
      .map(([, toIdx]) => toIdx);
    if (currentTargets.length >= MAP_CONFIG.maxConnectionsPerNode) continue;
    if (rng() > 0.45) continue;
    const primary = currentTargets.length
      ? currentTargets[0]
      : Math.round((i * (rightCount - 1)) / Math.max(1, leftCount - 1));
    const candidates = [primary - 1, primary + 1].filter((toIdx) => toIdx >= 0 && toIdx < rightCount);
    const safeCandidates = candidates.filter((cand) => {
      for (const edge of edges) {
        const [existingFrom, existingTo] = parseEdge(edge);
        if (existingFrom === i) continue;
        if ((existingFrom < i && existingTo > cand) || (existingFrom > i && existingTo < cand)) {
          return false;
        }
      }
      return true;
    });
    if (safeCandidates.length > 0) {
      const pick = safeCandidates[randInt(rng, 0, safeCandidates.length - 1)];
      addEdge(i, pick);
    }
  }

  for (const edge of edges) {
    const [fromIdx, toIdx] = parseEdge(edge);
    left[fromIdx].linksTo.push(right[toIdx].id);
  }
};

const generateRunMap = (seed?: number): RunMap => {
  const baseSeed = typeof seed === "number" ? seed : Date.now();
  const rng = hashSeed(baseSeed);
  const floorCount = randInt(rng, MAP_CONFIG.minFloors, MAP_CONFIG.maxFloors);
  const nodes: MapNode[] = [];
  const floorNodes: MapNode[][] = [];

  for (let floor = 1; floor <= floorCount; floor++) {
    const isBossFloor = floor === floorCount;
    const nodeCount = isBossFloor
      ? 1
      : randInt(rng, MAP_CONFIG.minNodesPerFloor, MAP_CONFIG.maxNodesPerFloor);
    const thisFloorNodes: MapNode[] = [];
    for (let lane = 0; lane < nodeCount; lane++) {
      const node: MapNode = {
        id: `f${floor}-l${lane}`,
        floor,
        lane,
        yOffset: (rng() - 0.5) * 8,
        type: pickWeightedNodeType(rng, floor, floorCount),
        linksTo: [],
        visited: false,
      };
      thisFloorNodes.push(node);
      nodes.push(node);
    }
    floorNodes.push(thisFloorNodes);
  }

  for (let floor = 0; floor < floorNodes.length - 1; floor++) {
    connectTwoFloorsNoCross(floorNodes[floor], floorNodes[floor + 1], rng);
  }

  const map: RunMap = {
    act: 1,
    floors: floorCount,
    lanes: MAP_CONFIG.maxNodesPerFloor,
    nodes,
    currentNodeId: "start",
  };
  return map;
};

const generateNextLayerNodes = (existingNodes: MapNode[]): MapNode[] => {
  const baseSeed = Date.now();
  const _rng = hashSeed(baseSeed);
  const newFloor = (existingNodes.reduce((m, n) => Math.max(m, n.floor), 0)) + 1;
  const newNodes: MapNode[] = [];
  const _bossFloor = newFloor;
  const nodeCount = 1;
  const _lastFloorMaxLane = existingNodes
    .filter((n) => n.floor === newFloor - 1)
    .reduce((m, n) => Math.max(m, n.lane), -1);

  for (let lane = 0; lane < nodeCount; lane++) {
    const node: MapNode = {
      id: `f${newFloor}-l${lane}`,
      floor: newFloor,
      lane,
      yOffset: 0,
      type: "boss",
      linksTo: [],
      visited: false,
    };
    newNodes.push(node);
  }

  const prevFloorNodes = existingNodes.filter((n) => n.floor === newFloor - 1);
  const prevBossCandidates = prevFloorNodes;

  for (const prevNode of prevBossCandidates) {
    const nextNode = newNodes.find((n) => n.floor === newFloor && n.lane === 0);
    if (nextNode) {
      prevNode.linksTo.push(nextNode.id);
    }
  }

  return newNodes;
};

const resetRunProgress = () => {
  runMap.value = generateRunMap(Date.now());
  gamePhase.value = "map_select";
  showEventMap.value = true;
  pendingNodeId.value = null;
  pendingBattleNodeType.value = null;
  if (battleReports.value.length === 0) {
    addReport("请选择事件树中的节点开始旅程。");
  }
};

const getNodeById = (id: string) =>
  runMap.value?.nodes.find((node) => node.id === id) || null;

const currentMapFloor = computed(() => {
  if (!runMap.value) return 1;
  if (runMap.value.currentNodeId === "start") return 1;
  const node = getNodeById(runMap.value.currentNodeId);
  return node ? Math.min(runMap.value.floors, node.floor + 1) : 1;
});

const currentFloorNodes = computed(() => {
  if (!runMap.value) return [] as MapNode[];
  return runMap.value.nodes.filter((node) => node.floor === currentMapFloor.value);
});

const allowedNextNodeIds = computed(() => {
  if (!runMap.value) return [] as string[];
  if (runMap.value.currentNodeId === "start") {
    return currentFloorNodes.value.map((node) => node.id);
  }
  const node = getNodeById(runMap.value.currentNodeId);
  return node ? node.linksTo : [];
});

const canSelectMapNode = (node: MapNode) =>
  gamePhase.value === "map_select" &&
  allowedNextNodeIds.value.includes(node.id);

const showBattleBoard = computed(
  () => !!pendingBattleNodeType.value || isBattleActive.value || isBattleStarting.value,
);
const showBattleMapDrawer = ref(false);
const isMapLegendCollapsed = ref(false);

const toggleMapLegend = () => {
  isMapLegendCollapsed.value = !isMapLegendCollapsed.value;
};

watch(showBattleBoard, (active, prevActive) => {
  if (active && !prevActive) {
    showBattleMapDrawer.value = false;
  }
  if (!active) {
    showBattleMapDrawer.value = false;
  }
});

watch(isBattleActive, (active) => {
  if (active) {
    lockBattleConscriptSnapshot();
    return;
  }
  unlockBattleConscriptSnapshot();
});

const _mapFloors = computed(() => {
  if (!runMap.value) return [] as Array<{ floor: number; nodes: MapNode[] }>;
  const floors: Array<{ floor: number; nodes: MapNode[] }> = [];
  for (let floor = 1; floor <= runMap.value.floors; floor++) {
    floors.push({
      floor,
      nodes: runMap.value.nodes.filter((node) => node.floor === floor),
    });
  }
  return floors;
});

const getNodePoint = (node: MapNode) => {
  const floors = runMap.value?.floors || MAP_CONFIG.maxFloors;
  const nodesOnFloor =
    runMap.value?.nodes.filter((item) => item.floor === node.floor).length || MAP_CONFIG.maxNodesPerFloor;
  const xMin = 8;
  const xMax = 82;
  const yMin = 10;
  const yMax = 92;
  const x = floors <= 1 ? xMin : xMin + ((node.floor - 1) / (floors - 1)) * (xMax - xMin);
  const baseY = yMin + ((node.lane + 1) / (nodesOnFloor + 1)) * (yMax - yMin);
  const y = Math.min(yMax, Math.max(yMin, baseY + node.yOffset));
  return { x, y };
};

const mapLinkLines = computed(() => {
  if (!runMap.value)
    return [] as Array<{
      id: string;
      fromId: string;
      toId: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      path: string;
      reachable: boolean;
      visited: boolean;
    }>;
  const lines: Array<{
    id: string;
    fromId: string;
    toId: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    path: string;
    reachable: boolean;
    visited: boolean;
  }> = [];
  for (const node of runMap.value.nodes) {
    const from = getNodePoint(node);
    node.linksTo.forEach((targetId) => {
      const target = getNodeById(targetId);
      if (!target) return;
      const to = getNodePoint(target);
      lines.push({
        id: `${node.id}-${targetId}`,
        fromId: node.id,
        toId: targetId,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        path: `M ${from.x} ${from.y} C ${from.x + (to.x - from.x) * 0.38} ${from.y + (to.y > from.y ? 3.6 : -3.6)} ${from.x + (to.x - from.x) * 0.62} ${to.y + (to.y > from.y ? -3.6 : 3.6)} ${to.x} ${to.y}`,
        reachable:
          runMap.value?.currentNodeId === node.id &&
          allowedNextNodeIds.value.includes(targetId),
        visited: node.visited && target.visited,
      });
    });
  }
  return lines;
});

const getNodeStyle = (node: MapNode) => {
  const point = getNodePoint(node);
  return {
    left: `${point.x}%`,
    top: `${point.y}%`,
  };
};

const mapLegendItems = computed(() => [
  { type: "event" as NodeType, label: "事件", icon: mapNodeIconByType.event },
  { type: "battle" as NodeType, label: "战斗", icon: mapNodeIconByType.battle },
  { type: "treasure" as NodeType, label: "宝箱", icon: mapNodeIconByType.treasure },
  { type: "shop" as NodeType, label: "商店", icon: mapNodeIconByType.shop },
  { type: "rest" as NodeType, label: "休息", icon: mapNodeIconByType.rest },
  { type: "elite" as NodeType, label: "精英", icon: mapNodeIconByType.elite },
  { type: "boss" as NodeType, label: "Boss", icon: mapNodeIconByType.boss },
]);

const mapEventPool = [
  {
    id: "event-gold-for-star",
    title: "判官借火",
    description: "支付 200 金币，随机一名武将升星 +1。",
    apply: () => {
      if (money.value < 200) {
        addReport("金币不足，事件转化为征召兵 +300。");
        totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 300);
        return;
      }
      money.value -= 200;
      if (generals.value.length === 0) {
        addReport("暂无武将可强化，返还金币并补征召兵 +200。");
        money.value += 200;
        totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 200);
        return;
      }
      const target = generals.value[Math.floor(Math.random() * generals.value.length)];
      promoteGeneralByReward(target);
      addReport("事件结算：支付 200 金币，完成一次升星。");
    },
  },
  {
    id: "event-recover-rest",
    title: "旧部归营",
    description: "随机两名休整武将减少 1 轮休整。",
    apply: () => {
      const ids = Object.keys(playerRecoveryRounds.value)
        .map((id) => Number(id))
        .filter((id) => (playerRecoveryRounds.value[id] || 0) > 0);
      if (ids.length === 0) {
        addReport("当前无休整武将，改为获得金币 +120。");
        money.value += 120;
        return;
      }
      let changed = 0;
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      shuffled.slice(0, 2).forEach((id) => {
        playerRecoveryRounds.value[id] = Math.max(0, playerRecoveryRounds.value[id] - 1);
        if (playerRecoveryRounds.value[id] === 0) {
          delete playerRecoveryRounds.value[id];
        }
        changed++;
      });
      addReport(`事件结算：${changed} 名武将休整轮次 -1。`);
    },
  },
  {
    id: "event-conscript",
    title: "军械整补",
    description: "恢复征召兵 +700（不超上限）。",
    apply: () => {
      const before = totalConscripts.value;
      totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 700);
      addReport(`事件结算：征召兵 +${totalConscripts.value - before}。`);
    },
  },
] as const;

const resolveBattleNode = async (type: NodeType) => {
  pendingBattleNodeType.value = type;
  showEventMap.value = true;
  gamePhase.value = "encounter_resolve";
  if (type === "elite") {
    addReport("遭遇精英战！敌军士气高涨。");
  } else if (type === "boss") {
    addReport("Boss 战开启！敌军主帅亲临。");
  } else {
    addReport("遭遇普通战斗。");
  }
  await generateEnemyTeam();
  if (type === "elite" || type === "boss") {
    const ratio = type === "elite" ? 1.18 : 1.35;
    (Object.keys(enemyFormation.value) as (keyof typeof enemyFormation.value)[]).forEach(
      (position) => {
        const general = enemyFormation.value[position];
        if (!general) return;
        general.attack = Math.floor(general.attack * ratio);
        general.defense = Math.floor(general.defense * ratio);
        general.strategy = Math.floor(general.strategy * ratio);
        general.maxTroops = Math.floor(general.maxTroops * ratio);
        general.troops = Math.min(general.maxTroops, Math.floor(general.troops * ratio));
      },
    );
    addReport(type === "elite" ? "精英敌军获得属性强化！" : "Boss 敌军获得高额强化！");
  }
};

const resolveEventNode = () => {
  const event = mapEventPool[Math.floor(Math.random() * mapEventPool.length)];
  addReport(`事件【${event.title}】：${event.description}`);
  event.apply();
  gamePhase.value = "map_select";
  showEventMap.value = true;
};

const resolveTreasureNode = () => {
  if (relicPool.length > 0) {
    const relic = pickWeightedRelics(1)[0];
    if (!relic) {
      money.value += 150;
      addReport("宝物节点：获得金币 +150。");
      gamePhase.value = "map_select";
      showEventMap.value = true;
      return;
    }
    playerRelicCandidates.value = [relic];
    if (!playerRelics.value.some((item) => item.id === relic.id)) {
      playerRelics.value.push(relic);
    }
    addReport(`宝物节点：获得遗物【${relic.name}】。`);
  } else {
    money.value += 150;
    addReport("宝物节点：获得金币 +150。");
  }
  gamePhase.value = "map_select";
  showEventMap.value = true;
};

const resolveRestNode = () => {
  const before = totalConscripts.value;
  totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 600);
  const recovered = totalConscripts.value - before;
  const ids = Object.keys(playerRecoveryRounds.value)
    .map((id) => Number(id))
    .filter((id) => (playerRecoveryRounds.value[id] || 0) > 0);
  if (ids.length > 0) {
    const targetId = ids[Math.floor(Math.random() * ids.length)];
    playerRecoveryRounds.value[targetId] = Math.max(0, playerRecoveryRounds.value[targetId] - 1);
    if (playerRecoveryRounds.value[targetId] === 0) {
      delete playerRecoveryRounds.value[targetId];
    }
    addReport(`营地休整：征召兵 +${recovered}，并减少 1 名武将休整轮次。`);
  } else {
    addReport(`营地休整：征召兵 +${recovered}。`);
  }
  gamePhase.value = "map_select";
  showEventMap.value = true;
};

const resolveShopNode = () => {
  if (money.value >= 180) {
    money.value -= 180;
    totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 500);
    addReport("商店交易：花费 180 金币，恢复征召兵 +500。");
  } else {
    addReport("商店节点：金币不足，仅获得征召兵 +220。");
    totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + 220);
  }
  gamePhase.value = "map_select";
  showEventMap.value = true;
};

const resolveNode = async (node: MapNode) => {
  if (!runMap.value) return;
  runMap.value.currentNodeId = node.id;
  currentWave.value = node.floor;
  node.visited = true;
  pendingNodeId.value = node.id;
  if (node.type === "battle" || node.type === "elite" || node.type === "boss") {
    await resolveBattleNode(node.type);
    return;
  }
  gamePhase.value = "encounter_resolve";
  if (node.type === "event") resolveEventNode();
  else if (node.type === "treasure") resolveTreasureNode();
  else if (node.type === "rest") resolveRestNode();
  else if (node.type === "shop") resolveShopNode();
};

const selectEventNode = async (node: MapNode) => {
  if (!canSelectMapNode(node)) return;
  await resolveNode(node);
};




const deployedGeneralIds = computed(() =>
  Object.values(playerFormation.value)
    .filter((g): g is General => !!g)
    .map((g) => g.id),
);

const activeSlotGeneralId = computed(() => {
  if (!selectedSlot.value) return null;
  const [, position] = selectedSlot.value.split("-");
  return playerFormation.value[position as keyof typeof playerFormation.value]?.id ?? null;
});

const updateCurrentCommand = () => {
  let total = 0;
  Object.values(playerFormation.value).forEach((g) => {
    if (g) total += g.leadership;
  });
  currentCommand.value = total;
};

watch(gameLoaded, (loaded) => {
  if (loaded && playerRelics.value.length === 0) {
    startRelicSelection();
  }
});

onMounted(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    isLoggedIn.value = true;
  }
  // 先获取人物数据，再生成敌方队伍
  fetchCharacters().then(() => {
    resetRunProgress();
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
  if (side === "player" && !isBattleActive.value) {
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
    const restRounds = playerRecoveryRounds.value[general.id] || 0;
    if (restRounds > 0) {
      addReport(`【${general.name}】正在休整，还需 ${restRounds} 轮战斗后可再次上阵。`);
      return;
    }
    const [, position] = selectedSlot.value.split("-");
    const targetPosition = position as keyof typeof playerFormation.value;
    const oldGeneral = playerFormation.value[position as keyof typeof playerFormation.value];
    const oldTroopsInSlot = oldGeneral ? Math.max(0, oldGeneral.troops || 0) : 0;
    const oldCommand = oldGeneral ? oldGeneral.leadership : 0;
    const newTotalCommand = currentCommand.value - oldCommand + general.leadership;

    if (newTotalCommand > maxCommand.value) {
      addReport(
        `统率不足！当前统率: ${currentCommand.value}/${maxCommand.value}，需要: ${newTotalCommand}`,
      );
      return;
    }

    const existingPosition = (Object.keys(playerFormation.value) as (keyof typeof playerFormation.value)[])
      .find((key) => playerFormation.value[key]?.id === general.id);
    if (existingPosition && existingPosition !== targetPosition) {
      playerFormation.value[existingPosition] = null;
    }

    if (oldGeneral && oldGeneral.id !== general.id) {
      oldGeneral.troops = 0;
      oldGeneral.isDead = false;
      oldGeneral.skillEffects = {};
    }

    playerFormation.value[targetPosition] = general;
    if (!oldGeneral || oldGeneral.id !== general.id) {
      const desiredTroops = Math.max(0, Math.min(general.troops || 0, general.maxTroops));
      const budgetByPool = oldTroopsInSlot + availableConscripts.value;
      general.troops = Math.min(desiredTroops, budgetByPool);
      if (!isBattleActive.value && !isBattleStarting.value) {
        const nextCommitted =
          committedConscripts.value - oldTroopsInSlot + Math.max(0, general.troops || 0);
        committedConscripts.value = Math.max(0, Math.min(totalConscripts.value, nextCommitted));
      }
    }
    updateCurrentCommand();
    addReport(
      `【${general.name}】已上阵至【${targetPosition}】！统率: ${currentCommand.value}/${maxCommand.value}`,
    );
    closeGeneralList();
  }
};

const setGeneralTroops = (
  position: keyof typeof playerFormation.value,
  targetTroops: number,
) => {
  if (isBattleActive.value) return;
  const general = playerFormation.value[position];
  if (!general) return;
  const maxAllowedByPool = Math.min(
    general.maxTroops,
    general.troops + availableConscripts.value,
  );
  const next = Math.max(0, Math.min(Math.floor(targetTroops), maxAllowedByPool));
  general.troops = next;
  syncCommittedConscriptsFromFormation();
};

const handleTroopsBarMouseDown = (
  position: keyof typeof playerFormation.value,
  event: MouseEvent,
) => {
  if (isBattleActive.value) return;
  const bar = event.currentTarget as HTMLElement | null;
  if (!bar) return;

  const applyFromClientX = (clientX: number) => {
    const general = playerFormation.value[position];
    if (!general) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const requested = Math.floor(general.maxTroops * ratio);
    setGeneralTroops(position, requested);
  };

  applyFromClientX(event.clientX);
  const onMove = (e: MouseEvent) => applyFromClientX(e.clientX);
  const onUp = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
};

const autoAllocateTroopsEvenly = () => {
  if (isBattleActive.value) return;
  const deployed = Object.values(playerFormation.value).filter(
    (g): g is General => !!g,
  );
  if (deployed.length === 0) {
    addReport("请先上阵武将，再进行自动分配。");
    return;
  }
  let remaining = Math.max(0, availableConscripts.value);
  if (remaining <= 0) {
    addReport("当前没有可分配征召兵。");
    return;
  }
  const totalNeedToFull = deployed.reduce(
    (sum, g) => sum + Math.max(0, g.maxTroops - (g.troops || 0)),
    0,
  );
  if (remaining >= totalNeedToFull) {
    deployed.forEach((general) => {
      general.troops = general.maxTroops;
    });
    committedConscripts.value += totalNeedToFull;
    addReport("征召兵充足，已将我方上阵武将全部补至满兵。");
    return;
  }
  const canReceive = deployed.filter((g) => g.troops < g.maxTroops);
  while (remaining > 0 && canReceive.length > 0) {
    let progressed = false;
    for (const general of canReceive) {
      if (remaining <= 0) break;
      if (general.troops >= general.maxTroops) continue;
      general.troops += 1;
      remaining -= 1;
      progressed = true;
    }
    if (!progressed) break;
  }
  committedConscripts.value += Math.max(0, availableConscripts.value - remaining);
  addReport("已自动均分征召兵到我方上阵武将。");
};

const applyPlayerRecoveryForDeaths = () => {
  (Object.keys(playerFormation.value) as (keyof typeof playerFormation.value)[]).forEach(
    (position) => {
      const general = playerFormation.value[position];
      if (!general || !general.isDead) return;
      playerRecoveryRounds.value[general.id] = Math.max(
        playerRecoveryRounds.value[general.id] || 0,
        4,
      );
      playerFormation.value[position] = null;
      addReport(`【${general.name}】阵亡，进入 3 轮休整。`);
    },
  );
  updateCurrentCommand();
};

const _tickPlayerRecoveryRounds = () => {
  const next: Record<number, number> = {};
  Object.entries(playerRecoveryRounds.value).forEach(([id, rounds]) => {
    const left = Math.max(0, rounds - 1);
    if (left > 0) next[Number(id)] = left;
  });
  playerRecoveryRounds.value = next;
};

const areAllOwnedGeneralsResting = () => {
  if (generals.value.length === 0) return false;
  return generals.value.every((general) => (playerRecoveryRounds.value[general.id] || 0) > 0);
};

// 招募配置数组：id为武将在数据库中的ID，probability为招募概率（所有概率之和应等于1）
// 自动生成：在 skills/index.ts 的 RECRUIT_CONFIG 中添加新武将即可
const probability = 1 / RECRUIT_CONFIG_BASE.length;
const RECRUIT_CONFIG = RECRUIT_CONFIG_BASE.map(item => ({
  id: item.id,
  probability: Math.round(probability * 1000) / 1000,
}));

// 获取武将的fetch函数映射（使用 skills/index.ts 中定义的配置）
const getFetchFunction = (id: number) => {
  return getFetchFunctionBase(id, API_BASE_URL);
};

const designedGeneralIds = () => RECRUIT_CONFIG.map((c) => c.id);

const cloneGeneralForEnemy = (g: General): General => ({
  ...g,
  skills: g.skills?.map((s) => ({ ...s })),
  skillEffects: g.skillEffects ? { ...g.skillEffects } : undefined,
  quotes: g.quotes
    ? { skill: [...g.quotes.skill], death: [...g.quotes.death] }
    : undefined,
});

const shuffleDesignedGeneralIds = (): number[] => {
  const ids = [...designedGeneralIds()];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
};

const generateEnemyTeam = async () => {
  const positions: (keyof typeof enemyFormation.value)[] = [
    "大营",
    "中军",
    "前锋",
  ];
  const idPool = shuffleDesignedGeneralIds();
  let poolIndex = 0;

  for (const position of positions) {
    let placed: General | null = null;
    while (poolIndex < idPool.length && !placed) {
      const id = idPool[poolIndex++];
      const fetchFn = getFetchFunction(id);
      let general: General | null = null;
      if (fetchFn) {
        try {
          general = await fetchFn();
        } catch {
          general = null;
        }
      }
      if (general) {
        const copy = cloneGeneralForEnemy(general);
        copy.isDead = false;
        setSynthStar(copy, 0);
        placed = copy;
      }
    }

    if (placed) {
      enemyFormation.value[position] = placed;
      addReport(`敌方${position}：【${placed.name}】`);
    } else {
      addReport(`敌方${position}：未能从已设计武将中生成，请检查网络或配置。`);
      enemyFormation.value[position] = null;
    }
  }

  const relicId = ENEMY_WAVE_RELIC_CONFIG[currentWave.value];
  const enemyRelic = relicPool.find((r) => r.id === relicId) || null;
  enemyRelics.value = enemyRelic ? [enemyRelic] : [];
  if (enemyRelic) {
    addReport(`本波敌军携带遗物【${enemyRelic.name}】。`);
  } else {
    addReport("本波敌军未配置遗物。");
  }
  addReport("敌方队伍已集结完毕！");
};

// 格式化武将信息报告
const formatGeneralReport = (general: General) => {
  addReport(`恭喜获得【${general.name}】！等级:${general.level} 攻:${general.attack} 防:${general.defense} 策:${general.strategy} 速:${general.speed} 兵:${general.troops} 距:${general.attackRange} 统御:${general.command} 统率:${general.leadership} 兵种:${general.soldierType}`);
  if (general.skills && general.skills.length > 0) {
    addReport(`【${general.name}】自带战法：${general.skills[0].description}`);
  }
};

const getSynthStar = (general: General | null | undefined) => {
  if (!general) return 0;
  const star = (general as General & { synthStar?: number }).synthStar;
  return typeof star === "number" ? Math.max(0, Math.min(5, star)) : 0;
};

const setSynthStar = (general: General, value: number) => {
  (general as General & { synthStar?: number }).synthStar = Math.max(
    0,
    Math.min(5, value),
  );
};

const promoteExistingGeneral = (general: General) => {
  const beforeStar = getSynthStar(general);
  const nextStar = Math.min(5, beforeStar + 1);
  if (nextStar > beforeStar) {
    general.attack = Math.round(general.attack + (general.attackGrowth || 0));
    general.defense = Math.round(general.defense + (general.defenseGrowth || 0));
    general.strategy = Math.round(general.strategy + (general.strategyGrowth || 0));
    general.speed = Math.round(general.speed + (general.speedGrowth || 0));
    general.siege = Math.round(general.siege + (general.siegeGrowth || 0));
    general.command = Math.round(general.command + (general.commandGrowth || 0));
    general.maxTroops += 100;
  }
  setSynthStar(general, nextStar);
  general.troops = general.maxTroops;
  general.isDead = false;
  general.skillEffects = {};

  if (nextStar > beforeStar) {
    addReport(`重复招募【${general.name}】，已合成升阶至 ${nextStar} 星并恢复满兵力！`);
  } else {
    addReport(`重复招募【${general.name}】，已达满星，转换为满兵力整备。`);
  }
};

const promoteGeneralByReward = (general: General) => {
  const beforeStar = getSynthStar(general);
  const nextStar = Math.min(5, beforeStar + 1);
  if (nextStar > beforeStar) {
    general.attack = Math.round(general.attack + (general.attackGrowth || 0));
    general.defense = Math.round(general.defense + (general.defenseGrowth || 0));
    general.strategy = Math.round(general.strategy + (general.strategyGrowth || 0));
    general.speed = Math.round(general.speed + (general.speedGrowth || 0));
    general.siege = Math.round(general.siege + (general.siegeGrowth || 0));
    general.command = Math.round(general.command + (general.commandGrowth || 0));
    general.maxTroops += 100;
    setSynthStar(general, nextStar);
    general.troops = general.maxTroops;
    general.isDead = false;
    general.skillEffects = {};
    addReport(`崔珏嘉奖：【${general.name}】合成升阶至 ${nextStar} 星！`);
  } else {
    addReport(`崔珏嘉奖：【${general.name}】已满星，改为整备兵力。`);
    general.troops = general.maxTroops;
    general.skillEffects = {};
  }
};

const buildVictoryRewardOptions = (): VictoryRewardOption[] => {
  const goldValue = [120, 150, 180][Math.floor(Math.random() * 3)];
  const conscriptValue = [600, 800, 1000][Math.floor(Math.random() * 3)];
  const options: VictoryRewardOption[] = [
    {
      id: `gold-${Date.now()}`,
      type: "gold",
      icon: "💰",
      name: "军资补给",
      description: `获得金币 +${goldValue}`,
      value: goldValue,
    },
    {
      id: `conscript-${Date.now()}`,
      type: "conscript",
      icon: "🪖",
      name: "征召补员",
      description: `恢复固定征召兵 +${conscriptValue}`,
      value: conscriptValue,
    },
    {
      id: `promote-${Date.now()}`,
      type: "promote",
      icon: "⭐",
      name: "生死簿赐阶",
      description: "随机我方武将合成星 +1",
      value: 1,
    },
  ];
  return options;
};

const buildLayerRewardOptions = (): VictoryRewardOption[] => {
  const goldValue = 300 + currentAct.value * 150;
  const conscriptValue = 500 + currentAct.value * 200;
  const options: VictoryRewardOption[] = [
    {
      id: `layer-gold-${Date.now()}`,
      type: "gold",
      icon: "💰",
      name: "军资嘉奖",
      description: `获得金币 +${goldValue}`,
      value: goldValue,
    },
    {
      id: `layer-conscript-${Date.now()}`,
      type: "conscript",
      icon: "🪖",
      name: "征召犒赏",
      description: `恢复征召兵 +${conscriptValue}`,
      value: conscriptValue,
    },
    {
      id: `layer-heal-${Date.now()}`,
      type: "layerHeal",
      icon: "❤️",
      name: "全员疗伤",
      description: "所有上阵武将恢复至满兵力",
      value: 0,
    },
  ];
  return options;
};

const applyVictoryReward = (reward: VictoryRewardOption) => {
  if (reward.type === "gold") {
    money.value += reward.value;
    addReport(`崔珏赏赐军资：金币 +${reward.value}。`);
    return;
  }
  if (reward.type === "conscript") {
    const beforeAvailable = availableConscripts.value;
    const before = totalConscripts.value;
    totalConscripts.value = Math.min(maxConscripts, totalConscripts.value + reward.value);
    const actualRecovered = totalConscripts.value - before;
    if (actualRecovered > 0) {
      const afterAvailable = availableConscripts.value;
      addReport(
        `崔珏补发兵员：征召兵 +${actualRecovered}（上限 ${maxConscripts}），可分配由 ${beforeAvailable} 提升至 ${afterAvailable}。`,
      );
      return;
    }
    const getPlayerBattleStartTroops = (general: General) => {
      const positions = Object.keys(playerFormation.value) as FormationPosition[];
      for (const position of positions) {
        if (playerFormation.value[position]?.id !== general.id) continue;
        const snapshot = battleStartSnapshot.value.player[position];
        if (!snapshot) return general.troops;
        return Math.max(0, Math.min(snapshot.troops, general.maxTroops));
      }
      return general.troops;
    };
    const healTargets = (Object.keys(playerFormation.value) as FormationPosition[])
      .map((position) => playerFormation.value[position])
      .filter((general): general is General => !!general && !general.isDead && general.troops < general.maxTroops)
      .map((general) => {
        const currentTroops = Math.max(0, general.troops);
        // 回血上限：不超过本场开战时的当前兵力值
        const battleStartTroopsCap = getPlayerBattleStartTroops(general);
        const healCap = Math.max(0, battleStartTroopsCap - currentTroops);
        return {
          general,
          healCap,
          healed: 0,
        };
      })
      .filter((item) => item.healCap > 0);
    let healRemaining = reward.value;
    let healedTotal = 0;
    while (healRemaining > 0 && healTargets.length > 0) {
      let progressed = false;
      for (const item of healTargets) {
        if (healRemaining <= 0) break;
        if (item.healed >= item.healCap) continue;
        item.general.troops += 1;
        item.healed += 1;
        healRemaining -= 1;
        healedTotal += 1;
        progressed = true;
      }
      if (!progressed) break;
    }
    if (healedTotal > 0) {
      addReport(`征召兵已达上限，崔珏改为直接回血：我方上阵武将兵力恢复 ${healedTotal}。`);
      return;
    }
    const reclaimed = Math.min(reward.value, committedConscripts.value);
    if (reclaimed > 0) {
      committedConscripts.value = Math.max(0, committedConscripts.value - reclaimed);
      const afterAvailable = availableConscripts.value;
      addReport(
        `征召兵已达上限且无可恢复目标，崔珏改为回补可分配额度 +${reclaimed}，当前可分配 ${afterAvailable}。`,
      );
      return;
    }
    addReport(`崔珏补发兵员：征召兵 +0（上限 ${maxConscripts}），且当前无可回补额度。`);
    return;
  }
  if (reward.type === "promote") {
    if (generals.value.length === 0) {
      addReport("当前无可提升武将，奖励转为金币 +120。");
      money.value += 120;
      return;
    }
    const target = generals.value[Math.floor(Math.random() * generals.value.length)];
    promoteGeneralByReward(target);
  }
  if (reward.type === "layerHeal") {
    let healed = 0;
    (Object.keys(playerFormation.value) as FormationPosition[]).forEach((position) => {
      const general = playerFormation.value[position];
      if (!general || general.isDead) return;
      if (general.troops < general.maxTroops) {
        healed++;
        general.troops = general.maxTroops;
      }
    });
    addReport(`崔珏施法：${healed} 名武将恢复至满兵力！`);
  }
};

const applyLayerReward = (reward: VictoryRewardOption) => {
  applyVictoryReward(reward);
};

const openLayerRewardSelector = () => {
  layerRewardOptions.value = buildLayerRewardOptions();
  layerRewardDialogLine.value = getRandomLine(cuiJueQuotes.victory);
  showLayerRewardSelector.value = true;
  gamePhase.value = "reward_resolve";
  addReport(`【崔珏】${layerRewardDialogLine.value}`);
  addReport(`第 ${currentAct.value} 层已完成！崔珏现身裁赏。`);
};

const selectLayerReward = async (reward: VictoryRewardOption) => {
  if (isResolvingVictoryReward.value) return;
  isResolvingVictoryReward.value = true;
  try {
    showLayerRewardSelector.value = false;
    applyLayerReward(reward);

    // 重新生成下一层
    if (!runMap.value) {
      resetRunProgress();
      return;
    }
    const existingNodes = runMap.value.nodes;
    const newNodes = generateNextLayerNodes(existingNodes);
    runMap.value.nodes.push(...newNodes);
    runMap.value.currentNodeId = "start";
    currentAct.value += 1;

    addReport(`第 ${currentAct.value - 1} 层崔珏裁赏完毕！第 ${currentAct.value} 层已开启。`);
    gamePhase.value = "map_select";
    showEventMap.value = true;
  } finally {
    isResolvingVictoryReward.value = false;
  }
};

const enterNextBattleAfterReward = async () => {
  gamePhase.value = "map_advance";
  pendingBattleNodeType.value = null;
  pendingNodeId.value = null;
  showEventMap.value = true;
  addReport("崔珏裁赏已落定，返回事件树继续前进。");
};

const openVictorySettlement = () => {
  unlockBattleConscriptSnapshot();
  const currentNode = pendingNodeId.value ? getNodeById(pendingNodeId.value) : null;
  if (currentNode?.type === "boss") {
    openLayerRewardSelector();
    return;
  }
  showVictoryRewardSelector.value = true;
  gamePhase.value = "reward_resolve";
  victoryRewardOptions.value = buildVictoryRewardOptions();
  cuiJueRewardDialogLine.value = "此战有功，生死簿前，许你择其一赏。";
  addReport("崔珏现身，进入战后裁赏。");
};

const selectVictoryReward = async (reward: VictoryRewardOption) => {
  if (isResolvingVictoryReward.value) return;
  isResolvingVictoryReward.value = true;
  try {
    showVictoryRewardSelector.value = false;
    applyVictoryReward(reward);
    await enterNextBattleAfterReward();
    gamePhase.value = "map_select";
  } finally {
    isResolvingVictoryReward.value = false;
  }
};

const getRelicTooltip = (relic: Relic | null) => {
  if (!relic) return "";
  return `${relic.name}\n${relic.history}\n效果：${relic.effectText}`;
};

const getRandomLine = (lines: string[]) =>
  lines[Math.floor(Math.random() * lines.length)];

const addCuiJueQuote = (
  scene: keyof typeof cuiJueQuotes,
  extraPrefix = "",
) => {
  const line = getRandomLine(cuiJueQuotes[scene]);
  addReport(`${extraPrefix}【崔珏】${line}`);
  return line;
};

const RELIC_RARITY_WEIGHT: Record<Relic["rarity"], number> = {
  common: 55,
  uncommon: 33,
  rare: 12,
  legendary: 0,
};

const pickRarityByWeight = (): Relic["rarity"] => {
  const roll = Math.random() * 100;
  let cursor = 0;
  for (const rarity of ["common", "uncommon", "rare", "legendary"] as Relic["rarity"][]) {
    cursor += RELIC_RARITY_WEIGHT[rarity];
    if (roll <= cursor) return rarity;
  }
  return "common";
};

const pickWeightedRelics = (count: number): Relic[] => {
  const available = [...relicPool];
  const picked: Relic[] = [];
  while (picked.length < count && available.length > 0) {
    const rarity = pickRarityByWeight();
    const sameRarity = available.filter((relic) => relic.rarity === rarity);
    const pool = sameRarity.length > 0 ? sameRarity : available;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    picked.push(chosen);
    const idx = available.findIndex((item) => item.id === chosen.id);
    if (idx >= 0) {
      available.splice(idx, 1);
    }
  }
  return picked;
};

const getRelicsBySide = (side: "player" | "enemy"): Relic[] =>
  side === "player" ? playerRelics.value : enemyRelics.value;

const getRelicEffectValue = (
  side: "player" | "enemy",
  key: keyof RelicEffects,
): number => {
  const relics = getRelicsBySide(side);
  if (relics.length === 0) return 0;
  return relics.reduce((sum, relic) => sum + Number(relic.effects[key] || 0), 0);
};

const hasLowTroopsDefenseBonus = (
  side: "player" | "enemy",
  general: General,
): boolean => {
  const relics = getRelicsBySide(side);
  if (relics.length === 0) return false;
  const threshold = Math.max(...relics.map((relic) => Number(relic.effects.lowTroopsThreshold || 0)));
  if (threshold <= 0) return false;
  return general.maxTroops > 0 && general.troops / general.maxTroops < threshold;
};

const getAdjustedSpeed = (general: General, side: "player" | "enemy") => {
  let speed = general.speed;
  speed *= 1 + getRelicEffectValue(side, "speedPct");
  if (general.soldierType === "骑兵") {
    speed *= 1 + getRelicEffectValue(side, "cavalrySpeedPct");
  }
  return speed;
};

const applyRelicDebuffResist = (unit: {
  general: General;
  side: "player" | "enemy";
}) => {
  const resistChance = getRelicEffectValue(unit.side, "debuffResistChance");
  if (resistChance <= 0 || !unit.general.skillEffects) return;
  if (Math.random() >= resistChance) return;

  const effects = unit.general.skillEffects;
  if (effects.damageOutputReductionDuration > 0) {
    effects.damageOutputReductionDuration = 0;
    effects.damageOutputReduction = 0;
    addReport(`【${unit.general.name}】受遗物庇佑，抵消了降攻效果！`);
    return;
  }
  if (effects.skillTriggerReductionDuration > 0) {
    effects.skillTriggerReductionDuration = 0;
    effects.skillTriggerReduction = 0;
    addReport(`【${unit.general.name}】受遗物庇佑，抵消了降率效果！`);
    return;
  }
  if (effects.defenseReductionDuration > 0) {
    effects.defenseReductionDuration = 0;
    effects.defenseReduction = 0;
    addReport(`【${unit.general.name}】受遗物庇佑，抵消了降防效果！`);
    return;
  }
  if (effects.cannotNormalAttackDuration > 0) {
    effects.cannotNormalAttackDuration = 0;
    effects.cannotNormalAttack = false;
    addReport(`【${unit.general.name}】受遗物庇佑，摆脱了怯战效果！`);
  }
};

const applyEndTurnRelicEffects = () => {
  const allAliveGenerals = getAllGenerals().filter((g) => !g.general.isDead);
  allAliveGenerals.forEach((generalData) => {
    const healPct = getRelicEffectValue(generalData.side, "turnEndHealPct");
    if (healPct > 0) {
      const healAmount = Math.max(
        1,
        Math.floor(generalData.general.maxTroops * healPct),
      );
      const oldTroops = generalData.general.troops;
      generalData.general.troops = Math.min(
        generalData.general.maxTroops,
        generalData.general.troops + healAmount,
      );
      const actualHeal = generalData.general.troops - oldTroops;
      if (actualHeal > 0) {
        addReport(`【${generalData.general.name}】受到遗物效果恢复${actualHeal}点兵力。`);
      }
    }
  });

  const playerResource = getRelicEffectValue("player", "resourcePerTurn");
  if (playerResource > 0) {
    const efficiency = 1 + getRelicEffectValue("player", "resourceEfficiencyPct");
    const gain = Math.max(1, Math.floor(playerResource * efficiency));
    money.value += gain;
    addReport(`我方遗物带来资源收益：+${gain} 金币。`);
  }
};

const startRelicSelection = () => {
  if (playerRelics.value.length > 0) return;
  if (!hasShownNewRunQuote.value) {
    addCuiJueQuote("newRun");
    hasShownNewRunQuote.value = true;
  }
  cuiJueRelicDialogLine.value = addCuiJueQuote("relic");
  const playerCandidates = pickWeightedRelics(3);
  playerRelicCandidates.value = playerCandidates;
  showRelicSelector.value = true;
};

const selectPlayerRelic = (relic: Relic) => {
  if (!playerRelics.value.some((item) => item.id === relic.id)) {
    playerRelics.value.push(relic);
  }
  showRelicSelector.value = false;
  addReport(`我方选择遗物【${relic.name}】。`);
};

const recruitCard = () => {
  if (money.value < recruitCost.value) {
    addReport("金额不足，无法招募！");
    return;
  }

  money.value -= recruitCost.value;

  // 根据概率随机选择武将
  const random = Math.random();
  let cumulativeProbability = 0;
  let selectedGeneralId = RECRUIT_CONFIG[0].id;

  for (const config of RECRUIT_CONFIG) {
    cumulativeProbability += config.probability;
    if (random < cumulativeProbability) {
      selectedGeneralId = config.id;
      break;
    }
  }

  // 获取对应武将的fetch函数并执行
  const fetchFn = getFetchFunction(selectedGeneralId);
  if (fetchFn) {
    fetchFn().then((general) => {
      if (general) {
        const existedGeneral = generals.value.find((item) => item.id === general.id);
        if (existedGeneral) {
          promoteExistingGeneral(existedGeneral);
        } else {
          setSynthStar(general, 0);
          general.troops = 0;
          general.isDead = false;
          general.skillEffects = {};
          generals.value.push(general);
          formatGeneralReport(general);
        }
      }
    });
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitBattle = async (baseMs: number) => {
  if (skipBattleAnimation.value) return;
  let progressed = 0;
  const tick = 80;
  while (progressed < baseMs && isBattleActive.value) {
    if (isBattlePaused.value) {
      await sleep(tick);
      continue;
    }
    await sleep(tick);
    progressed += tick * battleSpeed.value;
  }
};

const setBattleSpeed = (speed: number) => {
  battleSpeed.value = speed;
  addReport(`战斗速度已切换为 ${speed}x`);
};

const toggleSkipBattle = () => {
  if (isBattleActive.value) {
    addReport("战斗进行中不可切换跳过状态。");
    return;
  }
  skipBattleAnimation.value = !skipBattleAnimation.value;
  addReport(skipBattleAnimation.value ? "已开启跳过战斗动画。" : "已关闭跳过战斗动画。");
};

const toggleBattlePause = () => {
  if (!isBattleActive.value) return;
  isBattlePaused.value = !isBattlePaused.value;
  addReport(isBattlePaused.value ? "战斗已暂停" : "战斗继续");
};

const handleBattleControl = async () => {
  if (showVictoryRewardSelector.value) {
    addReport("请先完成崔珏裁赏，再开启下一场战斗。");
    return;
  }
  if (!pendingBattleNodeType.value && !isBattleActive.value) {
    addReport("请先在事件树中选择一个战斗节点。");
    showEventMap.value = true;
    return;
  }
  if (isBattleStarting.value) return;
  if (isBattleActive.value) {
    toggleBattlePause();
    return;
  }
  isBattleStarting.value = true;
  try {
    await startBattle();
  } finally {
    isBattleStarting.value = false;
  }
};

const endTurn = () => {
  handleBattleControl();
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

const playHealSound = () => {
  const audio = new Audio("/assets/audios/heal.mp3");
  audio.play().catch((e) => console.error("播放治疗音效失败:", e));
};

const triggerHealCardFx = (side: "player" | "enemy", position: string) => {
  const card = getCardElement(side, position);
  if (!card) return;
  card.classList.remove("target-heal-pulse");
  void card.offsetWidth;
  card.classList.add("target-heal-pulse");
  window.setTimeout(() => {
    card.classList.remove("target-heal-pulse");
  }, 680);
};

const executeSkillEffectWithHealFx = <T>(effectRunner: () => T): T => {
  const allUnits = getAllGenerals()
    .filter((item) => !item.general.isDead)
    .map((item) => ({
      general: item.general,
      side: item.side,
      position: item.position,
      troops: item.general.troops,
    }));
  const result = effectRunner();
  let hasHeal = false;
  allUnits.forEach((unit) => {
    const healed = unit.general.troops - unit.troops;
    if (healed > 0) {
      hasHeal = true;
      triggerHealCardFx(unit.side, unit.position);
      showDamageText(healed, unit.side, unit.position, {
        kind: "heal",
        tag: "恢复",
      });
    }
  });
  if (hasHeal) {
    playHealSound();
  }
  return result;
};

const triggerSkillEffects = (general: General, context: any) => {
  if (general.skills) {
    for (const skill of general.skills) {
      // 处理所有类型的技能（包括active和passive）
      // 传递addReport函数给技能效果
      const result: any = executeSkillEffectWithHealFx(() =>
        skill.effect(general, {
        ...context,
        addReport
        }),
      );
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
  
  // 获取目标的防御降低效果（用于物理攻击）
  let targetDefenseReduction = 0;
  if (target.general.skillEffects && target.general.skillEffects.defenseReduction > 0) {
    targetDefenseReduction = target.general.skillEffects.defenseReduction;
  }
  
  if (attackType === "physical") {
    // 物理攻击：使用攻击和防御（考虑防御降低效果）
    let defenseBonus = getRelicEffectValue(target.side, "defensePct");
    if (hasLowTroopsDefenseBonus(target.side, target.general)) {
      defenseBonus += getRelicEffectValue(target.side, "lowTroopsDefenseBonusPct");
    }
    const effectiveDefense =
      target.general.defense * (1 + defenseBonus) * (1 - targetDefenseReduction);
    damage = Math.max(
      0,
      attacker.general.attack - effectiveDefense / 2,
    );
    if (targetDefenseReduction > 0 && addReport) {
      addReport(`【${target.general.name}】受【${target.general.skillEffects?.defenseReductionSource}】影响，防御降低${(targetDefenseReduction * 100).toFixed(0)}%！`);
    }
  } else {
    // 策略攻击：使用攻击方谋略和防御方谋略
    // 公式：攻击方策略值 * 系数 - 防御方策略值 / 2
    const strategyBonus = getRelicEffectValue(attacker.side, "strategyPct");
    damage = Math.max(
      0,
      attacker.general.strategy * (1 + strategyBonus) - target.general.strategy / 2,
    );
  }

  if (attackType === "physical") {
    const physicalBonus = getRelicEffectValue(attacker.side, "physicalDamagePct");
    if (physicalBonus > 0) {
      damage *= 1 + physicalBonus;
    }
  } else {
    const strategyDamageBonus = getRelicEffectValue(attacker.side, "strategyDamagePct");
    if (strategyDamageBonus > 0) {
      damage *= 1 + strategyDamageBonus;
    }
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

  if (attackType === "physical") {
    const relicReduce = getRelicEffectValue(target.side, "physicalDamageReductionPct");
    if (relicReduce > 0) {
      damage *= 1 - relicReduce;
    }
  } else {
    const relicReduce = getRelicEffectValue(target.side, "strategyDamageReductionPct");
    if (relicReduce > 0) {
      damage *= 1 - relicReduce;
    }
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
  options?: {
    kind?: "normal" | "high" | "blocked" | "heal" | "healSpark";
    critical?: boolean;
    tag?: string;
  },
) => {
  const text =
    options?.kind === "blocked"
      ? "0"
      : options?.kind === "heal"
        ? "+" + damage
        : "-" + damage;
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
      text,
      kind: options?.kind || "normal",
      critical: !!options?.critical,
      tag: options?.tag || "",
      x: cardRect.left + cardRect.width / 2 - 20,
      y: cardRect.top + cardRect.height / 2,
      delay: 0,
    };

    damageTexts.value.push(damageText);
    if (options?.kind === "heal") {
      for (let i = 0; i < 3; i++) {
        const spark = {
          id: Date.now() + Math.random() + i,
          text: "✦",
          kind: "healSpark",
          critical: false,
          tag: "",
          x: cardRect.left + cardRect.width / 2 - 24 + (Math.random() * 34 - 17),
          y: cardRect.top + cardRect.height / 2 + (Math.random() * 16 - 8),
          delay: i * 0.05,
        };
        damageTexts.value.push(spark);
      }
    }

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
    text,
    kind: options?.kind || "normal",
    critical: !!options?.critical,
    tag: options?.tag || "",
    x: troopsRect.left + troopsRect.width / 2 - 20,
    y: troopsRect.top - 10,
    delay: 0,
  };

  damageTexts.value.push(damageText);
  if (options?.kind === "heal") {
    for (let i = 0; i < 3; i++) {
      const spark = {
        id: Date.now() + Math.random() + i,
        text: "✦",
        kind: "healSpark",
        critical: false,
        tag: "",
        x: troopsRect.left + troopsRect.width / 2 - 24 + (Math.random() * 34 - 17),
        y: troopsRect.top - 12 + (Math.random() * 10 - 5),
        delay: i * 0.05,
      };
      damageTexts.value.push(spark);
    }
  }

  // 2秒后移除伤害文本
  setTimeout(() => {
    damageTexts.value = damageTexts.value.filter(
      (dt) => dt.id !== damageText.id,
    );
  }, 2000);
};

const showQuoteText = (
  quote: string,
  side: "player" | "enemy",
  position: string,
) => {
  // 查找对应卡牌
  const cardElement = document.querySelector(
    `[data-card-side="${side}"][data-card-position="${position}"]`,
  );
  if (!cardElement) return;

  const cardRect = cardElement.getBoundingClientRect();
  const quoteText = {
    id: Date.now() + Math.random(),
    text: quote,
    x: cardRect.left + 10,
    y: cardRect.top - 30,
    delay: 0,
  };

  quoteTexts.value.push(quoteText);

  // 3秒后移除台词文本
  setTimeout(() => {
    quoteTexts.value = quoteTexts.value.filter(
      (qt) => qt.id !== quoteText.id,
    );
  }, 3000);
};

const getRandomQuote = (quotes: string[]): string => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

const performAttackWithAnimation = async (
  attacker: { general: General; side: "player" | "enemy"; position: string },
  target: { general: General; side: "player" | "enemy"; position: string },
  attackType: "physical" | "strategy" = "physical",
) => {
  const attackerPrefix = attacker.side === "player" ? "我方" : "敌方";
  const targetPrefix = target.side === "player" ? "我方" : "敌方";
  const attackTypeText = attackType === "physical" ? "物理" : "策略";
  const fx = getFxProfile();

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
  if (!skipBattleAnimation.value) {
    markAttackerPhase(attacker.side, attacker.position, "windup");
    await waitBattle(fx.windupMs);
    markAttackerPhase(attacker.side, attacker.position, "dash");
    await waitBattle(fx.dashMs);
  }

  // 执行攻击逻辑
  const attackResult = performAttack(attacker, target, attackType);
  const highDamageThreshold = Math.max(
    1,
    Math.floor(target.general.maxTroops * fx.highDamageRatio),
  );
  const criticalThreshold = Math.max(
    1,
    Math.floor(target.general.maxTroops * fx.critDamageRatio),
  );
  const isHighDamage = attackResult.damage >= highDamageThreshold;
  const isCritical = attackResult.damage >= criticalThreshold;

  if (attackResult.damage > 0) {
    // 播放受击音效
    if (!skipBattleAnimation.value) {
      const audio = new Audio('/assets/audios/hint.mp4');
      audio.play().catch(e => console.error('播放音效失败:', e));
    }
    
    // 触发受击动画（闪白、抖动、描边）
    if (!skipBattleAnimation.value) {
      triggerTargetHitReaction(target.side, target.position, isHighDamage);
    }
    if (!skipBattleAnimation.value && battleFxLevel.value === "high" && (isHighDamage || isCritical)) {
      isScreenShaking.value = true;
      window.setTimeout(() => {
        isScreenShaking.value = false;
      }, 140);
    }
    
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
    showDamageText(attackResult.damage, target.side, target.position, {
      kind: isHighDamage ? "high" : "normal",
      critical: isCritical,
      tag: isCritical ? "CRIT" : "",
    });

    if (attackResult.isTargetDied) {
      addReport(`阵亡！`, target.general, target.side);
      // 显示阵亡台词
      if (target.general.quotes && target.general.quotes.death && target.general.quotes.death.length > 0) {
        const deathQuote = getRandomQuote(target.general.quotes.death);
        showQuoteText(deathQuote, target.side, target.position);
      }
    } else {
      addReport(
        `剩余兵力：${attackResult.newTroops}`,
        target.general,
        target.side,
      );
    }
  } else {
    if (!skipBattleAnimation.value) {
      triggerTargetHitReaction(target.side, target.position, false);
    }
    showDamageText(0, target.side, target.position, {
      kind: "blocked",
      tag: "格挡",
    });
    addReport(`${attackTypeText}攻击被格挡，未造成伤害！`);
  }

  if (!skipBattleAnimation.value) {
    markAttackerPhase(attacker.side, attacker.position, "recover");
    await waitBattle(fx.recoverMs + 320);
  }

  addReport(
    `${attackerPrefix}${attacker.position}【${attacker.general.name}】行动结束`,
  );
  if (!skipBattleAnimation.value) {
    clearAttackerPhase(attacker.side, attacker.position);
  }
  attackingCard.value = null;
};

const checkGameOver = () => {
  if (enemyFormation.value.大营 && enemyFormation.value.大营.isDead) {
    // 胜利结算：进入崔珏裁赏
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
    addCuiJueQuote("victory");
    addReport(`恭喜！你击败了敌方大营，获得胜利！`);
    openVictorySettlement();
    return true;
  }

  if (playerFormation.value.大营 && playerFormation.value.大营.isDead) {
    // 失败重置
    restoreBattleStateToInitial({ preserveTroops: true });
    addCuiJueQuote("defeat");
    addReport("我方大营阵亡，战斗失败！");
    setTimeout(() => {
      alert("战斗失败！恢复游戏初始数据！");
      resetGame();
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
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
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
    // 胜利结算：进入崔珏裁赏
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
    addCuiJueQuote("victory");
    addReport("回合结束！我方兵力占优，获得胜利！");
    openVictorySettlement();
  } else if (enemyTroops > playerTroops) {
    // 失败重置
    restoreBattleStateToInitial();
    addCuiJueQuote("defeat");
    addReport("回合结束！敌方兵力占优，战斗失败！");
    setTimeout(() => {
      alert("战斗失败！恢复游戏初始数据！");
      resetGame();
    }, 1000);
  }
};

const _advanceTime = () => {
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
  clearAllBattleFx();
  // 恢复游戏开始时的数据
  money.value = initialGameData.money;
  currentYear.value = initialGameData.currentYear;
  currentWave.value = initialGameData.currentWave;
  currentTurn.value = 0;
  currentCommand.value = 0;
  totalConscripts.value = maxConscripts;
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
  playerRelics.value = [];
  enemyRelics.value = [];
  playerRelicCandidates.value = [];
  showRelicSelector.value = false;
  showVictoryRewardSelector.value = false;
  victoryRewardOptions.value = [];
  isResolvingVictoryReward.value = false;
  hasShownNewRunQuote.value = false;
  battleReports.value = [];
  playerRecoveryRounds.value = {};
  committedConscripts.value = 0;
  gamePhase.value = "map_select";
  showEventMap.value = true;
  pendingNodeId.value = null;
  pendingBattleNodeType.value = null;
  if (gameLoaded.value) {
    resetRunProgress();
    startRelicSelection();
  }
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

const getAllAllies = (side: "player" | "enemy"): Array<{
  general: General;
  side: "player" | "enemy";
  position: string;
}> => {
  const allies: Array<{
    general: General;
    side: "player" | "enemy";
    position: string;
  }> = [];

  const formation = side === "player" ? playerFormation.value : enemyFormation.value;

  Object.entries(formation).forEach(([position, general]) => {
    if (general && !general.isDead) {
      allies.push({
        general,
        side,
        position,
      });
    }
  });

  return allies;
};

const _initializeSpeedUnits = () => {
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

const _updateSpeed = () => {
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

const _checkSpeedThreshold = () => {
  const readyUnit = speedUnits.value.find(
    (unit) => unit.speed >= 100 && !unit.general.isDead,
  );
  if (readyUnit) {
    return readyUnit;
  }
  return null;
};

const _resetUnitSpeed = (unit: SpeedUnit) => {
  unit.speed = 0;
  unit.isActive = false;
};

const startBattle = async () => {
  clearAllBattleFx();
  if (!pendingBattleNodeType.value) {
    addReport("当前没有待处理的战斗节点。");
    showEventMap.value = true;
    return;
  }
  if (areAllOwnedGeneralsResting()) {
    addReport("所有武将均在休整中，战役结束，回到第一轮。");
    alert("所有武将都在休整中，游戏结束！将重置到第一轮。");
    resetGame();
    return;
  }

  if (!playerFormation.value.大营) {
    addReport("请至少在大营上阵一名武将！");
    return;
  }
  const hasZeroTroops = Object.values(playerFormation.value).some(
    (slot) => slot !== null && slot.troops <= 0,
  );
  if (hasZeroTroops) {
    addReport("请先为上阵武将分配兵力后再开始战斗。");
    return;
  }

  if (playerRelics.value.length === 0) {
    startRelicSelection();
    addReport("请先选择我方遗物，再开始战斗。");
    return;
  }
  addCuiJueQuote("battle");
  showEventMap.value = true;
  isBattlePaused.value = false;
  lockBattleConscriptSnapshot();
  isBattleActive.value = true;
  captureBattleStartSnapshot();

  // 战斗循环 - 共8回合
  for (let i = 1; i <= 8; i++) {
    currentTurn.value = i;
    addReport(
      `<span style="color: #667eea; font-weight: bold;">========== 第 ${i} 回合开始！ ==========</span>`,
    );

    // 收集所有存活的武将
    const allUnits: any = [];
    
    // 添加我方武将
    Object.entries(playerFormation.value).forEach(([position, general]) => {
      if (general && !general.isDead) {
        allUnits.push({
          general,
          side: "player" as const,
          position
        });
      }
    });
    
    // 添加敌方武将
    Object.entries(enemyFormation.value).forEach(([position, general]) => {
      if (general && !general.isDead) {
        allUnits.push({
          general,
          side: "enemy" as const,
          position
        });
      }
    });
    
    // 按速度从快到慢排序（叠加遗物速度效果）
    allUnits.sort(
      (a: any, b: any) =>
        getAdjustedSpeed(b.general, b.side) - getAdjustedSpeed(a.general, a.side),
    );
    
    let unitIndex = 1;
    
    // 依次执行每个武将的行动
    for (const unit of allUnits) {
      if (unit.general.isDead) continue;
      
      // 详细播报当前行动者信息
      const sidePrefix = unit.side === "player" ? "我方" : "敌方";
      const effectiveSpeed = getAdjustedSpeed(unit.general, unit.side);
      addReport(
        `== ${unitIndex}. ${sidePrefix}${unit.position}【${unit.general.name}】开始行动（速度：${Math.floor(effectiveSpeed)}）==`,
      );
      addReport(
        `兵力：${unit.general.troops}，攻击：${unit.general.attack}，防御：${unit.general.defense}，策略：${unit.general.strategy}，速度：${unit.general.speed}，攻击距离：${unit.general.attackRange}，攻城：${unit.general.siege}`,
      );

      // 角色回合开始时触发turnStart事件（用于减少降攻等效果的持续回合数）
      const turnStartContext = {
        type: "turnStart",
        event: "startOfTurn",
        currentTroops: unit.general.troops,
        maxTroops: unit.general.maxTroops,
      };

      // 处理当前角色的技能效果
      triggerSkillEffects(unit.general, turnStartContext);
      applyRelicDebuffResist(unit);

      // 直接处理当前角色的skillEffects中的持续效果
      if (unit.general.skillEffects) {
        // 处理伤害输出降低效果
        if (unit.general.skillEffects.damageOutputReductionDuration > 0) {
          unit.general.skillEffects.damageOutputReductionDuration -= 1;
          addReport(
            `【${unit.general.name}】的降攻效果剩余${unit.general.skillEffects.damageOutputReductionDuration}回合`,
          );
          if (unit.general.skillEffects.damageOutputReductionDuration === 0) {
            const source = unit.general.skillEffects.damageOutputReductionSource || "";
            unit.general.skillEffects.damageOutputReduction = 0;
            unit.general.skillEffects.damageOutputReductionSource = '';
            addReport(
              `【${unit.general.name}】${source}的伤害输出降低效果结束！`,
            );
          }
        }

        // 处理战法发动概率降低效果
        if (unit.general.skillEffects.skillTriggerReductionDuration > 0) {
          unit.general.skillEffects.skillTriggerReductionDuration -= 1;
          addReport(
            `【${unit.general.name}】的战法发动概率降低效果剩余${unit.general.skillEffects.skillTriggerReductionDuration}回合`,
          );
          if (unit.general.skillEffects.skillTriggerReductionDuration === 0) {
            const source = unit.general.skillEffects.skillTriggerReductionSource || "";
            unit.general.skillEffects.skillTriggerReduction = 0;
            unit.general.skillEffects.skillTriggerReductionSource = '';
            addReport(
              `【${unit.general.name}】${source}的战法发动概率降低效果结束！`,
            );
          }
        }

        // 处理防御降低效果
        if (unit.general.skillEffects.defenseReductionDuration > 0) {
          unit.general.skillEffects.defenseReductionDuration -= 1;
          addReport(
            `【${unit.general.name}】的防御降低效果剩余${unit.general.skillEffects.defenseReductionDuration}回合`,
          );
          if (unit.general.skillEffects.defenseReductionDuration === 0) {
            const source = unit.general.skillEffects.defenseReductionSource || "";
            unit.general.skillEffects.defenseReduction = 0;
            unit.general.skillEffects.defenseReductionSource = '';
            addReport(
              `【${unit.general.name}】${source}的防御降低效果结束！`,
            );
          }
        }

        // 处理回血增益效果
        if (unit.general.skillEffects.recoveryFromDebuffDuration > 0) {
          unit.general.skillEffects.recoveryFromDebuffDuration -= 1;
          addReport(
            `【${unit.general.name}】的回血增益效果剩余${unit.general.skillEffects.recoveryFromDebuffDuration}回合`,
          );
          if (unit.general.skillEffects.recoveryFromDebuffDuration === 0) {
            const source = unit.general.skillEffects.recoveryFromDebuffSource || "";
            unit.general.skillEffects.recoveryFromDebuff = 0;
            unit.general.skillEffects.recoveryFromDebuffSource = '';
            addReport(
              `【${unit.general.name}】${source}的回血增益效果结束！`,
            );
          }
        }

        // 处理怯战（无法普攻）效果
        if (unit.general.skillEffects.cannotNormalAttackDuration > 0) {
          unit.general.skillEffects.cannotNormalAttackDuration -= 1;
          addReport(
            `【${unit.general.name}】的怯战效果剩余${unit.general.skillEffects.cannotNormalAttackDuration}回合`,
          );
          if (unit.general.skillEffects.cannotNormalAttackDuration === 0) {
            const source = unit.general.skillEffects.cannotNormalAttackSource || "";
            unit.general.skillEffects.cannotNormalAttack = false;
            unit.general.skillEffects.cannotNormalAttackSource = '';
            addReport(
              `【${unit.general.name}】${source}的怯战效果结束！`,
            );
          }
        }
      }

      // 触发指挥战法效果（每回合开始时）
      if (unit.general.skills) {
        for (const skill of unit.general.skills) {
          console.log(`检查单位【${unit.general.name}】的技能，类型: ${skill.type}, 名称: ${skill.name}`);
          if (skill.type === "command") {
            console.log(`触发【${unit.general.name}】的指挥战法【${skill.name}】！`);
            const commandSkillContext = {
              type: "command",
              event: "turnStart",
              currentTroops: unit.general.troops,
              maxTroops: unit.general.maxTroops,
              addReport,
              allies: getAllAllies(unit.side)
            };
            executeSkillEffectWithHealFx(() => skill.effect(unit.general, commandSkillContext));
          }
        }
      }

      // 触发主动战法
      let activeSkillTriggered = false;
      if (unit.general.skills) {
        for (const skill of unit.general.skills) {
          if (skill.type === "active") {
            // 触发前检查是否有战法发动概率降低效果
            const beforeTriggerContext = {
              type: "activeSkill",
              event: "beforeTrigger",
              currentTroops: unit.general.troops,
              maxTroops: unit.general.maxTroops,
              addReport
            };
            const beforeTriggerResult = executeSkillEffectWithHealFx(() =>
              skill.effect(unit.general, beforeTriggerContext),
            );

            // 应用战法发动概率降低效果
            let finalTriggerChance = 1;
            if (beforeTriggerResult && beforeTriggerResult.triggerReduction) {
              finalTriggerChance = 1 - beforeTriggerResult.triggerReduction;
            }
            finalTriggerChance += getRelicEffectValue(unit.side, "activeSkillChancePct");
            finalTriggerChance = Math.max(0, Math.min(1, finalTriggerChance));

            // 检查是否触发
            if (Math.random() < finalTriggerChance) {
              const targets = getTargetsInRange({
                general: unit.general,
                side: unit.side,
                position: unit.position,
              });

              // 找到友军目标（用于治疗效果）
              const allies: General[] = [];
              if (unit.side === "player") {
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
                  currentTroops: unit.general.troops,
                  maxTroops: unit.general.maxTroops,
                  targets: targets.map(t => t.general),
                  allies: allies,
                  addReport
                };
                const skillResult = executeSkillEffectWithHealFx(() =>
                  skill.effect(unit.general, skillContext),
                );
                if (skillResult && skillResult.triggered) {
                  activeSkillTriggered = true;
                  // 显示技能释放台词
                  if (unit.general.quotes && unit.general.quotes.skill && unit.general.quotes.skill.length > 0) {
                    const skillQuote = getRandomQuote(unit.general.quotes.skill);
                    showQuoteText(skillQuote, unit.side, unit.position);
                  }
                  
                  // 为技能伤害添加受击音效和动画
                  targets.forEach((target) => {
                    // 播放受击音效
                    const audio = new Audio('/assets/audios/hint.mp4');
                    audio.play().catch(e => console.error('播放音效失败:', e));
                    triggerTargetHitReaction(target.side, target.position, false);
                  });
                  
                  break;
                }
              }
            }
          }
        }
      }

      // 如果主动战法未触发，执行普通攻击（物理伤害）
      if (!activeSkillTriggered) {
        // 怯战状态下无法进行普通攻击
        if (
          unit.general.skillEffects?.cannotNormalAttack &&
          unit.general.skillEffects?.cannotNormalAttackDuration > 0
        ) {
          addReport(`【${unit.general.name}】处于怯战状态，无法发动普通攻击！`);
          unitIndex++;
          if (checkGameOver()) {
            isBattleActive.value = false;
            clearAllBattleFx();
            return;
          }
          await waitBattle(400);
          continue;
        }

        const targets = getTargetsInRange({
          general: unit.general,
          side: unit.side,
          position: unit.position,
        });

        if (targets.length > 0) {
          addReport(`可攻击目标：${targets.length}个`);
          const target = targets[Math.floor(Math.random() * targets.length)];
          // 普通攻击都是物理伤害
          await performAttackWithAnimation(
            {
              general: unit.general,
              side: unit.side,
              position: unit.position,
            },
            target,
            "physical"
          );

          // 骑兵连击（遗物）
          if (
            unit.general.soldierType === "骑兵" &&
            getRelicEffectValue(unit.side, "cavalryDoubleStrikeChance") > 0 &&
            Math.random() < getRelicEffectValue(unit.side, "cavalryDoubleStrikeChance")
          ) {
            const extraTargets = getTargetsInRange({
              general: unit.general,
              side: unit.side,
              position: unit.position,
            });
            if (extraTargets.length > 0) {
              const extraTarget =
                extraTargets[Math.floor(Math.random() * extraTargets.length)];
              addReport(`【${unit.general.name}】触发遗物连击，追加一次攻击！`);
              await performAttackWithAnimation(
                {
                  general: unit.general,
                  side: unit.side,
                  position: unit.position,
                },
                extraTarget,
                "physical",
              );
            }
          }
        } else {
          addReport(`范围内没有可攻击的目标！`);
        }
      }

      unitIndex++;

      // 检查游戏结束条件
      if (checkGameOver()) {
        isBattleActive.value = false;
        clearAllBattleFx();
        return;
      }

      // 增加行动间隔时间，让用户能看到详细播报
      await waitBattle(400);
    }

    // 回合统计
    if (allUnits.length > 0) {
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
    applyEndTurnRelicEffects();

    // 回合结束播报
    addReport(`========== 第 ${i} 回合结束！ ==========`);

    // 回合间等待时间
    if (i < 8) {
      await waitBattle(500);
    }
  }

  // 8回合结束后
  addReport("8回合结束！");
  
  // 检查是否和局（双方大营都存活）
  const playerCavalryAlive = playerFormation.value.大营 && !playerFormation.value.大营.isDead;
  const enemyCavalryAlive = enemyFormation.value.大营 && !enemyFormation.value.大营.isDead;
  
  if (playerCavalryAlive && enemyCavalryAlive) {
    restoreBattleStateToInitial({ preserveTroops: true });
    applyPlayerRecoveryForDeaths();
    addReport("<span style='color: #f39c12; font-weight: bold;'>战斗结果：和局！双方大营都存活。</span>");
  } else {
    checkGameOverByTurns();
  }
  
  isBattleActive.value = false;
  isBattlePaused.value = false;
  clearAllBattleFx();
};

const _nextWave = async () => {
  await enterNextBattleAfterReward();
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
  color: #fff6c2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 1000;
  animation: damagePop 1.2s ease-out forwards;
  will-change: transform, opacity;
}

.damage-text .damage-tag {
  display: block;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.damage-text.damage-normal {
  color: #fff6c2;
}

.damage-text.damage-high {
  color: #ff9d2f;
  font-size: 30px;
}

.damage-text.damage-blocked {
  color: #d7dee8;
  font-size: 20px;
}

.damage-text.damage-heal {
  color: #67f3a8;
  font-size: 34px;
  font-weight: 900;
  text-shadow:
    0 0 18px rgba(103, 243, 168, 0.85),
    0 0 34px rgba(128, 255, 195, 0.45),
    2px 2px 4px rgba(0, 0, 0, 0.45);
  animation: healPop 1.05s cubic-bezier(0.18, 0.85, 0.28, 1) forwards;
}

.damage-text.damage-heal .damage-tag {
  color: #d4ffe9;
  text-shadow: 0 0 10px rgba(103, 243, 168, 0.85);
  letter-spacing: 1.2px;
}

.damage-text.damage-healSpark {
  color: #87ffd0;
  font-size: 18px;
  text-shadow: 0 0 8px rgba(135, 255, 208, 0.85);
  animation: healSpark 0.72s ease-out forwards;
}

.damage-text.crit {
  color: #ff5f3a;
  font-size: 34px;
  text-shadow: 0 0 14px rgba(255, 95, 58, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.damage-text.crit .damage-tag {
  color: #ffd166;
  text-shadow: 0 0 6px rgba(255, 209, 102, 0.8);
}

.quote-text {
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 200px;
  animation: quoteFloat 3s ease-out forwards;
}

@keyframes quoteFloat {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  20% {
    opacity: 1;
    transform: translateY(-10px);
  }
  80% {
    opacity: 1;
    transform: translateY(-10px);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
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

@keyframes healPop {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.68);
  }
  24% {
    opacity: 1;
    transform: translateY(-8px) scale(1.2);
  }
  62% {
    opacity: 1;
    transform: translateY(-26px) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translateY(-52px) scale(0.94);
  }
}

@keyframes healSpark {
  0% {
    opacity: 0.95;
    transform: translateY(0) scale(0.7) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-26px) scale(1.3) rotate(35deg);
  }
}

.card.target-heal-pulse {
  animation: cardHealPulse 0.65s ease-out;
  box-shadow:
    0 0 0 2px rgba(120, 255, 191, 0.72),
    0 0 26px rgba(120, 255, 191, 0.52),
    0 0 38px rgba(120, 255, 191, 0.25);
}

@keyframes cardHealPulse {
  0% {
    filter: brightness(1) saturate(1);
    transform: scale(1);
  }
  28% {
    filter: brightness(1.24) saturate(1.3);
    transform: scale(1.018);
  }
  100% {
    filter: brightness(1) saturate(1);
    transform: scale(1);
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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 30px;
  min-height: 520px;
}

.middle-hub {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 16px;
  align-items: stretch;
}

.middle-hub-left,
.middle-hub-right {
  min-width: 0;
}

.map-toggle-btn {
  position: absolute;
  left: 10px;
  top: 120px;
  z-index: 25;
  border: 1px solid rgba(88, 64, 35, 0.65);
  background: rgba(255, 248, 232, 0.95);
  color: #5b4124;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.battle-map-drawer {
  position: absolute;
  left: 10px;
  top: 160px;
  width: min(980px, calc(100% - 20px));
  max-height: calc(100% - 200px);
  z-index: 24;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-105%);
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.battle-map-drawer.open {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.battle-map-drawer .event-map-board {
  min-height: 420px;
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

.relic-bar {
  min-height: 60px;
  border: 1px solid rgba(200, 70, 70, 0.65);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
}

.relic-auto-btn {
  border: 1px solid rgba(255, 215, 0, 0.5);
  background: rgba(45, 50, 60, 0.92);
  color: #f6e7bf;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.relic-auto-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.relic-auto-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.troop-ops-bar {
  margin-top: 8px;
  margin-bottom: 6px;
  min-height: 42px;
  border: 1px solid rgba(200, 70, 70, 0.65);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
}

.relic-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(35, 40, 45, 0.92);
  color: #f6e7bf;
  border: 1px solid rgba(255, 215, 0, 0.35);
  font-size: 13px;
}

.relic-item.rarity-common {
  border-color: rgba(226, 232, 240, 0.85);
}

.relic-item.rarity-uncommon {
  border-color: rgba(94, 203, 115, 0.9);
}

.relic-item.rarity-rare {
  border-color: rgba(141, 109, 247, 0.9);
}

.relic-item.rarity-legendary {
  border-color: rgba(245, 191, 79, 0.95);
  box-shadow: 0 0 10px rgba(245, 191, 79, 0.2);
}

.relic-item.empty {
  background: rgba(40, 40, 40, 0.55);
  color: #ddd;
  border-style: dashed;
}

.relic-icon {
  font-size: 18px;
  line-height: 1;
}

.relic-name {
  font-weight: 700;
}

.formation.horizontal {
  margin-top: 18px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.relic-selector-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.relic-selector-panel {
  width: min(980px, 92vw);
  background: #f6f1e6;
  border-radius: 12px;
  border: 2px solid #b98d52;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.relic-selector-panel h3 {
  margin: 0 0 14px;
  text-align: center;
  color: #6b4b1e;
}

.cui-jue-dialog {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(34, 24, 12, 0.08);
}

.cui-jue-portrait {
  width: 88px;
  height: 118px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #8b6a3f;
  background: #eee;
}

.cui-jue-bubble {
  flex: 1;
  line-height: 1.6;
  color: #4b3921;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cfb17f;
  background: #fffaf0;
}

.relic-candidate-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.relic-candidate-card {
  border: 1px solid #c9a56a;
  border-radius: 10px;
  padding: 12px;
  background: #fffdf7;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.relic-candidate-card.rarity-common {
  border-color: #d9dee6;
  box-shadow: inset 0 0 0 1px rgba(217, 222, 230, 0.35);
}

.relic-candidate-card.rarity-uncommon {
  border-color: #5ecb73;
  box-shadow: inset 0 0 0 1px rgba(94, 203, 115, 0.3);
}

.relic-candidate-card.rarity-rare {
  border-color: #8d6df7;
  box-shadow: inset 0 0 0 1px rgba(141, 109, 247, 0.35);
}

.relic-candidate-card.rarity-legendary {
  border-color: #f5bf4f;
  box-shadow: inset 0 0 0 1px rgba(245, 191, 79, 0.45);
}

.reward-panel .relic-candidate-card {
  min-height: 180px;
}

.layer-reward-panel h3 {
  color: #c0392b;
  font-size: 22px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.event-map-panel {
  height: 100%;
  border: 1px solid rgba(120, 80, 40, 0.45);
  border-radius: 10px;
  background: rgba(255, 248, 232, 0.9);
  padding: 12px;
}

.event-map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5b4124;
  font-weight: 700;
  margin-bottom: 8px;
}

.event-map-board {
  position: relative;
  min-height: 520px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.66), rgba(245, 238, 224, 0.78));
  border: 1px solid rgba(120, 80, 40, 0.25);
  overflow: hidden;
  padding-right: 140px;
}

.event-map-links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.event-map-link {
  fill: none;
  stroke: rgba(110, 132, 152, 0.46);
  stroke-width: 0.92;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 1.5px rgba(125, 154, 180, 0.2));
  transition: stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease;
}

.event-map-link.visited {
  stroke: rgba(138, 156, 171, 0.62);
  opacity: 0.98;
}

.event-map-link.reachable {
  stroke: rgba(188, 216, 235, 0.92);
  stroke-width: 1.22;
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(176, 210, 233, 0.35));
}

.event-node-btn {
  position: absolute;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(96, 70, 40, 0.35);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #5b4124;
  width: 72px;
  height: 72px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: not-allowed;
  opacity: 0.5;
  z-index: 2;
}

.event-node-btn.selectable {
  cursor: pointer;
  opacity: 1;
}

.event-node-btn.selectable:hover {
  transform: translate(-50%, calc(-50% - 2px));
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.event-node-btn.pending {
  border-color: #e09b42;
  box-shadow: 0 0 0 2px rgba(224, 155, 66, 0.35);
}

.event-node-btn.current {
  border-color: #6fbbff;
  box-shadow: 0 0 0 2px rgba(111, 187, 255, 0.35);
}

.event-node-btn.visited {
  background: rgba(232, 232, 232, 0.9);
}

.event-node-icon {
  width: 51px;
  height: 51px;
  object-fit: contain;
  filter: drop-shadow(0 0 1.5px rgba(20, 20, 20, 0.35));
}

.map-legend {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 3;
  width: 220px;
  border: 1px solid rgba(123, 90, 52, 0.4);
  border-radius: 8px;
  background: rgba(255, 250, 241, 0.9);
  padding: 8px;
}

.map-legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.map-legend-title {
  font-size: 14px;
  font-weight: 700;
  color: #6a4b28;
  margin-bottom: 0;
}

.map-legend-toggle {
  border: 1px solid rgba(123, 90, 52, 0.45);
  background: rgba(255, 255, 255, 0.75);
  color: #6a4b28;
  border-radius: 6px;
  font-size: 12px;
  padding: 2px 8px;
  cursor: pointer;
}

.map-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.map-legend-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 0 2px rgba(20, 20, 20, 0.25));
}

.map-legend-text {
  color: #5b4124;
  font-size: 16px;
  font-weight: 600;
}

.battle-stage {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20px;
  flex: 1;
}

.relic-candidate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.relic-candidate-icon {
  font-size: 28px;
  text-align: center;
}

.relic-candidate-name {
  margin-top: 6px;
  font-weight: 700;
  color: #43311b;
  text-align: center;
}

.relic-candidate-effect {
  margin-top: 6px;
  color: #5a4b34;
  font-size: 12px;
  line-height: 1.45;
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
  display: block;
  position: relative;
}

.troops-bar-container.active {
  filter: brightness(1.05);
}

.troops-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: ew-resize;
}

.troops-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.troops-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  z-index: 10;
  pointer-events: none;
  display: block;
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

.card.attacker-windup {
  animation: attackerWindup 0.09s ease-out;
}

.card.attacker-dash {
  animation: attackerDash 0.12s ease-out forwards;
}

.card.attacker-recover {
  animation: attackerRecover 0.18s ease-in forwards;
}

.card.target-hit-shake {
  animation: targetHitShake 0.14s ease-out;
}

.card.target-hit-shake.target-hit-heavy {
  animation-name: targetHitShakeHeavy;
}

.card.target-hit-flash::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.42);
  pointer-events: none;
  z-index: 6;
  animation: targetHitFlash 0.11s ease-out;
}

.card.target-hit-outline {
  animation: targetHitOutline 0.22s ease-out;
}

.screen-shake {
  animation: screenShake 0.14s linear;
}

@keyframes attackerWindup {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  100% {
    transform: scale(1.04);
    filter: brightness(1.12);
  }
}

@keyframes attackerDash {
  0% {
    transform: translateX(0) scale(1.04);
  }
  100% {
    transform: translateX(calc(var(--dash-distance, 90px) * var(--dash-direction, 1))) scale(1.06);
  }
}

@keyframes attackerRecover {
  0% {
    transform: translateX(calc(var(--dash-distance, 90px) * var(--dash-direction, 1))) scale(1.04);
  }
  100% {
    transform: translateX(0) scale(1);
  }
}

@keyframes targetHitShake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-8px) rotate(-1.2deg); }
  50% { transform: translateX(9px) rotate(1.4deg); }
  75% { transform: translateX(-5px) rotate(-0.8deg); }
  100% { transform: translateX(0) rotate(0deg); }
}

@keyframes targetHitShakeHeavy {
  0% { transform: translateX(0); }
  25% { transform: translateX(-12px) rotate(-1.8deg) scale(0.985); }
  50% { transform: translateX(14px) rotate(1.9deg) scale(0.992); }
  75% { transform: translateX(-8px) rotate(-1deg); }
  100% { transform: translateX(0) rotate(0deg) scale(1); }
}

@keyframes targetHitFlash {
  0% { opacity: 0; }
  40% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes targetHitOutline {
  0% { box-shadow: 0 0 0 rgba(255, 76, 76, 0); }
  45% { box-shadow: 0 0 0 2px rgba(255, 76, 76, 0.95), 0 0 22px rgba(255, 76, 76, 0.65); }
  100% { box-shadow: 0 0 0 rgba(255, 76, 76, 0); }
}

@keyframes screenShake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
  100% { transform: translateX(0); }
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

.star.active.enhanced {
  color: #ff8c00;
  text-shadow: 0 0 6px rgba(255, 140, 0, 0.7), 1px 1px 2px rgba(0, 0, 0, 0.65);
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

  .middle-hub {
    grid-template-columns: 1fr;
  }

  .map-toggle-btn {
    top: 96px;
    left: 8px;
  }

  .battle-map-drawer {
    left: 8px;
    top: 136px;
    max-height: calc(100% - 170px);
  }

  .event-map-board {
    min-height: 440px;
    padding-right: 12px;
    padding-bottom: 150px;
  }

  .map-legend {
    top: auto;
    bottom: 10px;
    right: 10px;
    width: calc(100% - 20px);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 8px;
  }

  .map-legend-title {
    grid-column: 1 / -1;
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
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  background: url('/assets/ui_top_bar_status.jpg') no-repeat center center;
  background-size: cover;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
}

.speed-btn {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speed-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.speed-btn.active {
  background: rgba(255, 255, 255, 0.75);
  color: #6a1f1f;
  font-weight: 700;
  border-color: rgba(255, 255, 255, 0.8);
}

.speed-btn.skip-toggle {
  min-width: 96px;
  font-size: 11px;
  padding: 8px 8px;
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

  .middle-hub {
    grid-template-columns: 1fr;
  }

  .map-toggle-btn {
    top: 88px;
  }

  .battle-map-drawer {
    top: 128px;
  }

  .battle-stage {
    flex-direction: column;
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

  .speed-controls {
    width: 100%;
    justify-content: center;
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

/* Buff状态标记 - 绿色 */
.status-icon.buff {
  background: rgba(40, 180, 80, 0.85);
  border: 1px solid rgba(150, 255, 150, 0.4);
}

.status-icon.buff:hover {
  background: rgba(30, 150, 60, 0.9);
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
