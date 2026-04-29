// 状态效果类型
export type StatusType = 'buff' | 'debuff' | 'neutral';

// 状态配置接口
export interface StatusConfig {
  key: string;                    // skillEffects 中的键名
  type: StatusType;               // 状态类型（影响颜色）
  label: string;                  // 显示文本（支持模板如"降攻{{duration}}"）
  title: string;                  // 悬浮提示文本模板
  showDuration?: boolean;         // 是否显示持续时间
  valueKey?: string;              // 数值键名（如 damageOutputReductionValue）
  durationKey?: string;           // 持续时间键名
  sourceKey?: string;             // 来源键名
  condition?: (effects: Record<string, any>) => boolean;  // 显示条件
  formatValue?: (value: any) => string;  // 数值格式化函数
}

// 格式化数值为百分比
const formatPercent = (value: number): string => {
  return ((value || 0) * 100).toFixed(0);
};

// Debuff 状态配置
export const DEBUFF_CONFIG: StatusConfig[] = [
  {
    key: 'damageOutputReduction',
    type: 'debuff',
    label: '降攻{{duration}}',
    title: '{{source}}：伤害输出降低 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'damageOutputReductionDuration',
    sourceKey: 'damageOutputReductionSource',
  },
  {
    key: 'skillTriggerReduction',
    type: 'debuff',
    label: '降率{{duration}}',
    title: '{{source}}：战法发动概率降低 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'skillTriggerReductionDuration',
    sourceKey: 'skillTriggerReductionSource',
  },
  {
    key: 'defenseReduction',
    type: 'debuff',
    label: '降防{{duration}}',
    title: '{{source}}：防御降低 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'defenseReductionDuration',
    sourceKey: 'defenseReductionSource',
  },
  {
    key: 'cannotNormalAttack',
    type: 'debuff',
    label: '怯战{{duration}}',
    title: '{{source}}：陷入怯战（无法普攻），持续{{duration}}回合',
    showDuration: true,
    durationKey: 'cannotNormalAttackDuration',
    sourceKey: 'cannotNormalAttackSource',
    condition: (effects) => effects.cannotNormalAttack === true && (effects.cannotNormalAttackDuration || 0) > 0,
  },
  {
    key: 'isSilenced',
    type: 'debuff',
    label: '沉默',
    title: '{{source}}：陷入沉默（无法发动主动战法）',
    sourceKey: 'silenceSource',
    condition: (effects) => effects.isSilenced === true,
  },
  {
    key: 'isStunned',
    type: 'debuff',
    label: '眩晕',
    title: '{{source}}：陷入眩晕（无法行动）',
    sourceKey: 'stunSource',
    condition: (effects) => effects.isStunned === true,
  },
  {
    key: 'isFeared',
    type: 'debuff',
    label: '恐惧',
    title: '{{source}}：陷入恐惧',
    sourceKey: 'fearSource',
    condition: (effects) => effects.isFeared === true,
  },
  {
    key: 'isCharmed',
    type: 'debuff',
    label: '魅惑',
    title: '{{source}}：被魅惑（可能攻击友军）',
    sourceKey: 'charmSource',
    condition: (effects) => effects.isCharmed === true,
  },
  {
    key: 'noHeal',
    type: 'debuff',
    label: '禁疗{{duration}}',
    title: '{{source}}：陷入禁疗（无法恢复兵力），持续{{duration}}回合',
    showDuration: true,
    durationKey: 'noHealDuration',
    sourceKey: 'noHealSource',
    condition: (effects) => effects.noHeal === true && (effects.noHealDuration || 0) > 0,
  },
  {
    key: 'isConfused',
    type: 'debuff',
    label: '混乱{{duration}}',
    title: '{{source}}：陷入混乱（攻击己方单位），持续{{duration}}回合',
    showDuration: true,
    durationKey: 'isConfusedDuration',
    sourceKey: 'confusedSource',
    condition: (effects) => effects.isConfused === true && (effects.isConfusedDuration || 0) > 0,
  },
  {
    key: 'isRaging',
    type: 'debuff',
    label: '暴走{{duration}}',
    title: '{{source}}：陷入暴走（随机攻击目标），持续{{duration}}回合',
    showDuration: true,
    durationKey: 'isRagingDuration',
    sourceKey: 'ragingSource',
    condition: (effects) => effects.isRaging === true && (effects.isRagingDuration || 0) > 0,
  },
  {
    key: 'strategyReduction',
    type: 'debuff',
    label: '降谋{{duration}}',
    title: '{{source}}：谋略降低 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'strategyReductionDuration',
    sourceKey: 'strategyReductionSource',
  },
  {
    key: 'speedReduction',
    type: 'debuff',
    label: '减速{{duration}}',
    title: '{{source}}：速度降低 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'speedReductionDuration',
    sourceKey: 'speedReductionSource',
  },
  {
    key: 'strategyVulnerability',
    type: 'debuff',
    label: '策伤{{duration}}',
    title: '{{source}}：受到的策略伤害增加 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'strategyVulnerabilityDuration',
    sourceKey: 'strategyVulnerabilitySource',
    condition: (effects) => (effects.strategyVulnerability || 0) > 0,
  },
  {
    key: 'physicalVulnerability',
    type: 'debuff',
    label: '物伤{{duration}}',
    title: '{{source}}：受到的物理伤害增加 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'physicalVulnerabilityDuration',
    sourceKey: 'physicalVulnerabilitySource',
    condition: (effects) => (effects.physicalVulnerability || 0) > 0,
  },
];

// Buff 状态配置
export const BUFF_CONFIG: StatusConfig[] = [
  {
    key: 'damageReduction',
    type: 'buff',
    label: '减伤',
    title: '{{source}}：物理伤害减免 {{value}}%',
    sourceKey: 'damageReductionSource',
  },
  {
    key: 'physicalDamageReduction',
    type: 'buff',
    label: '物减',
    title: '{{source}}：物理伤害减免 {{value}}%',
    sourceKey: 'physicalDamageReductionSource',
  },
  {
    key: 'strategyDamageReduction',
    type: 'buff',
    label: '谋减',
    title: '{{source}}：谋略伤害减免 {{value}}%',
    sourceKey: 'strategyDamageReductionSource',
  },
  {
    key: 'attributeBonus',
    type: 'buff',
    label: '属性+',
    title: '{{source}}：全属性提升 {{value}}%',
    sourceKey: 'attributeBonusSource',
    formatValue: (value) => ((value || 0) * 8).toFixed(0),
  },
  {
    key: 'damageIncrease',
    type: 'buff',
    label: '增伤',
    title: '{{source}}：伤害提升 {{value}}%',
    sourceKey: 'damageIncreaseSource',
  },
  {
    key: 'recoveryFromDebuff',
    type: 'buff',
    label: '回血{{duration}}',
    title: '{{source}}：回血增益 {{value}}%，持续{{duration}}回合',
    showDuration: true,
    durationKey: 'recoveryFromDebuffDuration',
    sourceKey: 'recoveryFromDebuffSource',
  },
  {
    key: 'firstAttackBonus',
    type: 'buff',
    label: '首攻',
    title: '{{source}}：首回合攻击提升 {{value}}%',
    sourceKey: 'firstAttackBonusSource',
  },
  {
    key: 'hasTaunt',
    type: 'buff',
    label: '嘲讽',
    title: '{{source}}：嘲讽效果（吸引敌方攻击）',
    sourceKey: 'tauntSource',
    condition: (effects) => effects.hasTaunt === true,
  },
  {
    key: 'canCounterAttack',
    type: 'buff',
    label: '反击',
    title: '{{source}}：受到攻击时进行反击，反击伤害 {{value}}%',
    sourceKey: 'tauntSource',
    formatValue: (value) => ((value || 0.6) * 100).toFixed(0),
  },
  {
    key: 'hasExtraAttack',
    type: 'buff',
    label: '连击',
    title: '{{source}}：额外发动一次攻击',
    condition: (effects) => effects.hasExtraAttack === true,
  },
  {
    key: 'pursuitChance',
    type: 'buff',
    label: '追击{{value}}%',
    title: '{{source}}：普攻后{{value}}%概率追加额外伤害',
    sourceKey: 'pursuitSource',
    condition: (effects) => (effects.pursuitChance || 0) > 0,
    formatValue: (value) => ((value || 0) * 100).toFixed(0),
  },
  {
    key: 'pursuitDamage',
    type: 'buff',
    label: '追伤{{value}}%',
    title: '{{source}}：追击伤害为普攻的{{value}}%',
    sourceKey: 'pursuitDamageSource',
    condition: (effects) => (effects.pursuitDamage || 0) > 0,
    formatValue: (value) => ((value || 0) * 100).toFixed(0),
  },
  {
    key: 'counterAttackChance',
    type: 'buff',
    label: '反击{{value}}%',
    title: '{{source}}：受到攻击时{{value}}%概率反击',
    sourceKey: 'counterAttackSource',
    condition: (effects) => (effects.counterAttackChance || 0) > 0,
    formatValue: (value) => ((value || 0) * 100).toFixed(0),
  },
  {
    key: 'counterAttackDamage',
    type: 'buff',
    label: '反击伤{{value}}%',
    title: '{{source}}：反击伤害为受到伤害的{{value}}%',
    sourceKey: 'counterAttackDamageSource',
    condition: (effects) => (effects.counterAttackDamage || 0) > 0,
    formatValue: (value) => ((value || 0) * 100).toFixed(0),
  },
  {
    key: 'hasInsight',
    type: 'buff',
    label: '洞察',
    title: '{{source}}：免疫控制类负面状态',
    sourceKey: 'insightSource',
    condition: (effects) => effects.hasInsight === true,
  },
  {
    key: 'hasFirstStrike',
    type: 'buff',
    label: '先手',
    title: '{{source}}：必定先手行动',
    sourceKey: 'firstStrikeSource',
    condition: (effects) => effects.hasFirstStrike === true,
  },
  {
    key: 'shield',
    type: 'buff',
    label: '护盾{{value}}',
    title: '{{source}}：获得{{value}}点护盾，吸收伤害',
    sourceKey: 'shieldSource',
    condition: (effects) => (effects.shield || 0) > 0,
    formatValue: (value) => String(Math.floor(value || 0)),
  },
  {
    key: 'healIncrease',
    type: 'buff',
    label: '疗增{{value}}%',
    title: '{{source}}：受到的治疗效果+{{value}}%',
    sourceKey: 'healIncreaseSource',
    condition: (effects) => (effects.healIncrease || 0) > 0,
    formatValue: (value) => ((value || 0) * 100).toFixed(0),
  },
  {
    key: 'criticalChance',
    type: 'buff',
    label: '暴击{{value}}%',
    title: '{{source}}：暴击概率+{{value}}%',
    sourceKey: 'criticalChanceSource',
    condition: (effects) => (effects.criticalChance || 0) > 0,
    formatValue: (value) => ((value || 0) * 100).toFixed(0),
  },
  {
    key: 'criticalDamage',
    type: 'buff',
    label: '暴伤{{value}}%',
    title: '{{source}}：暴击伤害+{{value}}%',
    sourceKey: 'criticalDamageSource',
    condition: (effects) => (effects.criticalDamage || 0) > 0,
    formatValue: (value) => ((value || 0) * 100).toFixed(0),
  },
];

// 被动效果配置（特殊处理，需要合并到buff中显示）
export const PASSIVE_STATUS_CONFIG: StatusConfig[] = [
  {
    key: 'passiveDamageTagValue',
    type: 'buff',
    label: '{{label}}',
    title: '{{source}}：增伤 {{value}}%，触发概率 {{chance}}%',
    sourceKey: 'passiveDamageTagSource',
    condition: (effects) => (effects.passiveDamageTagValue || 0) > 0,
  },
];

// 所有状态配置
export const ALL_STATUS_CONFIG = [...DEBUFF_CONFIG, ...BUFF_CONFIG, ...PASSIVE_STATUS_CONFIG];

// 状态项接口（渲染用）
export interface StatusItem {
  key: string;
  type: StatusType;
  label: string;
  title: string;
}

/**
 * 获取武将的状态列表
 * @param effects - skillEffects 对象
 * @returns 状态列表
 */
export const getStatusList = (effects: Record<string, any> | undefined): StatusItem[] => {
  if (!effects) return [];

  const statuses: StatusItem[] = [];

  // 处理 debuff 状态
  for (const config of DEBUFF_CONFIG) {
    // 检查显示条件
    if (config.condition && !config.condition(effects)) continue;

    const value = effects[config.key];
    const duration = config.durationKey ? effects[config.durationKey] : null;
    const source = config.sourceKey ? effects[config.sourceKey] : '被动效果';

    // 检查是否需要显示
    let shouldShow = false;
    if (typeof value === 'boolean') {
      shouldShow = value === true;
    } else if (typeof value === 'number') {
      shouldShow = value > 0;
    }

    if (shouldShow) {
      // 格式化数值
      let formattedValue = value;
      if (config.formatValue) {
        formattedValue = config.formatValue(value);
      } else if (typeof value === 'number') {
        formattedValue = formatPercent(value);
      }

      // 生成显示文本
      let label = config.label;
      let title = config.title;

      if (config.showDuration && duration !== null) {
        label = label.replace('{{duration}}', duration.toString());
        title = title.replace('{{duration}}', duration.toString());
      }

      label = label.replace('{{duration}}', '');
      title = title.replace('{{duration}}', '0');
      title = title.replace('{{source}}', source);
      title = title.replace('{{value}}', String(formattedValue));

      statuses.push({
        key: config.key,
        type: config.type,
        label,
        title,
      });
    }
  }

  // 处理 buff 状态
  for (const config of BUFF_CONFIG) {
    // 检查显示条件
    if (config.condition && !config.condition(effects)) continue;

    const value = effects[config.key];
    const duration = config.durationKey ? effects[config.durationKey] : null;
    const source = config.sourceKey ? effects[config.sourceKey] : '被动效果';

    // 检查是否需要显示
    let shouldShow = false;
    if (typeof value === 'boolean') {
      shouldShow = value === true;
    } else if (typeof value === 'number') {
      shouldShow = value > 0;
    }

    if (shouldShow) {
      // 格式化数值
      let formattedValue = value;
      if (config.formatValue) {
        formattedValue = config.formatValue(value);
      } else if (typeof value === 'number') {
        formattedValue = formatPercent(value);
      }

      // 生成显示文本
      let label = config.label;
      let title = config.title;

      if (config.showDuration && duration !== null) {
        label = label.replace('{{duration}}', duration.toString());
        title = title.replace('{{duration}}', duration.toString());
      }

      label = label.replace('{{duration}}', '');
      title = title.replace('{{duration}}', '0');
      title = title.replace('{{source}}', source);
      title = title.replace('{{value}}', String(formattedValue));

      statuses.push({
        key: config.key,
        type: config.type,
        label,
        title,
      });
    }
  }

  return statuses;
};

/**
 * 获取被动状态列表
 * @param effects - skillEffects 对象
 * @returns 被动状态列表
 */
export const getPassiveStatusList = (effects: Record<string, any> | undefined): StatusItem[] => {
  if (!effects) return [];

  const statuses: StatusItem[] = [];

  for (const config of PASSIVE_STATUS_CONFIG) {
    // 检查显示条件
    if (config.condition && !config.condition(effects)) continue;

    const value = effects[config.key];
    const source = effects[`${config.key}Source`] || '被动效果';
    const labelTemplate = effects.passiveDamageTagLabel || config.label;
    const chance = effects.passiveDamageTagChance || 0;

    if (value > 0) {
      let formattedValue = value;
      if (config.formatValue) {
        formattedValue = config.formatValue(value);
      } else {
        formattedValue = formatPercent(value);
      }

      const label = labelTemplate.replace('{{label}}', labelTemplate);
      const title = config.title
        .replace('{{source}}', source)
        .replace('{{value}}', String(formattedValue))
        .replace('{{chance}}', formatPercent(chance))
        .replace('{{label}}', labelTemplate);

      statuses.push({
        key: config.key,
        type: config.type,
        label,
        title,
      });
    }
  }

  return statuses;
};

/**
 * 获取所有状态（包括被动）
 * @param effects - skillEffects 对象
 * @returns 所有状态列表
 */
export const getAllStatusList = (effects: Record<string, any> | undefined): StatusItem[] => {
  return [...getStatusList(effects), ...getPassiveStatusList(effects)];
};
