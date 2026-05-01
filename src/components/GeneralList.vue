<template>
  <div class="general-list-overlay" @click="$emit('close')">
    <div class="general-list" @click.stop>
      <div class="list-header">
        <h3>选择武将</h3>
        <button class="close-btn" @click="$emit('close')"></button>
      </div>
      <div class="general-items">
        <div v-if="generals.length === 0" class="empty-message">
          <p>暂无武将</p>
          <p>请先抽取卡牌</p>
        </div>
        <div
          v-for="general in generals"
          :key="general.id"
          class="general-item"
          :class="{
            deployed: isDeployed(general),
            selected: isActiveSlotGeneral(general),
            resting: isResting(general),
          }"
          :style="{
            '--rarity-border': getBorderColor(general),
          }"
          @click="handleSelect(general)"
          @contextmenu="$emit('show-tooltip', general, $event)"
        >
          <div
            class="card player"
            :style="{
              backgroundImage: `url(${general.avatar ? API_BASE_URL + general.avatar : general.gender === '女' ? API_BASE_URL + '/public/images/ancient_character_women.webp' : API_BASE_URL + '/public/images/ancient_character_men.webp'})`,
            }"
          >
            <div class="card-top">
              <div class="card-left-top">
                <div class="card-dynasty">{{ general.dynasty }}</div>
                <div class="card-name">{{ general.name }}</div>
              </div>
              <div class="card-right-top">
                <div class="card-stars">
                  <span
                    v-for="i in getMaxStar(general)"
                    :key="i"
                    class="star"
                    :class="{
                      active: i <= getSynthStar(general),
                      enhanced: getSynthStar(general) > 0,
                    }"
                    >★</span
                  >
                </div>
              </div>
            </div>
            <div v-if="isDeployed(general)" class="deployed-badge">已上阵</div>
            <div v-if="isResting(general)" class="resting-badge">
              休整{{ getRecoveryRounds(general) }}轮
            </div>
            <div class="card-middle"></div>

            <!-- 羁绊信息 -->
            <div v-if="getGeneralBonds(general).length > 0" class="card-bonds">
              <div
                v-for="bondInfo in getGeneralBonds(general)"
                :key="bondInfo.bond.id"
                class="bond-info"
              >
                <span class="bond-name">{{ bondInfo.bond.name }}</span>
                <span class="bond-members">
                  [
                  <span class="bond-member" v-for="(name, idx) in bondInfo.currentMembers" :key="name">
                    {{ name }}<span v-if="idx < bondInfo.currentMembers.length - 1">、</span>
                  </span>
                  <span class="bond-missing" v-if="bondInfo.missingMembers.length > 0">
                    <span v-for="(name, idx) in bondInfo.missingMembers" :key="name">
                      {{ name }}<span v-if="idx < bondInfo.missingMembers.length - 1">、</span>
                    </span>
                  </span>
                  ]
                </span>
              </div>
            </div>

            <!-- 定位标签 -->
            <div v-if="getGeneralRoles(general).length > 0" class="card-roles">
              <span v-for="role in getGeneralRoles(general)" :key="role" class="role-tag">{{ role }}</span>
            </div>

            <div class="card-bottom">
              <div class="card-bottom-item">
                <span class="card-level">Lv.{{ general.level }}</span>
              </div>
              <div class="card-bottom-item">
                <span class="card-command">{{ general.leadership }}</span>
                <span class="card-bottom-label">统率</span>
              </div>
              <div class="card-bottom-item">
                <span class="card-soldier-type">{{
                  general.soldierType
                }}</span>
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
</template>

<script setup lang="ts">
import type { General, GeneralRarity } from "../skills/types";
import { RARITY_CONFIG } from "../skills/types";
import { BONDS } from "../skills/bonds";
import { RECRUIT_CONFIG } from "../skills/index";
import { detectRole } from "../skills/role-utils";

const RARITY_BORDER_COLORS: Record<GeneralRarity, string> = {
  common: "#6b7280",
  uncommon: "#22c55e",
  rare: "#a855f7",
  legendary: "#f59e0b",
};

interface BondInfo {
  bond: typeof BONDS[number];
  currentMembers: string[];
  missingMembers: string[];
}

// Helper to get member name from ID
const getMemberName = (id: number): string => {
  const config = RECRUIT_CONFIG.find(item => item.id === id);
  return config ? config.name : `武将${id}`;
};

const props = defineProps<{
  generals: General[];
  API_BASE_URL: string;
  deployedGeneralIds: number[];
  activeSlotGeneralId: number | null;
  restRoundsById: Record<number, number>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", general: General): void;
  (e: "show-tooltip", general: General, event: MouseEvent): void;
}>();

const getSynthStar = (general: General) => {
  const star = (general as General & { synthStar?: number }).synthStar;
  return typeof star === "number" ? Math.max(0, Math.min(5, star)) : 0;
};

const getMaxStar = (general: General) => {
  return RARITY_CONFIG[general.rarity]?.starLimit ?? 5;
};

const getBorderColor = (general: General) => {
  return RARITY_BORDER_COLORS[general.rarity] ?? "#8b6914";
};

const isDeployed = (general: General) => props.deployedGeneralIds.includes(general.id);

const isActiveSlotGeneral = (general: General) =>
  props.activeSlotGeneralId !== null && props.activeSlotGeneralId === general.id;

const getGeneralBonds = (general: General): BondInfo[] => {
  const result: BondInfo[] = [];

  for (const bond of BONDS) {
    // 检查此武将是否属于此羁绊
    if (!bond.memberIds.includes(general.id)) {
      continue;
    }

    // 获取当前拥有的武将名称
    const currentMembers: string[] = [];
    const missingMembers: string[] = [];

    for (const memberId of bond.memberIds) {
      if (memberId <= 0) continue;
      const member = props.generals.find(g => g.id === memberId);
      if (member) {
        currentMembers.push(member.name);
      } else {
        missingMembers.push(getMemberName(memberId));
      }
    }

    result.push({
      bond,
      currentMembers,
      missingMembers,
    });
  }

  return result;
};

const getRecoveryRounds = (general: General) => Math.max(0, (props.restRoundsById[general.id] || 0) - 1);

const isResting = (general: General) => getRecoveryRounds(general) > 0;

const getGeneralRoles = (general: General): string[] => {
  return detectRole(general);
};

const handleSelect = (general: General) => {
  if (isResting(general)) return;
  emit("select", general);
};
</script>

<style scoped>
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
  background: url(/assets/ui_border.png) center / 100% 100% no-repeat;
  width: 80%;
  max-width: 1000px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.general-items {
  margin-top: 50px;
  margin-bottom: 120px;
  margin-left: 60px;
  margin-right: 70px;
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  padding: 0 20px 20px;
  min-height: 200px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.list-header h3 {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.close-btn {
  background: url(/assets/btn_close_128.png) center/contain no-repeat;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.general-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.general-item:hover {
  transform: scale(1.05);
}

.general-item.deployed .card {
  box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.85), 0 8px 25px rgba(255, 140, 0, 0.4);
}

.general-item.selected .card {
  box-shadow: 0 0 0 3px rgba(102, 190, 255, 0.95), 0 0 14px rgba(102, 190, 255, 0.55);
}

.general-item.resting {
  cursor: not-allowed;
}

.general-item.resting .card {
  filter: grayscale(35%);
  box-shadow: 0 0 0 2px rgba(120, 130, 150, 0.85), 0 6px 18px rgba(80, 90, 110, 0.35);
}

.card {
  width: 100%;
  height: 280px;
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
  border: 3px solid var(--rarity-border, #8b6914);
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  z-index: 1;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
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

.deployed-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  background: rgba(255, 140, 0, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.resting-badge {
  position: absolute;
  top: 34px;
  right: 8px;
  z-index: 5;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  background: rgba(90, 100, 120, 0.92);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.card-middle {
  flex: 1;
  z-index: 1;
  position: relative;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-command {
  font-size: 12px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-bottom-label {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-soldier-type {
  font-size: 10px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-range {
  font-size: 12px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-bonds {
  position: absolute;
  bottom: 45px;
  left: 0;
  right: 0;
  padding: 0 4px;
  z-index: 3;
}

.bond-info {
  font-size: 9px;
  color: #ffd700;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 3px;
  padding: 2px 4px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bond-name {
  font-weight: bold;
  color: #ffd700;
}

.bond-members {
  color: #aaa;
  font-size: 8px;
}

.bond-member {
  color: #90ee90;
}

.bond-missing {
  color: #ff6b6b;
}

.card-roles {
  position: absolute;
  top: 32px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  max-width: 80%;
  z-index: 4;
}

.card-roles .role-tag {
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd700;
  border: 1px solid #ffd700;
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.4);
  white-space: nowrap;
}

/* 滚动条样式 */
.empty-message {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #ffffff;
  font-size: 18px;
  text-align: center;
}

.empty-message p:first-child {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffffff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.empty-message p:last-child {
  font-size: 16px;
  color: #e0e0e0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.general-items::-webkit-scrollbar {
  width: 8px;
}

.general-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.general-items::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.general-items::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
</style>
