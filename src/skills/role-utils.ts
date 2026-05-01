import type { General, GeneralRole } from "./types";

/**
 * 根据技能描述和属性自动判断武将定位（可能返回多个）
 */
export function detectRole(general: General): GeneralRole[] {
  const skillDescriptions = general.skills?.map(s => s.description).join("") || "";
  const text = skillDescriptions.toLowerCase();
  const roles: GeneralRole[] = [];

  // 治疗：治疗、回复、兵力回复
  if (text.includes("治疗") || text.includes("回复") || text.includes("兵力回复") || text.includes("恢复兵力")) {
    roles.push("治疗");
  }

  // 控制：怯战、沉默、减速、眩晕、麻痹、混乱、无法行动
  if (text.includes("怯战") || text.includes("沉默") || text.includes("减速") || text.includes("眩晕") ||
      text.includes("麻痹") || text.includes("混乱") || text.includes("无法行动") || text.includes("禁足")) {
    roles.push("控制");
  }

  // 肉盾：高防御、低攻击、被动技能防御加成、每损失兵力
  if (text.includes("每损失") || text.includes("防御+") || text.includes("减伤")) {
    roles.push("肉盾");
  } else if (text.includes("防御") || text.includes("减伤") || text.includes("护盾")) {
    if (general.defense > general.attack) {
      roles.push("肉盾");
    }
  }

  // 辅助：指挥、驱散、我方全体、每回合使敌方
  if (text.includes("指挥") || text.includes("驱散") || text.includes("我方全体") ||
      (text.includes("使敌方") && !text.includes("伤害"))) {
    if (general.strategy > general.attack) {
      roles.push("辅助");
    } else {
      roles.push("辅助");
    }
  }

  // 输出：高攻击、技能伤害加成、追击、连击
  if (text.includes("追击") || text.includes("连击") || text.includes("追加伤害") ||
      text.includes("攻击+") || general.attack > general.defense) {
    roles.push("输出");
  }

  // 默认：输出（如果无法判断，按攻击型处理）
  if (roles.length === 0) {
    roles.push("输出");
  }

  return roles;
}

/**
 * 获取武将的定位标签
 */
export function getGeneralRole(general: General): GeneralRole[] {
  return general.role ? [general.role] : detectRole(general);
}