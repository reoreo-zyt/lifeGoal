import type { MapEvent } from './event-types';

/**
 * 特殊效果类型：添加武将到麾下
 * value 字段含义：
 *   1 = 添加随机瓦岗武将（秦琼/程咬金）
 *   2 = 添加裴行俨
 *   3 = 添加随机隋将
 */
export type AddGeneralEffectType = 'addGeneral';
export type AnyEffectType = import('./event-types').EffectType | AddGeneralEffectType;

export const EVENTS_DATA: MapEvent[] = [
  // ==================== 第一章：开隋 ====================
  {
    id: 'sui-001',
    title: '开皇之治',
    narrative: '开皇年间，天下初定。杨坚推行均田制，国库渐丰，百姓乐业。然太子之位悬而未决，暗流涌动。',
    narrativeSource: '《贞观政要》卷一',
    chapter: 'sui',
    choiceA: {
      label: '励精图治',
      description: '整顿吏治，减赋轻徭，与民休息',
      effects: [
        { type: 'attributePercent', value: 8, target: 'all' },
        { type: 'gold', value: 200 },
      ],
      enablesEvents: ['zhen-002'],
    },
    choiceB: {
      label: '大兴土木',
      description: '修建东都，劳役繁重，民力耗竭',
      effects: [
        { type: 'gold', value: 500 },
        { type: 'speed', value: -10, target: 'all' },
      ],
      disablesEvents: ['zhen-002'],
    },
    requiredGenerals: ['杨坚'],
    weightBonus: { '杨坚': 1.0 },
  },
  {
    id: 'sui-002',
    title: '仁寿宫变',
    narrative: '仁寿四年，杨坚病重。太子杨广侍疾宫中，欲速登基。宫中流言四起，人心惶惶。',
    narrativeSource: '《隋书》卷四《炀帝纪》',
    chapter: 'sui',
    choiceA: {
      label: '静观其变',
      description: '按兵不动，静观其变，以待时机',
      effects: [
        { type: 'defense', value: 10, target: 'all' },
      ],
      enablesEvents: ['sui-001'],
    },
    choiceB: {
      label: '暗中蓄力',
      description: '收买内应，培植党羽，暗中布局',
      effects: [
        { type: 'conscript', value: 300 },
        { type: 'moral', value: -5 },
      ],
      flags: ['yuwen_inf'],
    },
    requiredGenerals: ['杨坚'],
    weightBonus: { '杨坚': 1.0 },
  },

  // ==================== 第二章：平陈 ====================
  {
    id: 'chen-001',
    title: '渡江灭陈',
    narrative: '隋大业十一年，韩擒虎、贺若弼率军渡江，直取建康。南朝陈后主匿于枯井，终日欢歌，不问国事。',
    narrativeSource: '《隋书》卷二《高祖纪下》',
    chapter: 'chen',
    choiceA: {
      label: '秋毫无犯',
      description: '军纪严明，秋毫无犯，安定民心',
      effects: [
        { type: 'conscript', value: 500 },
        { type: 'strategy', value: 10, target: 'all' },
      ],
      enablesEvents: ['chen-002'],
    },
    choiceB: {
      label: '纵兵劫掠',
      description: '纵兵劫掠，缴获丰厚，以充军用',
      effects: [
        { type: 'gold', value: 400 },
        { type: 'conscript', value: 200 },
        { type: 'moral', value: -8 },
      ],
      disablesEvents: ['zhen-002'],
    },
    requiredGenerals: ['韩擒虎', '贺若弼'],
    weightBonus: { '韩擒虎': 0.5, '贺若弼': 0.5 },
  },
  {
    id: 'chen-002',
    title: '贺若弼争功',
    narrative: '平陈之后，韩擒虎与贺若弼争功于殿上，互相讥讽。隋文帝杨坚闻之，笑曰："二将皆朕之虎臣也。"',
    narrativeSource: '《隋书》卷五二《韩擒虎传》附《贺若弼传》',
    chapter: 'chen',
    choiceA: {
      label: '各赏其功',
      description: '兼而赏之，以安人心，勉其效忠',
      effects: [
        { type: 'attack', value: 20, target: 'specific', targetName: '韩擒虎' },
        { type: 'attack', value: 20, target: 'specific', targetName: '贺若弼' },
      ],
      enablesEvents: ['hun-003'],
    },
    choiceB: {
      label: '扬此抑彼',
      description: '厚此薄彼，以离间心，令其竞争',
      effects: [
        { type: 'gold', value: 150 },
        { type: 'attack', value: 25, target: 'all' },
      ],
      disablesEvents: ['hun-003'],
    },
    requiredGenerals: ['韩擒虎', '贺若弼'],
    weightBonus: { '韩擒虎': 0.5, '贺若弼': 0.5 },
  },
  {
    id: 'chen-003',
    title: '史万岁南征',
    narrative: '史万岁率军深入云南，平定叛蛮。然朝中权贵忌其功，竟以无功论罪，可叹将星陨落。',
    narrativeSource: '《隋书》卷五三《史万岁传》',
    chapter: 'chen',
    choiceA: {
      label: '上书申冤',
      description: '为史万岁鸣不平，直言敢谏',
      effects: [
        { type: 'strategy', value: 12, target: 'all' },
      ],
      flags: ['zhiyan'],
    },
    choiceB: {
      label: '明哲保身',
      description: '噤声不言，独善其身，不惹是非',
      effects: [
        { type: 'gold', value: 100 },
        { type: 'speed', value: -8, target: 'all' },
      ],
    },
    requiredGenerals: ['史万岁'],
    weightBonus: { '史万岁': 1.0 },
  },
  {
    id: 'chen-004',
    title: '鱼俱罗之死',
    narrative: '鱼俱罗武艺绝伦，曾三擒瓦岗英雄。然炀帝疑其面相异相，有帝王之相，下令诛杀。',
    narrativeSource: '《隋书》卷六四《鱼俱罗传》',
    chapter: 'chen',
    choiceA: {
      label: '兔死狗烹',
      description: '功高震主，可悲可叹，唯有一声叹息',
      effects: [
        { type: 'defense', value: 15, target: 'all' },
      ],
      enablesEvents: ['zhen-003'],
    },
    choiceB: {
      label: '暗施援手',
      description: '暗施援手，助其逃亡，收买人心',
      effects: [
        { type: 'conscript', value: 300 },
        { type: 'moral', value: 5 },
      ],
      flags: ['yujilou_hidden'],
    },
    requiredGenerals: ['鱼俱罗'],
    weightBonus: { '鱼俱罗': 1.0 },
  },

  // ==================== 第三章：唐兴 ====================
  {
    id: 'tang-001',
    title: '晋阳起兵',
    narrative: '大业十三年，李渊于晋阳起兵。世民劝父："今日之势，不若此时；今时不取，悔无所及。"',
    narrativeSource: '《旧唐书》卷一《高祖纪》',
    chapter: 'tang',
    choiceA: {
      label: '斩杨自立',
      description: '公开反隋，建国称帝，自立门户',
      effects: [
        { type: 'attack', value: 18, target: 'all' },
        { type: 'gold', value: -100 },
      ],
      enablesEvents: ['tang-004'],
    },
    choiceB: {
      label: '拥隋为名',
      description: '尊炀帝为太上皇，挟天子以令诸侯',
      effects: [
        { type: 'gold', value: 300 },
        { type: 'conscript', value: 400 },
      ],
      enablesEvents: ['hun-004'],
      disablesEvents: ['tang-004'],
    },
    requiredGenerals: ['李渊', '李世民'],
    weightBonus: { '李渊': 0.5, '李世民': 0.5 },
  },
  {
    id: 'tang-002',
    title: '瓦岗争锋',
    narrative: '李密据瓦岗，帐下猛将如云：秦琼、程咬金皆在其列。然李密志大才疏，终难成大事。',
    narrativeSource: '《旧唐书》卷五三《李密传》',
    chapter: 'tang',
    choiceA: {
      label: '招贤纳士',
      description: '以利诱之，瓦解瓦岗，收编精锐',
      effects: [
        { type: 'conscript', value: 600 },
        { type: 'addGeneral', value: 1 }, // 添加随机瓦岗武将
      ],
      flags: ['wagang_broken'],
    },
    choiceB: {
      label: '合纵连横',
      description: '与瓦岗结盟，共抗隋军，互为犄角',
      effects: [
        { type: 'defense', value: 12, target: 'all' },
      ],
      flags: ['wagang_allied'],
    },
    requiredGenerals: ['李密', '秦琼', '程咬金'],
    weightBonus: { '李密': 0.3, '秦琼': 0.35, '程咬金': 0.35 },
  },
  {
    id: 'tang-003',
    title: '裴仁基归唐',
    narrative: '裴仁基父子镇守虎牢，见李密难成大事，遂有归唐之意。然其子裴行俨年少气盛，尚在犹豫。',
    narrativeSource: '《旧唐书》卷五三《裴仁基传》',
    chapter: 'tang',
    choiceA: {
      label: '裴氏归唐',
      description: '劝降裴氏父子，以礼相待，收为己用',
      effects: [
        { type: 'conscript', value: 500 },
        { type: 'addGeneral', value: 2 }, // 添加裴行俨
      ],
      enablesEvents: ['tang-004'],
    },
    choiceB: {
      label: '武力夺取',
      description: '强攻虎牢，以武力收编其众',
      effects: [
        { type: 'conscript', value: 300 },
        { type: 'gold', value: 200 },
      ],
      disablesEvents: ['tang-004'],
    },
    requiredGenerals: ['裴仁基', '裴行俨'],
    weightBonus: { '裴仁基': 0.5, '裴行俨': 0.5 },
  },
  {
    id: 'tang-004',
    title: '元吉失机',
    narrative: '李元吉镇守太原，素有勇名，然性情骄纵。窦建德来犯，元吉轻敌出城，中伏大败。',
    narrativeSource: '《旧唐书》卷六四《李元吉传》',
    chapter: 'tang',
    choiceA: {
      label: '严加惩处',
      description: '按军法处置，以儆效尤，整肃军纪',
      effects: [
        { type: 'defense', value: 15, target: 'all' },
      ],
      enablesEvents: ['zhen-001'],
    },
    choiceB: {
      label: '戴罪立功',
      description: '令其将功赎罪，以战功证明自己',
      effects: [
        { type: 'attack', value: 30, target: 'specific', targetName: '李元吉' },
      ],
      flags: ['yuanji_merit'],
    },
    requiredGenerals: ['李元吉'],
    weightBonus: { '李元吉': 1.0 },
  },

  // ==================== 第四章：天策 ====================
  {
    id: 'tian-001',
    title: '尉迟恭降唐',
    narrative: '尉迟敬德原为刘武周部将，于美良川被秦琼设计收服。世民亲释其缚，敬德遂降。',
    narrativeSource: '《旧唐书》卷六八《尉迟敬德传》',
    chapter: 'tian',
    choiceA: {
      label: '恩义相待',
      description: '以诚相待，结为心腹，恩义相报',
      effects: [
        { type: 'attack', value: 25, target: 'specific', targetName: '尉迟恭' },
      ],
      flags: ['yuchi_loyal'],
    },
    choiceB: {
      label: '威逼利诱',
      description: '以势压之，以利诱之，令其不得不从',
      effects: [
        { type: 'attack', value: 15, target: 'specific', targetName: '尉迟恭' },
      ],
      flags: ['yuchi_coerced'],
    },
    requiredGenerals: ['尉迟恭'],
    weightBonus: { '尉迟恭': 1.0 },
  },
  {
    id: 'tian-002',
    title: '秦琼归唐',
    narrative: '秦琼原为隋将，历事多主。后归秦王世民帐下，每战必为先锋，人称"门神"。',
    narrativeSource: '《旧唐书》卷六八《秦琼传》',
    chapter: 'tian',
    choiceA: {
      label: '拜为上将',
      description: '重用秦琼，委以先锋，倚为柱石',
      effects: [
        { type: 'attack', value: 30, target: 'specific', targetName: '秦琼' },
        { type: 'speed', value: 15, target: 'specific', targetName: '秦琼' },
      ],
      enablesEvents: ['tian-004'],
    },
    choiceB: {
      label: '收为护卫',
      description: '留置身边，充任护卫，以卫安全',
      effects: [
        { type: 'defense', value: 10, target: 'all' },
      ],
      enablesEvents: ['tian-004'],
    },
    requiredGenerals: ['秦琼'],
    weightBonus: { '秦琼': 1.0 },
  },
  {
    id: 'tian-003',
    title: '程咬金三斧',
    narrative: '程咬金使一柄八卦宣花斧，武艺高强，尤善三板斧：劈脑袋、掏耳朵、捎带脚。敌将往往前三斧便败下阵来。',
    narrativeSource: '《旧唐书》卷六八《程知节传》',
    chapter: 'tian',
    choiceA: {
      label: '扬长避短',
      description: '令其专攻前三斧，一击必杀，以快制胜',
      effects: [
        { type: 'attack', value: 30, target: 'specific', targetName: '程咬金' },
      ],
      flags: ['chengkd_double'],
    },
    choiceB: {
      label: '悉心培养',
      description: '教以兵法，补其短板，令其文武兼备',
      effects: [
        { type: 'strategy', value: 20, target: 'specific', targetName: '程咬金' },
        { type: 'defense', value: 15, target: 'specific', targetName: '程咬金' },
      ],
    },
    requiredGenerals: ['程咬金'],
    weightBonus: { '程咬金': 1.0 },
  },
  {
    id: 'tian-004',
    title: '单骑救主',
    narrative: '美良川之战，秦王世民被围。尉迟敬德单骑冲阵，所向披靡，护送世民突围而出。',
    narrativeSource: '《旧唐书》卷六八《尉迟敬德传》',
    chapter: 'tian',
    choiceA: {
      label: '论功行赏',
      description: '赐金封地，荣耀无双，表彰忠勇',
      effects: [
        { type: 'attack', value: 25, target: 'specific', targetName: '尉迟恭' },
        { type: 'attack', value: 25, target: 'specific', targetName: '秦琼' },
        { type: 'moral', value: 5 },
      ],
      enablesEvents: ['zhen-002'],
    },
    choiceB: {
      label: '隐而不宣',
      description: '功高震主，秘而不宣，以免生变',
      effects: [
        { type: 'gold', value: 300 },
        { type: 'speed', value: -10, target: 'specific', targetName: '尉迟恭' },
        { type: 'speed', value: -10, target: 'specific', targetName: '秦琼' },
      ],
    },
    requiredGenerals: ['秦琼', '尉迟恭'],
    weightBonus: { '秦琼': 0.5, '尉迟恭': 0.5 },
  },

  // ==================== 第五章：贞观 ====================
  {
    id: 'zhen-001',
    title: '房谋杜断',
    narrative: '房玄龄善谋，杜如晦善断。二人共掌朝政，政事无壅，号为"房谋杜断"。',
    narrativeSource: '《旧唐书》卷六六《房玄龄传》附《杜如晦传》',
    chapter: 'zhen',
    choiceA: {
      label: '委以重任',
      description: '放手让其施政，信任不疑，大胆改革',
      effects: [
        { type: 'strategy', value: 20, target: 'all' },
        { type: 'defense', value: -10, target: 'all' }, // 敌方防御降低
      ],
      enablesEvents: ['zhen-002'],
    },
    choiceB: {
      label: '制衡牵制',
      description: '分而用之，互相监督，彼此制衡',
      effects: [
        { type: 'strategy', value: 12, target: 'all' },
      ],
      flags: ['zhiyan'],
    },
    requiredGenerals: ['房玄龄', '杜如晦'],
    weightBonus: { '房玄龄': 0.5, '杜如晦': 0.5 },
  },
  {
    id: 'zhen-002',
    title: '渭水之盟',
    narrative: '玄武门之变后，突厥颉利可汗趁虚南侵。世民亲率六骑至渭水，佯装镇定，颉利疑有伏兵，遂订盟约而去。',
    narrativeSource: '《资治通鉴》卷一九一',
    chapter: 'zhen',
    choiceA: {
      label: '励精雪耻',
      description: '卑辞以约，暗中蓄力，整军经武以图雪耻',
      effects: [
        { type: 'speed', value: 15, target: 'all' },
        { type: 'strategy', value: 10, target: 'all' },
      ],
      flags: ['tieguo_war'],
    },
    choiceB: {
      label: '以金银换和平',
      description: '馈赠金银，换取退兵，暂解燃眉之急',
      effects: [
        { type: 'gold', value: -300 },
        { type: 'conscript', value: 400 },
      ],
    },
    requiredGenerals: ['李世民', '李靖'],
    weightBonus: { '李世民': 0.5, '李靖': 0.5 },
  },
  {
    id: 'zhen-003',
    title: '炀帝暴政',
    narrative: '杨广穷奢极欲，三征高句丽，大兴土木，民不聊生。天下义军蜂起，隋祚将亡。',
    narrativeSource: '《隋书》卷四《炀帝纪》',
    chapter: 'zhen',
    choiceA: {
      label: '清君侧',
      description: '起兵讨伐，拨乱反正，拯救天下苍生',
      effects: [
        { type: 'attack', value: 20, target: 'all' },
      ],
      enablesEvents: ['hun-004'],
    },
    choiceB: {
      label: '静待时机',
      description: '保存实力，等待天下大乱，坐收渔利',
      effects: [
        { type: 'conscript', value: 500 },
        { type: 'speed', value: -10, target: 'all' },
      ],
    },
    requiredGenerals: ['杨广'],
    weightBonus: { '杨广': 1.0 },
  },
  {
    id: 'zhen-004',
    title: '杨素遗计',
    narrative: '杨素病逝前，密室中对其子曰："我家之祸，与汝无与。然门客子弟，可托大事。"言罢而逝。',
    narrativeSource: '《隋书》卷四八《杨素传》',
    chapter: 'zhen',
    choiceA: {
      label: '收纳遗部',
      description: '接收杨素旧部，择其忠勇者而用之',
      effects: [
        { type: 'attack', value: 25, target: 'specific', targetName: '杨素' },
        { type: 'conscript', value: 400 },
      ],
      enablesEvents: ['zhen-002'],
    },
    choiceB: {
      label: '斩草除根',
      description: '清洗杨素党羽，以绝后患',
      effects: [
        { type: 'gold', value: 200 },
        { type: 'strategy', value: -12, target: 'all' },
      ],
    },
    requiredGenerals: ['杨素'],
    weightBonus: { '杨素': 1.0 },
  },

  // ==================== 第六章：混一 ====================
  {
    id: 'hun-001',
    title: '虎牢关之战',
    narrative: '武德三年，秦王李世民率三千精骑，大破窦建德十万众于虎牢关。一战而定河北，夏王束手就擒。',
    narrativeSource: '《资治通鉴》卷一八九',
    chapter: 'hun',
    choiceA: {
      label: '宽仁待之',
      description: '赦免夏王旧部，以仁义收揽人心',
      effects: [
        { type: 'conscript', value: 800 },
        { type: 'defense', value: 10, target: 'all' },
      ],
      enablesEvents: ['hun-003'],
    },
    choiceB: {
      label: '斩草除根',
      description: '夏王旧部一律充军，不留后患',
      effects: [
        { type: 'conscript', value: 500 },
        { type: 'gold', value: 200 },
      ],
      disablesEvents: ['hun-003'],
    },
    requiredGenerals: ['李世民', '窦建德'],
    weightBonus: { '李世民': 0.6, '窦建德': 0.4 },
  },
  {
    id: 'hun-002',
    title: '洛阳之战',
    narrative: '王世充据洛阳，城坚粮足。秦王围城八日，郑军降者日众，世充势孤。',
    narrativeSource: '《资治通鉴》卷一八七',
    chapter: 'hun',
    choiceA: {
      label: '围三阙一',
      description: '虚留生路，瓦解守军，不战而屈人之兵',
      effects: [
        { type: 'conscript', value: 600 },
        { type: 'gold', value: 300 },
      ],
    },
    choiceB: {
      label: '强攻破城',
      description: '强攻洛阳，血战到底，以武力定乾坤',
      effects: [
        { type: 'attack', value: 18, target: 'all' },
        { type: 'conscript', value: -200 },
      ],
    },
    requiredGenerals: ['王世充', '李世民'],
    weightBonus: { '李世民': 0.5, '王世充': 0.5 },
  },
  {
    id: 'hun-003',
    title: '窦建德之死',
    narrative: '窦建德被俘后，李世民欲斩之。建德曰："我是禽兽中生耶？然亦不失为大丈夫。"遂被杀于长安。',
    narrativeSource: '《旧唐书》卷五四《窦建德传》',
    chapter: 'hun',
    choiceA: {
      label: '厚葬夏王',
      description: '以王礼葬之，表彰忠义，收揽人心',
      effects: [
        { type: 'attributePercent', value: 10, target: 'all' },
        { type: 'moral', value: 5 },
      ],
    },
    choiceB: {
      label: '示众警戒',
      description: '传首四方，以儆效尤，威慑余党',
      effects: [
        { type: 'gold', value: 150 },
        { type: 'moral', value: -5 },
      ],
    },
    requiredGenerals: ['窦建德'],
    weightBonus: { '窦建德': 1.0 },
  },
  {
    id: 'hun-004',
    title: '江都之变',
    narrative: '大业十四年，宇文化及于江都弑杀杨广。炀帝临死前曰："好头颈，谁当斫之？"一代帝王，死于叛臣之手。',
    narrativeSource: '《隋书》卷八五《宇文化及传》',
    chapter: 'hun',
    choiceA: {
      label: '讨伐弑君',
      description: '起兵讨伐，为炀帝报仇，讨伐叛臣',
      effects: [
        { type: 'attack', value: 25, target: 'all' },
        { type: 'gold', value: -200 },
      ],
    },
    choiceB: {
      label: '借刀杀人',
      description: '暗中借宇文化及之手除掉炀帝，坐收渔利',
      effects: [
        { type: 'conscript', value: 600 },
        { type: 'moral', value: -5 },
      ],
    },
    requiredGenerals: ['宇文化及', '杨广'],
    weightBonus: { '宇文化及': 0.5, '杨广': 0.5 },
  },

  // ==================== 通用事件 ====================
  {
    id: 'gen-001',
    title: '粮草告急',
    narrative: '大军深入，粮道被劫。斥候急报：营地存粮仅余三日，若不早日筹措，军心必乱。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'sui',
    image: new URL('../../assets/events/gen-001.webp', import.meta.url).href,
    choiceA: {
      label: '强征民粮',
      description: '就地强征百姓粮草，短期内解决困境',
      effects: [
        { type: 'conscript', value: -200 },
        { type: 'moral', value: -10 },
      ],
    },
    choiceB: {
      label: '奇袭补给',
      description: '派精兵奇袭敌方粮道，以战养战',
      effects: [
        { type: 'conscript', value: 400 },
        { type: 'speed', value: -5, duration: 1 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-002',
    title: '天降大雨',
    narrative: '乌云压顶，大雨连绵数日。河水暴涨，道路泥泞难行。军中士气低落，将领亦面有忧色。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'chen',
    image: new URL('../../assets/events/gen-002.webp', import.meta.url).href,
    choiceA: {
      label: '稳步推进',
      description: '泥泞难行，稳步缓进，确保不陷入伏击',
      effects: [
        { type: 'speed', value: -15, duration: 1 },
      ],
    },
    choiceB: {
      label: '冒雨疾行',
      description: '趁敌懈怠，冒雨急行军，速至有利地形',
      effects: [
        { type: 'conscript', value: 300 },
        { type: 'defense', value: -8, duration: 1 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-003',
    title: '流民投军',
    narrative: '战乱纷纷，流民如潮。近日有数百流民至营前请降，愿为兵卒，以求饱食。其间老幼混杂，良莠不齐。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'tang',
    image: new URL('../../assets/events/gen-003.webp', import.meta.url).href,
    choiceA: {
      label: '收编壮丁',
      description: '筛选精壮者入伍，老幼安置于后方',
      effects: [
        { type: 'conscript', value: 500 },
      ],
    },
    choiceB: {
      label: '全数收容',
      description: '不论老幼尽数收编，短期内兵力大增但战力稀释',
      effects: [
        { type: 'conscript', value: 800 },
        { type: 'defense', value: -5, duration: 1 },
        { type: 'speed', value: -5, duration: 1 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-004',
    title: '军饷短缺',
    narrative: '国库空虚，军饷拖欠已有两月。士卒颇有怨言，夜间营中偶有私语。急则生变，不可不察。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'tian',
    image: new URL('../../assets/events/gen-004.webp', import.meta.url).href,
    choiceA: {
      label: '拖欠缓发',
      description: '以朝廷困难晓之以理，暂缓发放并许诺战后加倍',
      effects: [
        { type: 'gold', value: -100 },
        { type: 'moral', value: 5 },
      ],
      flags: ['delayed_payment'],
    },
    choiceB: {
      label: '挪用赈粮',
      description: '变卖赈灾粮米以发军饷，短期解决困境',
      effects: [
        { type: 'gold', value: 300 },
        { type: 'conscript', value: -300 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-005',
    title: '斥候回报',
    narrative: '夜深，斥候归营，带回敌军情报：敌军分兵两路，主力屯于东原，粮草皆在西河。另有一支精锐，游弋于山林之中，来去如风。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'hun',
    image: new URL('../../assets/events/gen-005.webp', import.meta.url).href,
    choiceA: {
      label: '断其粮道',
      description: '派精兵绕道烧毁西河粮草，断敌命脉',
      effects: [
        { type: 'strategy', value: 10 },
        { type: 'conscript', value: -200 },
      ],
      enablesEvents: ['hun-001'],
    },
    choiceB: {
      label: '伏击游骑',
      description: '设伏山林，歼灭敌军游骑，夺其战马',
      effects: [
        { type: 'attack', value: 12 },
        { type: 'conscript', value: -150 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-006',
    title: '瘟疫蔓延',
    narrative: '军中忽起疫病，病卒十有三四。高热咳血，死者日增。军医束手，将领忧惧。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'zhen',
    image: new URL('../../assets/events/gen-006.webp', import.meta.url).href,
    choiceA: {
      label: '封营隔离',
      description: '将病卒隔离医治，牺牲部分兵力换取整体健康',
      effects: [
        { type: 'conscript', value: -400 },
        { type: 'defense', value: 8 },
      ],
      flags: ['epidemic_survived'],
    },
    choiceB: {
      label: '弃卒保车',
      description: '将病卒尽数遣散，轻装疾行',
      effects: [
        { type: 'conscript', value: -200 },
        { type: 'speed', value: 10 },
        { type: 'moral', value: -8 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-007',
    title: '夜间惊营',
    narrative: '子夜，营地忽传惊叫，疑有敌军劫营。全军惊醒，乱作一团，点火四照，兵器相交……原来是虚惊一场，不过是野兽惊扰。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'sui',
    image: new URL('../../assets/events/gen-007.webp', import.meta.url).href,
    choiceA: {
      label: '彻夜警戒',
      description: '全营戒严，提防真正的袭击，次日行军疲惫',
      effects: [
        { type: 'defense', value: 10 },
        { type: 'speed', value: -5, duration: 1 },
      ],
    },
    choiceB: {
      label: '趁夜转移',
      description: '趁夜色掩护全军转移，另寻营地',
      effects: [
        { type: 'speed', value: 15 },
        { type: 'conscript', value: -100 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-008',
    title: '俘虏处置',
    narrative: '战后，清点俘虏数百人。其目光或仇恨、或茫然、或不服。如何处置，关乎军心与后路。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'chen',
    image: new URL('../../assets/events/gen-008.webp', import.meta.url).href,
    choiceA: {
      label: '优待俘虏',
      description: '以礼待之，愿留者编入军中，不愿者放归',
      effects: [
        { type: 'conscript', value: 300 },
        { type: 'moral', value: 8 },
        { type: 'attack', value: -5 },
      ],
    },
    choiceB: {
      label: '严刑立威',
      description: '斩首示众，以儆效尤，震慑敌军',
      effects: [
        { type: 'attack', value: 12 },
        { type: 'moral', value: -10 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-009',
    title: '商路断绝',
    narrative: '战火蔓延，商路断绝。往日熙攘的集市如今空空如也，盐铁布匹皆无从购置，金价飞涨。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'tang',
    image: new URL('../../assets/events/gen-009.webp', import.meta.url).href,
    choiceA: {
      label: '官府强买',
      description: '以官价强制收购民间物资',
      effects: [
        { type: 'gold', value: -200 },
        { type: 'conscript', value: 200 },
      ],
      flags: ['merchant_hostile'],
    },
    choiceB: {
      label: '以物易物',
      description: '用军中余粮换购紧缺物资，高价出售',
      effects: [
        { type: 'gold', value: 400 },
        { type: 'moral', value: -5 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
  {
    id: 'gen-010',
    title: '将领不和',
    narrative: '两位将领因战略分歧在帐前争执不下，言辞激烈，各有拥趸。士卒围观，窃窃私语。处理不当，轻则内耗，重则分裂。',
    narrativeSource: '虚构（泛历史背景）',
    chapter: 'tian',
    image: new URL('../../assets/events/gen-010.webp', import.meta.url).href,
    choiceA: {
      label: '秉公裁断',
      description: '听取双方意见后公正裁决，维护团结',
      effects: [
        { type: 'strategy', value: 10 },
      ],
      flags: ['general_harmony'],
    },
    choiceB: {
      label: '各领一军',
      description: '将二人分兵统领，各展所长，减少内耗',
      effects: [
        { type: 'attack', value: 15 },
        { type: 'defense', value: -8 },
      ],
    },
    requiredGenerals: [],
    weightBonus: {},
  },
];
