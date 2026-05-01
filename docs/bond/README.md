# 羁绊效果系统设计

## 概述

在战斗开始时，检测我方阵型中是否存在满足羁绊条件的武将组合，满足则触发对应的羁绊效果，为相关武将提供额外加成。

## 羁绊数据结构

```typescript
// src/skills/bonds.ts

export interface BondCondition {
  /** 满足此羁绊所需的最少武将数量，默认2 */
  minCount?: number;
  /** 必须同时存在的武将ID列表（均为正数） */
  requiredIds: number[];
}

export interface BondEffect {
  /** 效果描述，用于战斗报告 */
  description: string;
  /** 效果施加给哪些武将：'all' | 'id列表' | ((generals: General[], bondGenerals: General[]) => id列表) */
  targets: BondTargetType;
  /** 应用效果的具体函数 */
  apply: (general: General, bondGenerals: General[]) => void;
}

export interface Bond {
  id: string;
  name: string;
  /** 羁绊组合的武将名称（用于显示） */
  members: string[];
  condition: BondCondition;
  effect: BondEffect;
}
```

## 羁绊列表

| 羁绊名 | 成员 | 效果 |
|--------|------|------|
| 秦琼+程咬金 | 秦琼、程咬金 | 两人普攻后25%追击，追加60%物理伤害 |
| 瓦岗双雄 | 秦琼、程咬金、李密 | 三人全体攻击+15%，速度+10% |
| 李唐皇室 | 李渊、李世民、李元吉 | 李渊攻击+20%，李世民/李元吉速度+15% |
| 开唐双璧 | 尉迟恭、秦琼 | 两人普攻后35%追击，追加65%伤害，免疫反击 |
| 天策上将 | 李世民 | 速度+25%，先手，谋略+15% |
| 李世民+李靖 | 李世民、李靖 | 李世民普攻后30%追击，追加75%伤害 |
| 裴行俨+沈光 | 裴行俨、沈光 | 裴行俨连击概率+30%，沈光普攻后25%追击 |
| 贺若弼+韩擒虎 | 贺若弼、韩擒虎 | 两人普攻后35%追击，追加70%伤害 |
| 房谋杜断 | 房玄龄、杜如晦 | 两人策略+20%，战斗开始敌方全体-10%防御 |
| 开元双相 | 杨坚、高颎 | 全体友军攻击+12%，防御+12% |
| 宇文化及+宇文述 | 宇文化及、宇文述 | 两人攻击+18%，敌方全体-8%防御 |
| 封德彝+杨素 | 封德彝、杨素 | 杨素攻击+22%，敌方攻击最高单位降攻-15% |
| 元氏双雄 | 元文景、元岩 | 两人速度+22%，先手 |
| 太原双谋 | 刘文静、裴仁基 | 刘文静攻击+20%，裴仁基防御+20% |
| 来护儿+张须陀 | 来护儿、张须陀 | 来护儿攻击+20%，张须陀防御+15% |

## 触发时机

在战斗开始 `battleStart` / `init` 事件中，遍历所有羁绊，将满足条件的武将标记羁绊状态，并施加效果。

触发顺序：
1. 遍历 `BONDS` 数组
2. 找到阵型中满足 `requiredIds` 的武将子集
3. 调用 `effect.apply(general, bondGenerals)` 为相关武将施加效果
4. 战斗报告输出羁绊激活信息

## 激活检测逻辑

```typescript
function activateBonds(formation: Formation, addReport?: (msg: string) => void): General[] {
  const activated: General[] = [];

  for (const bond of BONDS) {
    const matchedGenerals = formation.members.filter(g =>
      g && bond.condition.requiredIds.includes(Math.abs(g.id))
    );

    if (matchedGenerals.length >= (bond.condition.minCount ?? 2)) {
      for (const general of matchedGenerals) {
        bond.effect.apply(general, matchedGenerals);
        if (!activated.includes(general)) activated.push(general);
      }
      if (addReport) {
        addReport(`【羁绊激活】${bond.name}！${bond.effect.description}`);
      }
    }
  }

  return activated;
}
```

## 与技能的交互

羁绊效果使用与技能相同的 `skillEffects` 字段存储，因此：
- 羁绊效果和技能效果可以叠加（如追击概率分别计算）
- 羁绊效果遵循技能系统的回合逻辑
- `turnEnd` 等事件处理函数需要能正确应用羁绊产生的效果

## 羁绊UI展示

在 `FormationPanel` 和 `GeneralCard` 中，通过 `skillEffects.bondIds` 或类似字段判断武将是否有激活的羁绊，并显示羁绊图标。

在 `GeneralTooltip` 中显示该武将激活的所有羁绊名称。

## 文件结构

```
src/skills/
  bonds.ts          # 羁绊数据定义和激活逻辑
  index.ts          # 导出 bonds 相关的函数
  types.ts          # 可扩展 Bond 类型（如需要）
```

## 实施步骤

1. 创建 `src/skills/bonds.ts`，定义 `Bond` 接口和 15 个羁绊数据
2. 在 `CardBattleGame.vue` 的战斗初始化逻辑中，战斗开始时调用激活函数
3. 在 `GeneralCard.vue` 中显示羁绊标签
4. 在 `GeneralTooltip.vue` 中显示羁绊详情
5. 更新类型定义（如需要）