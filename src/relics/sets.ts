import type { RelicSet, Relic } from "./types";

export const RELIC_SETS: RelicSet[] = [
  {
    id: "zhenguan",
    name: "贞观系列",
    books: ["六韬", "三略", "李卫公问对", "阴陵令"],
    description: "武备与攻战 — 涵盖先秦至唐初兵学之精要，太宗'以武定天下'之雄图。",
    pieces: [
      {
        pieces: 2,
        description: "全队攻击+18%，追击概率+20%",
      },
      {
        pieces: 4,
        description: "全队普攻后50%概率追加100%伤害，击杀后重置普攻冷却",
      },
    ],
  },
  {
    id: "kaiyuan",
    name: "开元系列",
    books: ["贞观政要", "帝范", "臣轨", "新唐书"],
    description: "谋略与控制 — 横跨三百年，以'谋略'二字贯穿始终，谋国、谋君、谋臣、谋史。",
    pieces: [
      {
        pieces: 2,
        description: "全队谋略+18%，敌方全体策防-15%全场，策略伤害+15%",
      },
      {
        pieces: 4,
        description: "策略攻击有35%概率使目标沉默1回合；灼烧叠加上限+1层",
      },
    ],
  },
  {
    id: "dianmo",
    name: "典谟系列",
    books: ["旧唐书", "资治通鉴", "史通", "艺文类聚"],
    description: "史学与文献 — 中国史学四大门类：以史为鉴，涵盖正史、通鉴、史学理论、文献汇编。",
    pieces: [
      {
        pieces: 2,
        description: "全队物理减伤+15%，策略减伤+15%，每回合恢复2%兵力",
      },
      {
        pieces: 4,
        description: "全队免疫控制效果（怯战/震慑/沉默）；战斗结束时全队恢复12%兵力",
      },
    ],
  },
  {
    id: "wude",
    name: "武德系列",
    books: ["秦王破阵乐", "太极拳谱", "少林武僧记", "裴氏兵法"],
    description: "天下武功 — 从战阵之舞、内家之法、外家之功、奇兵之略四个维度，构成唐人尚武之完整图景。",
    pieces: [
      {
        pieces: 2,
        description: "全队速度+20%，先手概率+20%，连击概率+15%",
      },
      {
        pieces: 4,
        description: "全队追击触发后35%概率追加一次连击；击杀目标后全队获得1回合25%增伤",
      },
    ],
  },
];

/**
 * 根据套装ID获取套装定义
 */
export function getSetById(setId: string): RelicSet | null {
  return RELIC_SETS.find((s) => s.id === setId) ?? null;
}

/**
 * 统计持有某套装部件的数量
 */
export function countSetPieces(ownedRelics: Relic[], setId: string): number {
  return ownedRelics.filter((r) => r.setId === setId).length;
}

/**
 * 获取套装当前激活的奖励（如果有）
 */
export function getActiveSetBonus(
  ownedRelics: Relic[],
  setId: string
): { pieces: number; bonus: string } | null {
  const count = countSetPieces(ownedRelics, setId);
  if (count < 2) return null;

  const set = getSetById(setId);
  if (!set) return null;

  if (count >= 4 && set.pieces.length >= 2) {
    return { pieces: 4, bonus: set.pieces[1].description };
  }
  return { pieces: 2, bonus: set.pieces[0].description };
}

/**
 * 获取所有已激活的套装效果
 */
export function getAllActiveSetBonuses(
  ownedRelics: Relic[]
): Array<{ set: RelicSet; pieces: number; bonus: string }> {
  const result: Array<{ set: RelicSet; pieces: number; bonus: string }> = [];

  for (const set of RELIC_SETS) {
    const active = getActiveSetBonus(ownedRelics, set.id);
    if (active) {
      result.push({ set, ...active });
    }
  }

  return result;
}

/**
 * 获取套装进度
 */
export function getSetProgress(
  ownedRelics: Relic[],
  setId: string
): { current: number; target: number; books: string[] } {
  const set = getSetById(setId);
  const current = countSetPieces(ownedRelics, setId);
  return {
    current,
    target: 4,
    books: set?.books ?? [],
  };
}
