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
import type { General } from "./types";

// 所有可招募的特殊武将
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
};

// 获取特殊武将
export const getSpecialGeneral = (name: string): General | null => {
  const creator = specialGenerals[name as keyof typeof specialGenerals];
  return creator ? creator() : null;
};

// 随机获取一个特殊武将（用于招募）
export const getRandomSpecialGeneral = (): General | null => {
  const keys = Object.keys(specialGenerals);
  if (keys.length === 0) return null;
  
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return getSpecialGeneral(randomKey);
};
