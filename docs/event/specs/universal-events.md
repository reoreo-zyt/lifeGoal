# 通用事件设计

> 版本：1.1
> 日期：2026-04-30
> 状态：草稿

---

## 概念定义

### 什么是通用事件

现有事件（22个）均为**武将专属事件**，通过 `requiredGenerals` 限制触发条件。这意味着：
- 没有对应武将的玩家永远无法触发该事件
- 事件池对新手玩家几乎不可见
- 章节叙事与玩家阵容严重脱节

**通用事件**（Universal Events）无武将限制，任何玩家均可触发，作为武将专属事件的补充层。

### 通用 vs 专属事件对比

| 维度 | 通用事件 | 专属事件 |
|------|---------|---------|
| `requiredGenerals` | `[]`（空数组） | `['xxx']`（至少一个） |
| 基础权重 | `0.5` | `1.0` |
| 触发频率 | 始终可选（低优先级兜底） | 持有武将时高权重 |
| 叙事风格 | 宏观时势、中原动态 | 武将个人命运、羁绊抉择 |
| 事件数量 | 目标 8~12 个 | 现有 22 个 |

### 设计原则

- **通用为主、专属为锚**：通用事件覆盖基础资源博弈，专属事件承载剧情深度
- **永远可触发**：任何玩家在任何阶段都至少有事件可看
- **低侵入性**：通用事件只影响资源/属性，不修改武将池结构
- **分支不影响主线**：通用事件选择不 `disablesEvents` 专属事件，防止阻断叙事

---

## 权重系统（修订）

```
基础权重 = 0.5（通用）/ 1.0（专属）

通用事件加成：
- 已拥有武将数 > 3：+0.3
- 当前金币 < 500：+0.5（粮草不济事件权重提升）

专属事件加成：
- 拥有 requiredGenerals 中任意一个：+0.5
- 拥有完整组合羁绊：+1.0
- 全局标记触发：按标记 +0.5

抽取时：
- 先以权重抽取；若候选中无任何权重 > 0 的事件（全部被禁用或无武将）
  → 强制抽取一个通用事件作为兜底
```

---

## 通用事件列表（目标 10 个）

> 编号前缀：`gen-xxx`

### gen-001 粮草告急

**类型**：通用
**叙事**：
> 大军深入，粮道被劫。斥候急报：营地存粮仅余三日，若不早日筹措，军心必乱。

**narrativeSource**：虚构（泛历史背景）

**choiceA** — 「强征民粮」：
- effects：`conscript: -200`, `moral: -10`
- description：就地强征百姓粮草，短期内解决困境
- disablesEvents / enablesEvents / flags：`none`
- 备注：低风险，低代价，但降低士气和征召兵

**choiceB** — 「奇袭补给」：
- effects：`conscript: +400`, `speed: -5`（全体速度-5%一回合）
- description：派精兵奇袭敌方粮道，以战养战
- 备注：收益高，但下一场战斗全体速度下降

---

### gen-002 天降大雨

**类型**：通用
**叙事**：
> 乌云压顶，大雨连绵数日。河水暴涨，道路泥泞难行。军中士气低落，将领亦面有忧色。

**narrativeSource**：虚构

**choiceA** — 「稳步推进」：
- effects：`speed: -15`（全体速度-15%一回合）
- description：泥泞难行，稳步缓进，确保不陷入伏击
- 备注：牺牲速度换取安全

**choiceB** — 「冒雨疾行」：
- effects：`conscript: +300`, `defense: -8`（全体防御-8%一回合）
- description：趁敌懈怠，冒雨急行军，速至有利地形
- 备注：争得先机但军容疲惫

---

### gen-003 流民投军

**类型**：通用
**叙事**：
> 战乱纷纷，流民如潮。近日有数百流民至营前请降，愿为兵卒，以求饱食。其间老幼混杂，良莠不齐。

**narrativeSource**：虚构

**choiceA** — 「收编壮丁」：
- effects：`conscript: +500`
- description：筛选精壮者入伍，老幼安置于后方
- 备注：纯资源增益，无副作用

**choiceB** — 「全数收容」：
- effects：`conscript: +800`, `defense: -5`, `speed: -5`（全体属性-5%一回合）
- description：不论老幼尽数收编，短期内兵力大增但战力稀释
- 备注：高风险高回报，防御和速度临时下降

---

### gen-004 军饷短缺

**类型**：通用
**叙事**：
> 国库空虚，军饷拖欠已有两月。士卒颇有怨言，夜间营中偶有私语。急则生变，不可不察。

**narrativeSource**：虚构

**choiceA** — 「拖欠缓发」：
- effects：`gold: -100`, `moral: +5`
- description：以朝廷困难晓之以理，暂缓发放并许诺战后加倍
- flags：`delayed_payment`
- 备注：节省金币但设置标记，影响后续

**choiceB** — 「挪用赈粮」：
- effects：`gold: +300`, `conscript: -300`
- description：变卖赈灾粮米以发军饷，短期解决困境
- 备注：金币大增但征召兵上限永久降低

---

### gen-005 斥候回报

**类型**：通用
**叙事**：
> 夜深，斥候归营，带回敌军情报：敌军分兵两路，主力屯于东原，粮草皆在西河。另有一支精锐，游弋于山林之中，来去如风。

**narrativeSource**：虚构

**choiceA** — 「断其粮道」：
- effects：`strategy: +10`（全体谋略+10%永久）, `conscript: -200`
- description：派精兵绕道烧毁西河粮草，断敌命脉
- enablesEvents：`hun-001`
- 备注：消耗兵力但谋略提升并关联后续

**choiceB** — 「伏击游骑」：
- effects：`attack: +12`（全体攻击+12%永久）, `conscript: -150`
- description：设伏山林，歼灭敌军游骑，夺其战马
- 备注：攻击提升但消耗征召兵

---

### gen-006 瘟疫蔓延

**类型**：通用
**叙事**：
> 军中忽起疫病，病卒十有三四。高热咳血，死者日增。军医束手，将领忧惧。

**narrativeSource**：虚构

**choiceA** — 「封营隔离」：
- effects：`conscript: -400`, `defense: +8`（全体防御+8%永久）
- description：将病卒隔离医治，牺牲部分兵力换取整体健康
- flags：`epidemic_survived`
- 备注：大幅降低征召兵，但防御永久提升

**choiceB** — 「弃卒保车」：
- effects：`conscript: -200`, `speed: +10`（全体速度+10%永久）, `moral: -8`
- description：将病卒尽数遣散，轻装疾行
- 备注：保留较多兵力但士气下降，速度永久提升

---

### gen-007 夜间惊营

**类型**：通用
**叙事**：
> 子夜，营地忽传惊叫，疑有敌军劫营。全军惊醒，乱作一团，点火四照，兵器相交……原来是虚惊一场，不过是野兽惊扰。

**narrativeSource**：虚构

**choiceA** — 「彻夜警戒」：
- effects：`defense: +10`（全体防御+10%永久）, `speed: -5`（一回合）
- description：全营戒严，提防真正的袭击，次日行军疲惫
- 备注：防御提升，但下一场速度下降

**choiceB** — 「趁夜转移」：
- effects：`speed: +15`（全体速度+15%永久）, `conscript: -100`
- description：趁夜色掩护全军转移，另寻营地
- 备注：速度大幅提升但有少量逃兵

---

### gen-008 俘虏处置

**类型**：通用
**叙事**：
> 战后，清点俘虏数百人。其目光或仇恨、或茫然、或不服。如何处置，关乎军心与后路。

**narrativeSource**：虚构

**choiceA** — 「优待俘虏」：
- effects：`conscript: +300`, `moral: +8`, `attack: -5`（全体攻击-5%永久）
- description：以礼待之，愿留者编入军中，不愿者放归
- enablesEvents：`gen-rebel_retreat`
- 备注：征召兵增加，士气提升，但攻击永久小幅下降

**choiceB** — 「严刑立威」：
- effects：`attack: +12`（全体攻击+12%永久）, `moral: -10`
- description：斩首示众，以儆效尤，震慑敌军
- 备注：攻击大幅提升但士气大幅下降

---

### gen-009 商路断绝

**类型**：通用
**叙事**：
> 战火蔓延，商路断绝。往日熙攘的集市如今空空如也，盐铁布匹皆无从购置，金价飞涨。

**narrativeSource**：虚构

**choiceA** — 「官府强买」：
- effects：`gold: -200`, `conscript: +200`
- description：以官价强制收购民间物资
- flags：`merchant_hostile`
- 备注：金币支出换征召兵，设置敌对标记

**choiceB** — 「以物易物」：
- effects：`gold: +400`, `moral: -5`
- description：用军中余粮换购紧缺物资，高价出售
- 备注：金币大增但士气下降

---

### gen-010 将领不和

**类型**：通用
**叙事**：
> 两位将领因战略分歧在帐前争执不下，言辞激烈，各有拥趸。士卒围观，窃窃私语。处理不当，轻则内耗，重则分裂。

**narrativeSource**：虚构

**choiceA** — 「秉公裁断」：
- effects：`strategy: +10`（全体谋略+10%永久）
- description：听取双方意见后公正裁决，维护团结
- flags：`general_harmony`
- 备注：谋略提升，设置和谐标记

**choiceB** — 「各领一军」：
- effects：`attack: +15`（全体攻击+15%永久）, `defense: -8`（全体防御-8%永久）
- description：将二人分兵统领，各展所长，减少内耗
- 备注：攻击提升但防御永久下降

---

## 实施计划

| 阶段 | 内容 | 文件 |
|------|------|------|
| 1 | 确认通用事件名单和效果 | `docs/event/specs/universal-events.md` |
| 2 | 编写 `gen-001` ~ `gen-010` 到 `events-data.ts` | `src/events/events-data.ts` |
| 3 | 调整 `calculateEventWeight` 权重公式 | `src/views/CardBattleGame.vue` |
| 4 | 验证：任意武将组合均可触发通用事件 | 手动测试 |

---

## 事件数据结构（通用版）

```typescript
{
  id: 'gen-001',
  title: '粮草告急',
  narrative: '大军深入，粮道被劫...',
  narrativeSource: '虚构（泛历史背景）',
  chapter: 'sui',  // 归属"开隋"章节权重桶（用于地图深度匹配）
  choiceA: {
    label: '强征民粮',
    description: '就地强征百姓粮草...',
    effects: [
      { type: 'conscript', value: -200 },
      { type: 'moral', value: -10 },
    ],
    // 通用事件不禁用专属事件
  },
  choiceB: {
    label: '奇袭补给',
    description: '派精兵奇袭敌方粮道...',
    effects: [
      { type: 'conscript', value: 400 },
      { type: 'speed', value: -5, duration: 1 },
    ],
  },
  // 通用事件核心特征
  requiredGenerals: [],  // 空数组 = 无武将限制
  weightBonus: {},      // 无武将加成
}
```

---

## 兜底机制

当 `drawRandomEvent()` 所有候选权重为 0 时（即所有专属事件均不可用），强制从通用事件池中随机抽取一个：

```typescript
const drawRandomEvent = (): MapEvent | null => {
  const candidates = EVENTS_DATA.map(event => ({
    event,
    weight: calculateEventWeight(event),
  })).filter(c => c.weight > 0);

  if (candidates.length > 0) {
    return weightedRandomSelect(candidates);
  }

  // 兜底：强制抽取通用事件
  const universalEvents = EVENTS_DATA.filter(e => e.requiredGenerals.length === 0);
  if (universalEvents.length === 0) return null;
  return universalEvents[Math.floor(Math.random() * universalEvents.length)];
};
```

---

## 持续时间效果说明

部分通用事件使用 `duration: 1`，表示仅持续1场战斗，战斗后自动清除：

| 事件 | 效果 | duration |
|------|------|----------|
| gen-001 粮草告急-B | speed -5% | 1 场 |
| gen-002 天降大雨-A | speed -15% | 1 场 |
| gen-002 天降大雨-B | defense -8% | 1 场 |
| gen-003 流民投军-B | defense/speed -5% | 1 场 |
| gen-007 夜间惊营-A | speed -5% | 1 场 |

`duration` 效果通过 `skillEffects` 中带 `duration` 字段的临时 buff 实现。
