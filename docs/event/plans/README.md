# 地图随机事件系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Goal:** 将 CardBattleGame.vue 中仅有 3 个简单事件替换为 22 个叙事分支事件，每个事件有历史典故文本 + 二选一选项，选择会改变后续事件池
>
> **Architecture:** 事件数据独立为 `src/events/` 模块；事件面板复用 RewardSelector 组件模式；状态（disabledEvents, flags, eventFlags）在 CardBattleGame.vue 内以 ref 管理
>
> **Tech Stack:** Vue 3 Composition API + TypeScript

---

## 文件结构

```
src/events/
  event-types.ts        # 事件类型定义
  events-data.ts        # 22 个事件数据（含正史出处）
  index.ts              # 导出

src/components/
  EventPanel.vue        # 新建：事件选择面板（复用 RewardSelector 模式）

src/views/
  CardBattleGame.vue    # 修改：替换 mapEventPool 和 resolveEventNode
```

---

## Task 1: 创建事件类型定义

**Files:**
- Create: `src/events/event-types.ts`

- [ ] **Step 1: 创建文件**

```typescript
// src/events/event-types.ts

import type { General } from '../skills/types';

/** 事件所属章节 */
export type EventChapter = 'sui' | 'chen' | 'tang' | 'tian' | 'zhen' | 'hun';

/** 效果类型 */
export type EffectType =
  | 'gold'
  | 'conscript'
  | 'attack'
  | 'defense'
  | 'speed'
  | 'strategy'
  | 'attributePercent'
  | 'moral'
  | 'specialBuff'
  | 'specialDebuff';

/** 效果目标 */
export type EffectTarget = 'all' | 'general' | 'specific';

/** 单个效果 */
export interface Effect {
  type: EffectType;
  value: number;
  /** 目标：全体 / 单体 / 指定武将名 */
  target?: EffectTarget;
  /** 当 target 为 specific 时，指定武将名 */
  targetName?: string;
  /** 持续回合数，不填为永久 */
  duration?: number;
  /** 关联的 skillEffects 中的 buffId */
  buffId?: string;
}

/** 单个选项 */
export interface EventChoice {
  label: string;
  description: string;
  effects: Effect[];
  /** 选择后禁用的其他事件ID */
  disablesEvents?: string[];
  /** 选择后解锁的事件ID */
  enablesEvents?: string[];
  /** 设置的全局标记 */
  flags?: string[];
}

/** 完整事件 */
export interface MapEvent {
  id: string;
  title: string;
  /** 历史典故文本 */
  narrative: string;
  /** 出处，如《资治通鉴》卷一九一 */
  narrativeSource: string;
  chapter: EventChapter;
  choiceA: EventChoice;
  choiceB: EventChoice;
  /** 触发所需武将（至少拥有其一） */
  requiredGenerals: string[];
  /** 拥有特定武将时的权重加成 */
  weightBonus: Record<string, number>;
}

/** 事件上下文（apply 时传入） */
export interface EventContext {
  generals: General[];
  money: number;
  totalConscripts: number;
  maxConscripts: number;
  addReport: (msg: string) => void;
}
```

---

## Task 2: 创建 22 个事件数据

**Files:**
- Create: `src/events/events-data.ts`

- [ ] **Step 1: 编写事件数据（22个事件）**

完整内容见 `docs/superpowers/specs/2026-04-30-地图随机事件设计.md` 中的事件列表。

每个事件结构：

```typescript
// src/events/events-data.ts

import type { MapEvent } from './event-types';

export const EVENTS_DATA: MapEvent[] = [
  {
    id: 'sui-001',
    title: '开皇之治',
    narrative: '开皇年间，天下初定。杨坚推行均田制，国库渐丰，百姓乐业。然太子之位悬而未决，暗流涌动。',
    narrativeSource: '《贞观政要》卷一',
    chapter: 'sui',
    choiceA: {
      label: '励精图治',
      description: '整顿吏治，减赋轻徭',
      effects: [
        { type: 'attributePercent', value: 8, target: 'all' },
        { type: 'gold', value: 200 },
      ],
      enablesEvents: ['zhen-002'], // 解锁贞观盛世
    },
    choiceB: {
      label: '大兴土木',
      description: '修建东都，劳役繁重',
      effects: [
        { type: 'gold', value: 500 },
        { type: 'speed', value: -10, target: 'all' },
      ],
      disablesEvents: ['zhen-002'], // 禁用贞观盛世
    },
    requiredGenerals: ['杨坚'],
    weightBonus: { '杨坚': 1.0 },
  },
  // ... 其余 21 个事件
];
```

22个事件按以下顺序定义：
1. `sui-001` 开皇之治
2. `sui-002` 仁寿宫变
3. `chen-001` 渡江灭陈
4. `chen-002` 贺若弼争功
5. `chen-003` 史万岁南征
6. `chen-004` 鱼俱罗之死
7. `tang-001` 晋阳起兵
8. `tang-002` 瓦岗争锋
9. `tang-003` 裴仁基归唐
10. `tang-004` 元吉失机
11. `tian-001` 尉迟恭降唐
12. `tian-002` 秦琼归唐
13. `tian-003` 程咬金三斧
14. `tian-004` 单骑救主
15. `zhen-001` 房谋杜断
16. `zhen-002` 渭水之盟
17. `zhen-003` 炀帝暴政
18. `zhen-004` 杨素遗计
19. `hun-001` 虎牢关之战
20. `hun-002` 洛阳之战
21. `hun-003` 窦建德之死
22. `hun-004` 江都之变

- [ ] **Step 2: 导出所有事件**

```typescript
// src/events/index.ts

export * from './event-types';
export * from './events-data';
```

---

## Task 3: 创建事件面板组件

**Files:**
- Create: `src/components/EventPanel.vue`

- [ ] **Step 1: 参考 RewardSelector.vue 的结构**

```vue
<!-- src/components/EventPanel.vue -->

<script setup lang="ts">
import type { MapEvent } from '../events/event-types';

const props = defineProps<{
  visible: boolean;
  event: MapEvent | null;
}>();

const emit = defineEmits<{
  (e: 'select', choice: 'A' | 'B'): void;
}>();

// 格式化效果显示
const formatEffect = (effects: Effect[]) => {
  return effects.map(e => {
    const sign = e.value >= 0 ? '+' : '';
    const val = e.value;
    const pct = ['attack','defense','speed','strategy','attributePercent','moral'].includes(e.type) ? '%' : '';
    return `${sign}${val}${pct} ${e.type}`;
  }).join(' / ');
};
</script>

<template>
  <Transition name="fade">
    <div v-if="visible && event" class="event-overlay">
      <div class="event-panel">
        <!-- 标题和出处 -->
        <div class="event-header">
          <h2>{{ event.title }}</h2>
          <p class="source">出处：{{ event.narrativeSource }}</p>
        </div>

        <!-- 历史文本 -->
        <div class="narrative-box">
          <p>{{ event.narrative }}</p>
        </div>

        <!-- 二选一 -->
        <div class="choices">
          <!-- 选项A -->
          <button class="choice-btn choice-a" @click="emit('select', 'A')">
            <div class="choice-label">{{ event.choiceA.label }}</div>
            <div class="choice-desc">{{ event.choiceA.description }}</div>
            <div class="choice-effects">{{ formatEffect(event.choiceA.effects) }}</div>
          </button>

          <!-- 选项B -->
          <button class="choice-btn choice-b" @click="emit('select', 'B')">
            <div class="choice-label">{{ event.choiceB.label }}</div>
            <div class="choice-desc">{{ event.choiceB.description }}</div>
            <div class="choice-effects">{{ formatEffect(event.choiceB.effects) }}</div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 居中面板，半透明背景，卷轴展开动画 */
.event-overlay { /* ... */ }
.event-panel { /* ... */ }
.choice-a { border: 2px solid #4ade80; background: linear-gradient(135deg, #052e16, #064e3b); }
.choice-b { border: 2px solid #f87171; background: linear-gradient(135deg, #4a0a0a, #7f1d1d); }
</style>
```

- [ ] **Step 2: 参考 RewardSelector.vue 编写完整样式和动画**

RewardSelector.vue 中有面板定位（居中、遮罩）、入场动画（slide-up + fade）、按钮样式。复用这些 CSS 模式。

---

## Task 4: 集成到 CardBattleGame.vue

**Files:**
- Modify: `src/views/CardBattleGame.vue`

- [ ] **Step 1: 在 script setup 中添加 import**

在文件顶部（其他 import 附近）添加：

```typescript
import { EVENTS_DATA } from '../events/events-data';
import type { MapEvent, EventChoice, EventContext, Effect } from '../events/event-types';
import EventPanel from '../components/EventPanel.vue';
```

- [ ] **Step 2: 添加事件相关状态 ref**

在现有状态 ref 声明区域附近添加：

```typescript
// 事件系统状态
const disabledEvents = ref<Set<string>>(new Set());     // 已禁用的事件ID
const eventFlags = ref<Set<string>>(new Set());          // 全局标记
const availableEvents = ref<MapEvent[]>([]);             // 当前可用事件池
const currentEvent = ref<MapEvent | null>(null);         // 当前展示的事件
const showEventPanel = ref(false);                        // 是否显示事件面板
```

- [ ] **Step 3: 添加效果应用函数**

```typescript
// 应用单个效果到游戏状态
const applyEffect = (effect: Effect) => {
  switch (effect.type) {
    case 'gold':
      money.value += effect.value;
      break;
    case 'conscript':
      totalConscripts.value = Math.min(
        maxConscripts,
        totalConscripts.value + effect.value,
      );
      break;
    case 'attributePercent': {
      const pct = effect.value / 100;
      generals.value.forEach(g => {
        g.attack = Math.round(g.attack * (1 + pct));
        g.defense = Math.round(g.defense * (1 + pct));
        g.strategy = Math.round(g.strategy * (1 + pct));
        g.speed = Math.round(g.speed * (1 + pct));
      });
      break;
    }
    case 'speed':
      generals.value.forEach(g => {
        g.speed = Math.round(g.speed * (1 + effect.value / 100));
      });
      break;
    case 'attack':
      generals.value.forEach(g => {
        g.attack = Math.round(g.attack * (1 + effect.value / 100));
      });
      break;
    case 'defense':
      generals.value.forEach(g => {
        g.defense = Math.round(g.defense * (1 + effect.value / 100));
      });
      break;
    case 'strategy':
      generals.value.forEach(g => {
        g.strategy = Math.round(g.strategy * (1 + effect.value / 100));
      });
      break;
    // ... 其他效果类型
  }
};

// 应用完整选项
const applyEventChoice = (choice: EventChoice) => {
  addReport(`你选择了「${choice.label}」：${choice.description}`);

  // 1. 应用即时效果
  choice.effects.forEach(effect => applyEffect(effect));

  // 2. 禁用事件
  choice.disablesEvents?.forEach(id => disabledEvents.value.add(id));

  // 3. 解锁事件（从 disabled 中移除）
  choice.enablesEvents?.forEach(id => disabledEvents.value.delete(id));

  // 4. 设置标记
  choice.flags?.forEach(flag => eventFlags.value.add(flag));
};
```

- [ ] **Step 4: 添加事件抽取函数**

```typescript
// 计算单个事件的权重
const calculateEventWeight = (event: MapEvent): number => {
  if (disabledEvents.value.has(event.id)) return 0;

  const ownedNames = generals.value.map(g => g.name);

  // 检查是否满足武将条件
  const hasRequired = event.requiredGenerals.some(name => ownedNames.includes(name));
  if (!hasRequired) return 0;

  let weight = 1.0;

  // 拥有武将加成
  event.requiredGenerals.forEach(name => {
    if (ownedNames.includes(name)) {
      weight += event.weightBonus[name] ?? 0.5;
    }
  });

  // 全局标记加成
  eventFlags.value.forEach(flag => {
    if (event.id.includes(flag)) weight += 0.5;
  });

  return weight;
};

// 从事件池抽取一个事件
const drawRandomEvent = (): MapEvent | null => {
  const candidates = EVENTS_DATA.map(event => ({
    event,
    weight: calculateEventWeight(event),
  })).filter(c => c.weight > 0);

  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.event;
  }

  return candidates[candidates.length - 1].event;
};
```

- [ ] **Step 5: 修改 resolveEventNode 函数**

替换现有的 `resolveEventNode` 函数（第1339行）：

```typescript
// 处理随机事件节点：从池中抽取并展示选择面板
const resolveEventNode = () => {
  const event = drawRandomEvent();

  if (!event) {
    // 没有可用事件时，使用默认事件
    addReport('时势平稳，未有大事发生。');
    gamePhase.value = 'map_select';
    showEventMap.value = true;
    return;
  }

  currentEvent.value = event;
  addReport(`【历史事件】${event.title}`);
  showEventPanel.value = true;
};
```

- [ ] **Step 6: 添加事件选择处理函数**

```typescript
// 处理事件选项选择
const selectEventChoice = (choice: 'A' | 'B') => {
  const event = currentEvent.value;
  if (!event) return;

  showEventPanel.value = false;
  const selectedChoice = choice === 'A' ? event.choiceA : event.choiceB;

  applyEventChoice(selectedChoice);
  currentEvent.value = null;
  gamePhase.value = 'map_select';
  showEventMap.value = true;
};
```

- [ ] **Step 7: 在模板中添加 EventPanel**

在 RewardSelector 相关组件附近添加：

```vue
<!-- 历史事件选择面板 -->
<EventPanel
  :visible="showEventPanel"
  :event="currentEvent"
  @select="selectEventChoice"
/>
```

- [ ] **Step 8: 在组件注册区域注册 EventPanel**

如果 Vue SFC 使用 `components: { RewardSelector, ... }` 声明，在同位置添加 `EventPanel`。

---

## Task 5: 清理旧事件池

**Files:**
- Modify: `src/views/CardBattleGame.vue:1245-1305`

- [ ] **Step 1: 删除旧的 mapEventPool 定义**

删除第 1245-1305 行的 `const mapEventPool = [...]` 定义。

---

## Task 6: 测试验证

**Files:**
- Test: 手动运行游戏

- [ ] **Step 1: 启动游戏，进入地图事件节点**

```
pnpm dev
```
访问游戏，进入任意地图，导航到 event 类型节点。

- [ ] **Step 2: 验证事件显示**

- [ ] 事件面板正确显示（标题 + 出处 + 历史文本 + AB选项）
- [ ] 拥有不同武将时，显示不同事件
- [ ] 选择A/B后，正确应用效果到属性/金币/征召兵
- [ ] 禁用的事件不再出现
- [ ] 战斗报告正确输出选择结果

- [ ] **Step 3: 验证边界情况**

- [ ] 无可用武将时，显示默认提示
- [ ] 多次进入事件节点，验证禁用状态正确保持

---

## Task 7: 补充剩余效果类型（如需要）

如果 22 个事件的选项中出现了前 4 步未覆盖的 effect type（如 moral、specialBuff），按需在 `applyEffect` 中补充。

---

## 自审清单

| 检查项 | 状态 |
|--------|------|
| 所有 22 个事件数据完整（含出处） |  |
| EventPanel.vue 样式与 RewardSelector 一致 |  |
| `applyEffect` 覆盖所有 EffectType |  |
| `calculateEventWeight` 正确处理 disabledEvents |  |
| 选择后 disabledEvents/enabledEvents 正确更新 |  |
| 模板中 EventPanel 正确引入 |  |
| 旧 mapEventPool 已删除 |  |
| 游戏能正常启动，无 TypeScript 错误 |  |
