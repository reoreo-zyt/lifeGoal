import { createYuchiJiong } from "./yuchi-jiong";
import { createQinQiong } from "./qin-qiong";
import { createChengYaoJin } from "./cheng-yao-jin";
import { createYuchiJingde } from "./yuchi-jingde";
import { createLuYanShi } from "./lu-yan-shi";
import { createWeiShiKang } from "./wei-shi-kang";
import { createFengDeYi } from "./feng-ci-ming";
import { createDiXiaoWei } from "./di-wu-qi";
import { createShangGuanYi } from "./shang-guan-yi";
import { createYangWenSi } from "./yang-wen-si";
import { createWeiYi } from "./wei-yi";
import { createHanQinHu } from "./han-qin-hu";
import { createYangJian } from "./yang-jian";
import { createGaoJiong } from "./gao-jiong";
import { createYangSu } from "./yang-su";
import { createHeRuoBi } from "./he-ruo-bi";
import { createLiJing } from "./li-jing";
import { createLiShimin } from "./li-shimin";
import { createLiuWenJing } from "./liu-wen-jing";
import { createYuWenHuaJi } from "./yuwen-hua-ji";
import { createLiMi } from "./li-mi";
import { createShiWanSui } from "./shi-wan-sui";
import { createYuShiJi } from "./yu-shi-ji";
import { createLiYuan } from "./li-yuan";
import { createYangGuang } from "./yang-guang";
import { createFangXuanLing } from "./fang-xuan-ling";
import { createDuRuHui } from "./du-ru-hui";
import { createYuChiGong } from "./yu-chi-gong";
import { createLiDeLin } from "./li-de-lin";
import { createYuanYan as createYuanYanShi } from "./yuan-yan-shi";
import { createYuanYan as createYuanYanYanshi } from "./yuan-yan";
import { createYuJuLou } from "./yu-ju-lou";
import { createPeiXingYan } from "./pei-xing-yan";
import { createDuHuChang } from "./du-hu-chang";
import { createLiuFang } from "./liu-fang";
import { createYuanWenJing } from "./yuan-wen-jing";
import { createLiYuanJi } from "./li-yuan-ji";
import { createPeiRenJi } from "./pei-ren-ji";
import { createShenGuang } from "./shen-guang";
import { createLaiHuEr } from "./lai-hu-er";
import { createZhangXuTuo } from "./zhang-xu-tuo";
import { createLiuShu } from "./liu-shu";
import { createWangShiChong } from "./wang-shi-chong";
import { createDouJianDe } from "./dou-jian-de";
import { createSuWei } from "./su-wei";
import { createLiuJi } from "./liu-ji";
import { createYuWenShu } from "./yuwen-shu";
import type { GeneralRarity } from "./types";
export type { Bond } from "./bonds";
export { BONDS, activateBonds, getActiveBondNames } from "./bonds";

// ============================================================
// 招募配置：武将稀有度分组
// ============================================================

// 招募配置项
export interface RecruitConfigItem {
  id: number;
  moduleName: string;
  fetchFnName: string;
  name: string;
  rarity: GeneralRarity;
}

// 按稀有度分组的武将列表
export const RECRUIT_CONFIG: RecruitConfigItem[] = [
  // ★★★★★ 金（4人）
  { id: 21, moduleName: "yang-jian", fetchFnName: "fetchYangJianFromDatabase", name: "杨坚", rarity: "legendary" },
  { id: 24, moduleName: "gao-jiong", fetchFnName: "fetchGaoJiongFromDatabase", name: "高颎", rarity: "legendary" },
  { id: 25, moduleName: "yang-su", fetchFnName: "fetchYangSuFromDatabase", name: "杨素", rarity: "legendary" },
  { id: 2, moduleName: "li-shimin", fetchFnName: "fetchLiShiminFromDatabase", name: "李世民", rarity: "legendary" },
  { id: 29, moduleName: "li-jing", fetchFnName: "fetchLiJingFromDatabase", name: "李靖", rarity: "legendary" },

  // ★★★★ 紫（12人）
  { id: 4, moduleName: "yu-chi-gong", fetchFnName: "fetchYuChiGongFromDatabase", name: "尉迟恭", rarity: "rare" },
  { id: 27, moduleName: "fang-xuan-ling", fetchFnName: "fetchFangXuanLingFromDatabase", name: "房玄龄", rarity: "rare" },
  { id: 28, moduleName: "du-ru-hui", fetchFnName: "fetchDuRuHuiFromDatabase", name: "杜如晦", rarity: "rare" },
  { id: 633, moduleName: "yuchi-jiong", fetchFnName: "fetchYuchiJiongFromDatabase", name: "尉迟迥", rarity: "rare" },
  { id: 43, moduleName: "han-qin-hu", fetchFnName: "fetchHanQinHuFromDatabase", name: "韩擒虎", rarity: "rare" },
  { id: 44, moduleName: "he-ruo-bi", fetchFnName: "fetchHeRuoBiFromDatabase", name: "贺若弼", rarity: "rare" },
  { id: 22, moduleName: "yang-guang", fetchFnName: "fetchYangGuangFromDatabase", name: "杨广", rarity: "rare" },
  { id: 42, moduleName: "shi-wan-sui", fetchFnName: "fetchShiWanSuiFromDatabase", name: "史万岁", rarity: "rare" },
  { id: 34, moduleName: "yu-ju-lou", fetchFnName: "fetchYuJuLouFromDatabase", name: "鱼俱罗", rarity: "rare" },
  { id: 35, moduleName: "pei-xing-yan", fetchFnName: "fetchPeiXingYanFromDatabase", name: "裴行俨", rarity: "rare" },
  { id: 36, moduleName: "du-hu-chang", fetchFnName: "fetchDuHuChangFromDatabase", name: "李光弼", rarity: "rare" },
  { id: 37, moduleName: "liu-fang", fetchFnName: "fetchLiuFangFromDatabase", name: "刘昉", rarity: "rare" },
  { id: 31, moduleName: "qin-qiong", fetchFnName: "fetchQinQiongFromDatabase", name: "秦琼", rarity: "rare" },
  { id: 33, moduleName: "cheng-yao-jin", fetchFnName: "fetchChengYaoJinFromDatabase", name: "程咬金", rarity: "rare" },
  { id: 32, moduleName: "yuchi-jingde", fetchFnName: "fetchYuchiJingdeFromDatabase", name: "尉迟恭", rarity: "rare" },

  // ★★★ 绿（8人）
  { id: 570, moduleName: "li-mi", fetchFnName: "fetchLiMiFromDatabase", name: "李密", rarity: "uncommon" },
  { id: 561, moduleName: "yu-shi-ji", fetchFnName: "fetchYuShiJiFromDatabase", name: "虞世基", rarity: "uncommon" },
  { id: 69, moduleName: "li-de-lin", fetchFnName: "fetchLiDeLinFromDatabase", name: "李德林", rarity: "uncommon" },
  { id: 20, moduleName: "liu-wen-jing", fetchFnName: "fetchLiuWenJingFromDatabase", name: "刘文静", rarity: "uncommon" },
  { id: 1, moduleName: "li-yuan", fetchFnName: "fetchLiYuanFromDatabase", name: "李渊", rarity: "uncommon" },
  { id: 515, moduleName: "yuan-yan-shi", fetchFnName: "fetchYuanYanFromDatabase", name: "元延嗣", rarity: "uncommon" },
  { id: 515, moduleName: "yuan-yan", fetchFnName: "fetchYuanYanFromDatabase", name: "元岩", rarity: "rare" },
  { id: 655, moduleName: "li-yuan-ji", fetchFnName: "fetchLiYuanJiFromDatabase", name: "李元吉", rarity: "rare" },
  { id: 571, moduleName: "pei-ren-ji", fetchFnName: "fetchPeiRenJiFromDatabase", name: "裴仁基", rarity: "rare" },
  { id: 534, moduleName: "shen-guang", fetchFnName: "fetchShenGuangFromDatabase", name: "沈光", rarity: "rare" },
  { id: 601, moduleName: "dou-jian-de", fetchFnName: "fetchDouJianDeFromDatabase", name: "窦建德", rarity: "uncommon" },
  { id: 578, moduleName: "zhang-xu-tuo", fetchFnName: "fetchZhangXuTuoFromDatabase", name: "张须陀", rarity: "uncommon" },
  { id: 526, moduleName: "wang-shi-chong", fetchFnName: "fetchWangShiChongFromDatabase", name: "王世充", rarity: "uncommon" },
  { id: 70, moduleName: "su-wei", fetchFnName: "fetchSuWeiFromDatabase", name: "苏威", rarity: "uncommon" },
  { id: 512, moduleName: "yuwen-shu", fetchFnName: "fetchYuWenShuFromDatabase", name: "宇文述", rarity: "uncommon" },
  { id: 77, moduleName: "liu-shu", fetchFnName: "fetchLiuShuFromDatabase", name: "柳述", rarity: "uncommon" },
  { id: 535, moduleName: "lai-hu-er", fetchFnName: "fetchLaiHuErFromDatabase", name: "来护儿", rarity: "uncommon" },
  { id: 76, moduleName: "liu-ji", fetchFnName: "fetchLiuJiFromDatabase", name: "柳机", rarity: "common" },
  { id: 26, moduleName: "yuwen-hua-ji", fetchFnName: "fetchYuWenHuaJiFromDatabase", name: "宇文化及", rarity: "uncommon" },
  { id: 524, moduleName: "yuan-wen-jing", fetchFnName: "fetchYuanWenJingFromDatabase", name: "元文景", rarity: "uncommon" },

  // ★★ 白（6人）
  { id: 66, moduleName: "yang-wen-si", fetchFnName: "fetchYangWenSiFromDatabase", name: "杨文思", rarity: "common" },
  { id: 73, moduleName: "wei-yi", fetchFnName: "fetchWeiYiFromDatabase", name: "韦艺", rarity: "common" },
  { id: 577, moduleName: "feng-ci-ming", fetchFnName: "fetchFengDeYiFromDatabase", name: "封德彝", rarity: "common" },
  { id: 71, moduleName: "wei-shi-kang", fetchFnName: "fetchWeiShiKangFromDatabase", name: "韦世康", rarity: "common" },
  { id: 70, moduleName: "lu-yan-shi", fetchFnName: "fetchLuYanShiFromDatabase", name: "陆彦师", rarity: "common" },
  { id: 74, moduleName: "di-wu-qi", fetchFnName: "fetchDiXiaoWeiFromDatabase", name: "赵才", rarity: "common" },
  { id: 516, moduleName: "shang-guan-yi", fetchFnName: "fetchShangGuanYiFromDatabase", name: "上官仪", rarity: "common" },
];

// ============================================================
// 保底配置
// ============================================================

/** 10 抽内必出紫 */
export const GUARANTEE_PITY_PURPLE = 10;
/** 30 抽内必出金 */
export const GUARANTEE_PITY_GOLD = 30;

// ============================================================
// 招募概率（用于保底计算）
// ============================================================

/** 基础抽卡概率权重 */
export const RARITY_WEIGHT: Record<GeneralRarity, number> = {
  common: 60,
  uncommon: 30,
  rare: 9,
  legendary: 1,
};

const TOTAL_WEIGHT = Object.values(RARITY_WEIGHT).reduce((a, b) => a + b, 0);

/** 按权重随机抽取一个稀有度 */
export const pickRarity = (): GeneralRarity => {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHT)) {
    roll -= weight;
    if (roll <= 0) return rarity as GeneralRarity;
  }
  return "common";
};

/**
 * 按稀有度从 RECRUIT_CONFIG 中抽取一个武将
 * @param rarity 指定稀有度（不指定则按概率随机）
 */
export const pickGeneralByRarity = (rarity?: GeneralRarity): RecruitConfigItem | null => {
  const pool = rarity
    ? RECRUIT_CONFIG.filter((g) => g.rarity === rarity)
    : RECRUIT_CONFIG;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ============================================================
// 动态获取 fetch 函数
// ============================================================

export const getFetchFunctionBase = (id: number, API_BASE_URL: string): (() => Promise<import("./types").General | null>) | null => {
  const config = RECRUIT_CONFIG.find((item) => item.id === id);
  if (!config) return null;

  return () => import(`./${config.moduleName}`).then((m) => m[config.fetchFnName](API_BASE_URL));
};

// ============================================================
// 特殊武将（本地创建，用于敌方阵容）
// ============================================================

export const specialGenerals = {
  yuchiJiong: createYuchiJiong,
  qinQiong: createQinQiong,
  chengYaoJin: createChengYaoJin,
  yuchiJingde: createYuchiJingde,
  liYuanJi: createLiYuanJi,
  peiRenJi: createPeiRenJi,
  shenGuang: createShenGuang,
  laiHuEr: createLaiHuEr,
  zhangXuTuo: createZhangXuTuo,
  liuShu: createLiuShu,
  wangShiChong: createWangShiChong,
  douJianDe: createDouJianDe,
  suWei: createSuWei,
  yuanYanShi: createYuanYanShi,
  liuJi: createLiuJi,
  yuWenShu: createYuWenShu,
  luYanShi: createLuYanShi,
  weiShiKang: createWeiShiKang,
  fengDeYi: createFengDeYi,
  diXiaoWei: createDiXiaoWei,
  shangGuanYi: createShangGuanYi,
  yangWenSi: createYangWenSi,
  weiYi: createWeiYi,
  hanQinHu: createHanQinHu,
  yangJian: createYangJian,
  gaoJiong: createGaoJiong,
  yangSu: createYangSu,
  heRuoBi: createHeRuoBi,
  liJing: createLiJing,
  liShimin: createLiShimin,
  liuWenJing: createLiuWenJing,
  yuwenHuaJi: createYuWenHuaJi,
  liMi: createLiMi,
  shiWanSui: createShiWanSui,
  yuShiJi: createYuShiJi,
  liYuan: createLiYuan,
  yangGuang: createYangGuang,
  fangXuanLing: createFangXuanLing,
  duRuHui: createDuRuHui,
  yuChiGong: createYuChiGong,
  liDeLin: createLiDeLin,
  yuanYanYanshi: createYuanYanYanshi,
  yuJuLou: createYuJuLou,
  peiXingYan: createPeiXingYan,
  duHuChang: createDuHuChang,
  liuFang: createLiuFang,
  yuanWenJing: createYuanWenJing,
};

export const getSpecialGeneral = (name: string): import("./types").General | null => {
  const creator = specialGenerals[name as keyof typeof specialGenerals];
  return creator ? creator() : null;
};

export const getRandomSpecialGeneral = (): import("./types").General | null => {
  const keys = Object.keys(specialGenerals);
  if (keys.length === 0) return null;

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return getSpecialGeneral(randomKey);
};
