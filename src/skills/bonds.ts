import type { General } from "./types";

/** 羁绊定义 */
export interface Bond {
  id: string;
  name: string;
  /** 所需武将ID列表（正数） */
  memberIds: number[];
  /** 效果描述 */
  description: string;
  /** 效果施加函数 */
  apply: (generals: General[], addReport?: (msg: string) => void) => void;
}

/** 在数组中查找指定ID的武将 */
function findGeneral(generals: General[], id: number): General | undefined {
  return generals.find(g => g.id === id);
}

// ============================================================
// 核心羁绊
// ============================================================

/** 瓦岗双雄：秦琼 + 程咬金 */
const bondWagangTwin: Bond = {
  id: "wagang-twin",
  name: "瓦岗双雄",
  memberIds: [31, 33], // 秦琼(31)、程咬金(33)
  description: "同队时攻击+18%，速度+12%，前两回合双方追击概率+25%",
  apply(generals, addReport) {
    const qinQiong = findGeneral(generals, 31);
    const chengYaoJin = findGeneral(generals, 33);
    if (!qinQiong || !chengYaoJin) return;

    // 攻击+18%，速度+12%
    for (const g of [qinQiong, chengYaoJin]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.attackBonus = (g.skillEffects.attackBonus || 0) + 18;
      g.skillEffects.attackBonusSource = "瓦岗双雄";
      g.skillEffects.speedBonus = (g.skillEffects.speedBonus || 0) + 12;
      g.skillEffects.speedBonusSource = "瓦岗双雄";
      g.skillEffects.wagangTwinActive = true;
    }
    if (addReport) addReport("【羁绊·瓦岗双雄】激活！秦琼、程咬金攻击+18%，速度+12%");
  },
};

/** 门神镇宅：秦琼 + 尉迟恭 */
const bondMenshen: Bond = {
  id: "menshen-zhenzhai",
  name: "门神镇宅",
  memberIds: [31, 32], // 秦琼(31)、尉迟恭(32)
  description: "同队时防御+22%，受伤-12%，双方免疫怯战",
  apply(generals, addReport) {
    const qinQiong = findGeneral(generals, 31);
    const yuchiJingde = findGeneral(generals, 32);
    if (!qinQiong || !yuchiJingde) return;

    for (const g of [qinQiong, yuchiJingde]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.defenseBonus = (g.skillEffects.defenseBonus || 0) + 22;
      g.skillEffects.defenseBonusSource = "门神镇宅";
      g.skillEffects.damageReduction = (g.skillEffects.damageReduction || 0) + 12;
      g.skillEffects.damageReductionSource = "门神镇宅";
      g.skillEffects.immuneToChichan = true;
      g.skillEffects.immuneToChichanSource = "门神镇宅";
    }
    if (addReport) addReport("【羁绊·门神镇宅】激活！秦琼、尉迟恭防御+22%，受伤-12%，免疫怯战");
  },
};

/** 开国君臣：杨坚 + 高颎 */
const bondKaiguo: Bond = {
  id: "kaiguo-junchen",
  name: "开国君臣",
  memberIds: [21, 24], // 杨坚(21)、高颎(24)
  description: "同队时谋略+20%，敌方全体策防-15%，我方策略伤害+12%",
  apply(generals, addReport) {
    const yangJian = findGeneral(generals, 21);
    const gaoJiong = findGeneral(generals, 24);
    if (!yangJian || !gaoJiong) return;

    // 谋略+20%
    for (const g of [yangJian, gaoJiong]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.strategyBonus = (g.skillEffects.strategyBonus || 0) + 20;
      g.skillEffects.strategyBonusSource = "开国君臣";
    }
    // 敌方全体策防-15%，我方策略伤害+12%
    for (const g of generals) {
      if (!g.skillEffects) g.skillEffects = {};
      // 作用于所有敌方单位（由调用方过滤side）
      g.skillEffects.enemyStrategyDefenseReduction = (g.skillEffects.enemyStrategyDefenseReduction || 0) + 15;
      g.skillEffects.enemyStrategyDefenseReductionSource = "开国君臣";
      g.skillEffects.teamStrategyDamageIncrease = (g.skillEffects.teamStrategyDamageIncrease || 0) + 12;
      g.skillEffects.teamStrategyDamageIncreaseSource = "开国君臣";
    }
    if (addReport) addReport("【羁绊·开国君臣】激活！杨坚、高颎谋略+20%，我方策略伤害+12%");
  },
};

/** 李唐皇室：李渊 + 李世民 + 李元吉 */
const bondLiTangRoyal: Bond = {
  id: "litang-royal",
  name: "李唐皇室",
  memberIds: [1, 3, 655], // 李渊(1)、李世民(3)、李元吉(655)
  description: "同队时首回合我方全体攻击+35%、速度+20%，李世民免疫怯战与沉默，李元吉连击概率+30%",
  apply(generals, addReport) {
    const liYuan = findGeneral(generals, 1);
    const liShimin = findGeneral(generals, 3);
    const liYuanJi = findGeneral(generals, 655);
    if (!liYuan || !liShimin || !liYuanJi) return;

    // 首回合全体攻击+35%，速度+20%（通过标记，在战斗逻辑中处理）
    for (const g of [liYuan, liShimin, liYuanJi]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.litangFirstRoundBonus = 35;
      g.skillEffects.litangFirstRoundSpeed = 20;
      g.skillEffects.litangRoyalActive = true;
    }

    // 李世民免疫怯战与沉默
    if (!liShimin.skillEffects) liShimin.skillEffects = {};
    liShimin.skillEffects.immuneToChichan = true;
    liShimin.skillEffects.immuneToChichanSource = "李唐皇室";
    liShimin.skillEffects.immuneToSilence = true;
    liShimin.skillEffects.immuneToSilenceSource = "李唐皇室";

    // 李元吉连击概率+30%
    if (!liYuanJi.skillEffects) liYuanJi.skillEffects = {};
    liYuanJi.skillEffects.extraAttackChance = (liYuanJi.skillEffects.extraAttackChance || 0) + 0.30;
    liYuanJi.skillEffects.extraAttackChanceSource = "李唐皇室";

    if (addReport) addReport("【羁绊·李唐皇室】激活！首回合全体攻击+35%、速度+20%，李世民免疫怯战沉默");
  },
};

/** 天策上将：李世民 + 李靖 */
const bondTianceShangjiang: Bond = {
  id: "tiance-shangjiang",
  name: "天策上将",
  memberIds: [3, 29], // 李世民(3)、李靖(29)
  description: "同队时李世民攻击附加65%策略伤害，李靖连击概率+40%，双方追击概率+25%",
  apply(generals, addReport) {
    const liShimin = findGeneral(generals, 3);
    const liJing = findGeneral(generals, 29);
    if (!liShimin || !liJing) return;

    // 李世民攻击附加65%策略伤害
    if (!liShimin.skillEffects) liShimin.skillEffects = {};
    liShimin.skillEffects.strategyDamageBonus = (liShimin.skillEffects.strategyDamageBonus || 0) + 0.65;
    liShimin.skillEffects.strategyDamageBonusSource = "天策上将";

    // 李靖连击概率+40%
    if (!liJing.skillEffects) liJing.skillEffects = {};
    liJing.skillEffects.extraAttackChance = (liJing.skillEffects.extraAttackChance || 0) + 0.40;
    liJing.skillEffects.extraAttackChanceSource = "天策上将";

    // 双方追击概率+25%
    for (const g of [liShimin, liJing]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.pursuitChance = (g.skillEffects.pursuitChance || 0) + 0.25;
      g.skillEffects.pursuitChanceSource = "天策上将";
    }

    if (addReport) addReport("【羁绊·天策上将】激活！李世民攻击附加65%策略伤害，李靖连击+40%，追击+25%");
  },
};

/** 贞观双相：房玄龄 + 杜如晦 */
const bondZhenGuan: Bond = {
  id: "zhen-guan-shuangxiang",
  name: "贞观双相",
  memberIds: [27, 28], // 房玄龄(27)、杜如晦(28)
  description: "同队时主动战法概率+18%，每回合驱散我方全体1个debuff",
  apply(generals, addReport) {
    const fangXuanLing = findGeneral(generals, 27);
    const duRuHui = findGeneral(generals, 28);
    if (!fangXuanLing || !duRuHui) return;

    for (const g of [fangXuanLing, duRuHui]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.skillProbabilityBonus = (g.skillEffects.skillProbabilityBonus || 0) + 18;
      g.skillEffects.skillProbabilityBonusSource = "贞观双相";
      g.skillEffects.zhenGuanTwinActive = true; // 标记用于驱散逻辑
    }
    if (addReport) addReport("【羁绊·贞观双相】激活！房玄龄、杜如晦主动战法概率+18%");
  },
};

/** 太原起兵：李渊 + 刘文静 */
const bondTaiyuan: Bond = {
  id: "taiyuan-qibing",
  name: "太原起兵",
  memberIds: [1, 20], // 李渊(1)、刘文静(20)
  description: "同队时首回合全体攻击+28%，李渊指挥效果延长1回合",
  apply(generals, addReport) {
    const liYuan = findGeneral(generals, 1);
    const liuWenJing = findGeneral(generals, 20);
    if (!liYuan || !liuWenJing) return;

    // 首回合全体攻击+28%（通过标记，在战斗逻辑中处理）
    if (!liYuan.skillEffects) liYuan.skillEffects = {};
    liYuan.skillEffects.taiyuanBondActive = true;
    liYuan.skillEffects.taiyuanBonus = 28;
    liYuan.skillEffects.taiyuanBonusSource = "太原起兵";

    if (!liuWenJing.skillEffects) liuWenJing.skillEffects = {};
    liuWenJing.skillEffects.taiyuanBondActive = true;
    liuWenJing.skillEffects.taiyuanBonus = 28;
    liuWenJing.skillEffects.taiyuanBonusSource = "太原起兵";

    // 李渊指挥效果延长1回合
    liYuan.skillEffects.taiyuanExtendCommand = true;
    liYuan.skillEffects.taiyuanExtendCommandSource = "太原起兵";

    if (addReport) addReport("【羁绊·太原起兵】激活！首回合全体攻击+28%，李渊指挥效果延长1回合");
  },
};

/** 灭陈双将：韩擒虎 + 贺若弼 */
const bondMieChen: Bond = {
  id: "mie-chen-shuangjiang",
  name: "灭陈双将",
  memberIds: [43, 44], // 韩擒虎(43)、贺若弼(44)
  description: "同队时物理伤害+22%，双方追击概率+20%",
  apply(generals, addReport) {
    const hanQinHu = findGeneral(generals, 43);
    const heRuoBi = findGeneral(generals, 44);
    if (!hanQinHu || !heRuoBi) return;

    for (const g of [hanQinHu, heRuoBi]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.damageIncrease = (g.skillEffects.damageIncrease || 0) + 22;
      g.skillEffects.damageIncreaseSource = "灭陈双将";
      g.skillEffects.pursuitChance = (g.skillEffects.pursuitChance || 0) + 0.20;
      g.skillEffects.pursuitChanceSource = "灭陈双将";
    }
    if (addReport) addReport("【羁绊·灭陈双将】激活！韩擒虎、贺若弼物理伤害+22%，追击概率+20%");
  },
};

/** 越公遗志：杨素 + 裴行俨 */
const bondYuegong: Bond = {
  id: "yuegong-yizhi",
  name: "越公遗志",
  memberIds: [25, 35], // 杨素(25)、裴行俨(35)
  description: "同队时攻城伤害+40%，对大营目标额外+25%",
  apply(generals, addReport) {
    const yangSu = findGeneral(generals, 25);
    const peiXingYan = findGeneral(generals, 35);
    if (!yangSu || !peiXingYan) return;

    for (const g of [yangSu, peiXingYan]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.siegeDamageBonus = (g.skillEffects.siegeDamageBonus || 0) + 40;
      g.skillEffects.siegeDamageBonusSource = "越公遗志";
      g.skillEffects.siegeDamageToGeneralBonus = (g.skillEffects.siegeDamageToGeneralBonus || 0) + 25;
      g.skillEffects.siegeDamageToGeneralBonusSource = "越公遗志";
    }
    if (addReport) addReport("【羁绊·越公遗志】激活！杨素、裴行俨攻城伤害+40%，对大营目标+25%");
  },
};

/** 隋末权奸：宇文化及 + 杨广 */
const bondSuiMoQuanJian: Bond = {
  id: "suimo-quanjian",
  name: "隋末权奸",
  memberIds: [26, 22], // 宇文化及(26)、杨广(22)
  description: "同队时敌方全体速度-20%，宇文化及怯战效果延长1回合",
  apply(generals, addReport) {
    const yuwenHuaJi = findGeneral(generals, 26);
    const yangGuang = findGeneral(generals, 22);
    if (!yuwenHuaJi || !yangGuang) return;

    // 敌方全体速度-20%
    for (const g of generals) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.enemySpeedReduction = (g.skillEffects.enemySpeedReduction || 0) + 20;
      g.skillEffects.enemySpeedReductionSource = "隋末权奸";
    }
    // 宇文化及怯战效果延长1回合
    if (!yuwenHuaJi.skillEffects) yuwenHuaJi.skillEffects = {};
    yuwenHuaJi.skillEffects.suimoExtendFear = true;
    yuwenHuaJi.skillEffects.suimoExtendFearSource = "隋末权奸";

    if (addReport) addReport("【羁绊·隋末权奸】激活！敌方全体速度-20%");
  },
};

// 夏王义军: 窦建德 + 刘黑闼 → 刘黑闼不在游戏中，跳过

/** 郑帝枭雄：王世充 + 宇文士及 */
const bondZhengdi: Bond = {
  id: "zhengdi-xiaoxiong",
  name: "郑帝枭雄",
  memberIds: [526, -1], // 王世充(526)、宇文士及(不在游戏中)
  description: "同队时敌方全体策防-18%，我方策略伤害+15%",
  apply(generals, addReport) {
    const wangShiChong = findGeneral(generals, 526);
    // 宇文士及不在游戏中，只触发单方效果
    if (!wangShiChong) return;

    // 敌方全体策防-18%，我方策略伤害+15%（仅对王世充生效）
    if (!wangShiChong.skillEffects) wangShiChong.skillEffects = {};
    wangShiChong.skillEffects.enemyStrategyDefenseReduction = (wangShiChong.skillEffects.enemyStrategyDefenseReduction || 0) + 18;
    wangShiChong.skillEffects.enemyStrategyDefenseReductionSource = "郑帝枭雄";
    wangShiChong.skillEffects.teamStrategyDamageIncrease = (wangShiChong.skillEffects.teamStrategyDamageIncrease || 0) + 15;
    wangShiChong.skillEffects.teamStrategyDamageIncreaseSource = "郑帝枭雄";
    wangShiChong.skillEffects.zhengdiActive = true;

    if (addReport) addReport("【羁绊·郑帝枭雄】部分激活！王世充敌方策防-18%，策略伤害+15%");
  },
};

// ============================================================
// 辅助羁绊
// ============================================================

/** 瓦岗谋主：李密 + 秦琼 */
const bondWagangMouzhu: Bond = {
  id: "wagang-mouzhu",
  name: "瓦岗谋主",
  memberIds: [570, 31], // 李密(570)、秦琼(31)
  description: "同队时李密策略伤害+20%，秦琼物理伤害+10%",
  apply(generals, addReport) {
    const liMi = findGeneral(generals, 570);
    const qinQiong = findGeneral(generals, 31);
    if (!liMi || !qinQiong) return;

    if (!liMi.skillEffects) liMi.skillEffects = {};
    liMi.skillEffects.strategyDamageIncrease = (liMi.skillEffects.strategyDamageIncrease || 0) + 20;
    liMi.skillEffects.strategyDamageIncreaseSource = "瓦岗谋主";

    if (!qinQiong.skillEffects) qinQiong.skillEffects = {};
    qinQiong.skillEffects.damageIncrease = (qinQiong.skillEffects.damageIncrease || 0) + 10;
    qinQiong.skillEffects.damageIncreaseSource = "瓦岗谋主";

    if (addReport) addReport("【羁绊·瓦岗谋主】激活！李密策略伤害+20%，秦琼物理伤害+10%");
  },
};

/** 双雄并立：韩擒虎 + 史万岁 */
const bondShuangxiong: Bond = {
  id: "shuangxiong-bingli",
  name: "双雄并立",
  memberIds: [43, 42], // 韩擒虎(43)、史万岁(42)
  description: "同队时攻击+15%，双方速度+8%",
  apply(generals, addReport) {
    const hanQinHu = findGeneral(generals, 43);
    const shiWanSui = findGeneral(generals, 42);
    if (!hanQinHu || !shiWanSui) return;

    for (const g of [hanQinHu, shiWanSui]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.attackBonus = (g.skillEffects.attackBonus || 0) + 15;
      g.skillEffects.attackBonusSource = "双雄并立";
      g.skillEffects.speedBonus = (g.skillEffects.speedBonus || 0) + 8;
      g.skillEffects.speedBonusSource = "双雄并立";
    }
    if (addReport) addReport("【羁绊·双雄并立】激活！韩擒虎、史万岁攻击+15%，速度+8%");
  },
};

/** 剿匪双杰：张须陀 + 来护儿 */
const bondJiaofei: Bond = {
  id: "jiaofei-shuangjie",
  name: "剿匪双杰",
  memberIds: [578, 535], // 张须陀(578)、来护儿(535)
  description: "同队时张须陀反击概率+25%，来护儿每场战斗首次攻击伤害+40%",
  apply(generals, addReport) {
    const zhangXuTuo = findGeneral(generals, 578);
    const laiHuEr = findGeneral(generals, 535);
    if (!zhangXuTuo || !laiHuEr) return;

    if (!zhangXuTuo.skillEffects) zhangXuTuo.skillEffects = {};
    zhangXuTuo.skillEffects.counterAttackChance = (zhangXuTuo.skillEffects.counterAttackChance || 0) + 0.25;
    zhangXuTuo.skillEffects.counterAttackChanceSource = "剿匪双杰";

    if (!laiHuEr.skillEffects) laiHuEr.skillEffects = {};
    laiHuEr.skillEffects.firstAttackDamageBonus = (laiHuEr.skillEffects.firstAttackDamageBonus || 0) + 40;
    laiHuEr.skillEffects.firstAttackDamageBonusSource = "剿匪双杰";

    if (addReport) addReport("【羁绊·剿匪双杰】激活！张须陀反击概率+25%，来护儿首次攻击伤害+40%");
  },
};

/** 门神护卫：尉迟恭 + 程咬金 */
const bondMenshenHuwei: Bond = {
  id: "menshen-huwei",
  name: "门神护卫",
  memberIds: [32, 33], // 尉迟恭(32)、程咬金(33)
  description: "同队时双方受伤-15%，追击概率+20%",
  apply(generals, addReport) {
    const yuchiJingde = findGeneral(generals, 32);
    const chengYaoJin = findGeneral(generals, 33);
    if (!yuchiJingde || !chengYaoJin) return;

    for (const g of [yuchiJingde, chengYaoJin]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.damageReduction = (g.skillEffects.damageReduction || 0) + 15;
      g.skillEffects.damageReductionSource = "门神护卫";
      g.skillEffects.pursuitChance = (g.skillEffects.pursuitChance || 0) + 0.20;
      g.skillEffects.pursuitChanceSource = "门神护卫";
    }
    if (addReport) addReport("【羁绊·门神护卫】激活！尉迟恭、程咬金受伤-15%，追击概率+20%");
  },
};

/** 隋室忠臣：裴仁基 + 杨广 */
const bondSuiShiZhongchen: Bond = {
  id: "suishi-zhongchen",
  name: "隋室忠臣",
  memberIds: [571, 22], // 裴仁基(571)、杨广(22)
  description: "同队时裴仁基伤害+18%，杨广被动效果叠加层数+2",
  apply(generals, addReport) {
    const peiRenJi = findGeneral(generals, 571);
    const yangGuang = findGeneral(generals, 22);
    if (!peiRenJi || !yangGuang) return;

    if (!peiRenJi.skillEffects) peiRenJi.skillEffects = {};
    peiRenJi.skillEffects.damageIncrease = (peiRenJi.skillEffects.damageIncrease || 0) + 18;
    peiRenJi.skillEffects.damageIncreaseSource = "隋室忠臣";

    if (!yangGuang.skillEffects) yangGuang.skillEffects = {};
    yangGuang.skillEffects.passiveStackBonus = (yangGuang.skillEffects.passiveStackBonus || 0) + 2;
    yangGuang.skillEffects.passiveStackBonusSource = "隋室忠臣";

    if (addReport) addReport("【羁绊·隋室忠臣】激活！裴仁基伤害+18%，杨广被动层数上限+2");
  },
};

/** 开皇四贵：杨坚 + 苏威 */
const bondKaihuang: Bond = {
  id: "kaihuang-sigui",
  name: "开皇四贵",
  memberIds: [21, 70], // 杨坚(21)、苏威(70)
  description: "同队时敌方全体谋略-12%，我方策略防御+18%",
  apply(generals, addReport) {
    const yangJian = findGeneral(generals, 21);
    const suWei = findGeneral(generals, 70);
    if (!yangJian || !suWei) return;

    // 敌方全体谋略-12%
    for (const g of generals) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.enemyStrategyReduction = (g.skillEffects.enemyStrategyReduction || 0) + 12;
      g.skillEffects.enemyStrategyReductionSource = "开皇四贵";
    }
    // 我方策略防御+18%
    for (const g of [yangJian, suWei]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.strategyDefenseBonus = (g.skillEffects.strategyDefenseBonus || 0) + 18;
      g.skillEffects.strategyDefenseBonusSource = "开皇四贵";
    }
    if (addReport) addReport("【羁绊·开皇四贵】激活！敌方全体谋略-12%，我方策略防御+18%");
  },
};

/** 骁果雄师：沈光 + 宇文化及 */
const bondXiaoguo: Bond = {
  id: "xiaoguo-xiongshi",
  name: "骁果雄师",
  memberIds: [534, 26], // 沈光(534)、宇文化及(26)
  description: "同队时沈光速度+15%，免疫沉默效果",
  apply(generals, addReport) {
    const shenGuang = findGeneral(generals, 534);
    const yuwenHuaJi = findGeneral(generals, 26);
    if (!shenGuang || !yuwenHuaJi) return;

    if (!shenGuang.skillEffects) shenGuang.skillEffects = {};
    shenGuang.skillEffects.speedBonus = (shenGuang.skillEffects.speedBonus || 0) + 15;
    shenGuang.skillEffects.speedBonusSource = "骁果雄师";
    shenGuang.skillEffects.immuneToSilence = true;
    shenGuang.skillEffects.immuneToSilenceSource = "骁果雄师";

    if (addReport) addReport("【羁绊·骁果雄师】激活！沈光速度+15%，免疫沉默");
  },
};

/** 刚正名臣：元岩 + 李德林 */
const bondGangzheng: Bond = {
  id: "gangzheng-mingchen",
  name: "刚正名臣",
  memberIds: [515, 69], // 元岩(515)、李德林(69)
  description: "同队时我方全体防御+12%，每回合驱散我方1个debuff",
  apply(generals, addReport) {
    const yuanYan = findGeneral(generals, 515);
    const liDeLin = findGeneral(generals, 69);
    if (!yuanYan || !liDeLin) return;

    // 我方全体防御+12%
    for (const g of generals) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.teamDefenseBonus = (g.skillEffects.teamDefenseBonus || 0) + 12;
      g.skillEffects.teamDefenseBonusSource = "刚正名臣";
    }
    // 标记用于驱散逻辑
    for (const g of [yuanYan, liDeLin]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.gangzhengActive = true;
    }
    if (addReport) addReport("【羁绊·刚正名臣】激活！我方全体防御+12%");
  },
};

/** 河东世家：柳机 + 柳述 */
const bondHedong: Bond = {
  id: "hedong-shijia",
  name: "河东世家",
  memberIds: [76, 77], // 柳机(76)、柳述(77)
  description: "同队时双方防御+15%，免疫攻心效果",
  apply(generals, addReport) {
    const liuJi = findGeneral(generals, 76);
    const liuShu = findGeneral(generals, 77);
    if (!liuJi || !liuShu) return;

    for (const g of [liuJi, liuShu]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.defenseBonus = (g.skillEffects.defenseBonus || 0) + 15;
      g.skillEffects.defenseBonusSource = "河东世家";
      g.skillEffects.immuneToDebuff = true;
      g.skillEffects.immuneToDebuffSource = "河东世家";
    }
    if (addReport) addReport("【羁绊·河东世家】激活！柳机、柳述防御+15%，免疫攻心效果");
  },
};

/** 平贼先锋：来护儿 + 裴仁基 */
const bondPingzei: Bond = {
  id: "pingzei-xianfeng",
  name: "平贼先锋",
  memberIds: [535, 571], // 来护儿(535)、裴仁基(571)
  description: "同队时双方追击概率+30%，攻城伤害+20%",
  apply(generals, addReport) {
    const laiHuEr = findGeneral(generals, 535);
    const peiRenJi = findGeneral(generals, 571);
    if (!laiHuEr || !peiRenJi) return;

    for (const g of [laiHuEr, peiRenJi]) {
      if (!g.skillEffects) g.skillEffects = {};
      g.skillEffects.pursuitChance = (g.skillEffects.pursuitChance || 0) + 0.30;
      g.skillEffects.pursuitChanceSource = "平贼先锋";
      g.skillEffects.siegeDamageBonus = (g.skillEffects.siegeDamageBonus || 0) + 20;
      g.skillEffects.siegeDamageBonusSource = "平贼先锋";
    }
    if (addReport) addReport("【羁绊·平贼先锋】激活！来护儿、裴仁基追击概率+30%，攻城伤害+20%");
  },
};

// ============================================================
// 羁绊列表
// ============================================================

export const BONDS: Bond[] = [
  // 核心羁绊
  bondWagangTwin,
  bondMenshen,
  bondKaiguo,
  bondLiTangRoyal,
  bondTianceShangjiang,
  bondZhenGuan,
  bondTaiyuan,
  bondMieChen,
  bondYuegong,
  bondSuiMoQuanJian,
  bondZhengdi,
  // 辅助羁绊
  bondWagangMouzhu,
  bondShuangxiong,
  bondJiaofei,
  bondMenshenHuwei,
  bondSuiShiZhongchen,
  bondKaihuang,
  bondXiaoguo,
  bondGangzheng,
  bondHedong,
  bondPingzei,
];

// ============================================================
// 辅助函数
// ============================================================

/**
 * 激活队伍中满足条件的羁绊
 * @param teamGenerals 同队伍中的武将数组
 * @param addReport 可选的战斗报告函数
 * @returns 被激活羁绊的武将ID列表
 */
export function activateBonds(
  teamGenerals: General[],
  addReport?: (msg: string) => void,
): number[] {
  const activatedIds: number[] = [];

  for (const bond of BONDS) {
    // 过滤掉ID=-1的占位成员（游戏外武将）
    const validMemberIds = bond.memberIds.filter(id => id > 0);
    const matchedMembers = teamGenerals.filter(g => validMemberIds.includes(g.id));

    // 满足条件：所有有效成员都在队伍中
    if (matchedMembers.length >= validMemberIds.length) {
      bond.apply(teamGenerals, addReport);
      for (const g of matchedMembers) {
        if (!activatedIds.includes(g.id)) {
          activatedIds.push(g.id);
        }
      }
    }
  }

  return activatedIds;
}

/**
 * 获取武将激活的所有羁绊名称
 * @param generalId 武将ID
 * @param teamGenerals 同队武将数组
 * @returns 羁绊名称列表
 */
export function getActiveBondNames(generalId: number, teamGenerals: General[]): string[] {
  const names: string[] = [];
  for (const bond of BONDS) {
    const validMemberIds = bond.memberIds.filter(id => id > 0);
    const matched = teamGenerals.filter(g => validMemberIds.includes(g.id));
    if (matched.length >= validMemberIds.length && matched.some(g => g.id === generalId)) {
      names.push(bond.name);
    }
  }
  return names;
}