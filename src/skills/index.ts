import { createYuchiJiong } from "./yuchi-jiong";
import { createLuYanShi } from "./lu-yan-shi";
import { createWeiShiKang } from "./wei-shi-kang";
import { createFengCiMing } from "./feng-ci-ming";
import { createDiWuQi } from "./di-wu-qi";
import { createShangGuanYi } from "./shang-guan-yi";
import { createYangWenSi } from "./yang-wen-si";
import { createWeiYi } from "./wei-yi";
import { createHanQinHu } from "./han-qin-hu";
import { createYangJian } from "./yang-jian";
import { createGaoJiong } from "./gao-jiong";
import { createYangSu } from "./yang-su";
import { createHeRuoBi } from "./he-ruo-bi";
import { createLiJing } from "./li-jing";
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
import { createYuanYan } from "./yuan-yan-shi";

// 招募配置：添加新武将时只需在这里添加一项
export interface RecruitConfigItem {
  id: number;           // 数据库中的武将ID
  moduleName: string;   // 技能模块文件名（用于动态导入）
  fetchFnName: string;  // fetch函数名
  name: string;         // 武将显示名（注释用）
}

export const RECRUIT_CONFIG: RecruitConfigItem[] = [
  { id: 633, moduleName: "yuchi-jiong", fetchFnName: "fetchYuchiJiongFromDatabase", name: "尉迟迥" },
  { id: 69, moduleName: "li-de-lin", fetchFnName: "fetchLiDeLinFromDatabase", name: "李德林" },
  { id: 71, moduleName: "wei-shi-kang", fetchFnName: "fetchWeiShiKangFromDatabase", name: "韦世康" },
  { id: 70, moduleName: "lu-yan-shi", fetchFnName: "fetchLuYanShiFromDatabase", name: "陆彦师" },
  { id: 515, moduleName: "yuan-yan-shi", fetchFnName: "fetchYuanYanFromDatabase", name: "元岩" },
  { id: 577, moduleName: "feng-ci-ming", fetchFnName: "fetchFengCiMingFromDatabase", name: "冯慈明" },
  { id: 739, moduleName: "di-wu-qi", fetchFnName: "fetchDiWuQiFromDatabase", name: "第五琦" },
  { id: 707, moduleName: "shang-guan-yi", fetchFnName: "fetchShangGuanYiFromDatabase", name: "上官仪" },
  { id: 66, moduleName: "yang-wen-si", fetchFnName: "fetchYangWenSiFromDatabase", name: "杨文思" },
  { id: 73, moduleName: "wei-yi", fetchFnName: "fetchWeiYiFromDatabase", name: "韦艺" },
  { id: 43, moduleName: "han-qin-hu", fetchFnName: "fetchHanQinHuFromDatabase", name: "韩擒虎" },
  { id: 4, moduleName: "yu-chi-gong", fetchFnName: "fetchYuChiGongFromDatabase", name: "尉迟恭" },
  { id: 27, moduleName: "fang-xuan-ling", fetchFnName: "fetchFangXuanLingFromDatabase", name: "房玄龄" },
  { id: 28, moduleName: "du-ru-hui", fetchFnName: "fetchDuRuHuiFromDatabase", name: "杜如晦" },
  { id: 21, moduleName: "yang-jian", fetchFnName: "fetchYangJianFromDatabase", name: "杨坚" },
  { id: 22, moduleName: "yang-guang", fetchFnName: "fetchYangGuangFromDatabase", name: "杨广" },
  { id: 24, moduleName: "gao-jiong", fetchFnName: "fetchGaoJiongFromDatabase", name: "高颎" },
  { id: 25, moduleName: "yang-su", fetchFnName: "fetchYangSuFromDatabase", name: "杨素" },
  { id: 44, moduleName: "he-ruo-bi", fetchFnName: "fetchHeRuoBiFromDatabase", name: "贺若弼" },
  { id: 29, moduleName: "li-jing", fetchFnName: "fetchLiJingFromDatabase", name: "李靖" },
  { id: 20, moduleName: "liu-wen-jing", fetchFnName: "fetchLiuWenJingFromDatabase", name: "刘文静" },
  { id: 26, moduleName: "yuwen-hua-ji", fetchFnName: "fetchYuWenHuaJiFromDatabase", name: "宇文化及" },
  { id: 570, moduleName: "li-mi", fetchFnName: "fetchLiMiFromDatabase", name: "李密" },
  { id: 42, moduleName: "shi-wan-sui", fetchFnName: "fetchShiWanSuiFromDatabase", name: "史万岁" },
  { id: 561, moduleName: "yu-shi-ji", fetchFnName: "fetchYuShiJiFromDatabase", name: "虞世基" },
  { id: 1, moduleName: "li-yuan", fetchFnName: "fetchLiYuanFromDatabase", name: "李渊" },
];

// 计算平均概率
export const getRecruitProbabilities = (): Map<number, number> => {
  const prob = 1 / RECRUIT_CONFIG.length;
  const map = new Map<number, number>();
  RECRUIT_CONFIG.forEach(item => {
    map.set(item.id, Math.round(prob * 1000) / 1000);
  });
  return map;
};

// 动态获取 fetch 函数
export const getFetchFunction = (id: number, API_BASE_URL: string): (() => Promise<import("./types").General | null>) | null => {
  const config = RECRUIT_CONFIG.find(item => item.id === id);
  if (!config) return null;

  return () => import(`./${config.moduleName}`).then(m => m[config.fetchFnName](API_BASE_URL));
};

// 所有可招募的特殊武将（用于本地创建）
export const specialGenerals = {
  yuchiJiong: createYuchiJiong,
  luYanShi: createLuYanShi,
  weiShiKang: createWeiShiKang,
  fengCiMing: createFengCiMing,
  diWuQi: createDiWuQi,
  shangGuanYi: createShangGuanYi,
  yangWenSi: createYangWenSi,
  weiYi: createWeiYi,
  hanQinHu: createHanQinHu,
  yangJian: createYangJian,
  gaoJiong: createGaoJiong,
  yangSu: createYangSu,
  heRuoBi: createHeRuoBi,
  liJing: createLiJing,
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
  yuanYan: createYuanYan,
};

// 获取特殊武将
export const getSpecialGeneral = (name: string): import("./types").General | null => {
  const creator = specialGenerals[name as keyof typeof specialGenerals];
  return creator ? creator() : null;
};

// 随机获取一个特殊武将（用于招募）
export const getRandomSpecialGeneral = (): import("./types").General | null => {
  const keys = Object.keys(specialGenerals);
  if (keys.length === 0) return null;

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return getSpecialGeneral(randomKey);
};
