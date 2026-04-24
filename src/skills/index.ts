import { createYuchiJiong } from "./yuchi-jiong";
import type { General, Skill } from "./types";

// 所有可招募的特殊武将
export const specialGenerals = {
  yuchiJiong: createYuchiJiong,
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
