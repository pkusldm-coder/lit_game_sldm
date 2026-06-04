import type { LevelData } from './types'

const CAO_CAO = { id: 0, name: '曹操', w: 2, h: 2 }
const GUAN_YU = { id: 1, name: '关羽', w: 2, h: 1 }
const ZHANG_FEI = { id: 2, name: '张飞', w: 1, h: 2 }
const ZHAO_YUN = { id: 3, name: '赵云', w: 1, h: 2 }
const MA_CHAO = { id: 4, name: '马超', w: 1, h: 2 }
const HUANG_ZHONG = { id: 5, name: '黄忠', w: 1, h: 2 }
const SOLDIER = { id: 6, name: '兵', w: 1, h: 1 }
const SOLDIER2 = { id: 7, name: '兵', w: 1, h: 1 }
const SOLDIER3 = { id: 8, name: '兵', w: 1, h: 1 }
const SOLDIER4 = { id: 9, name: '兵', w: 1, h: 1 }

// [row, col] for each block in order
export const LEVELS: LevelData[] = [
  {
    name: '横刀立马',
    moves: 54,
    blocks: [CAO_CAO, GUAN_YU, ZHANG_FEI, ZHAO_YUN, MA_CHAO, HUANG_ZHONG, SOLDIER, SOLDIER2, SOLDIER3, SOLDIER4],
    init: [
      [0, 1], // 曹操
      [2, 1], // 关羽
      [0, 0], // 张飞
      [0, 3], // 赵云
      [2, 0], // 马超
      [2, 3], // 黄忠
      [3, 0], // 兵
      [3, 1], // 兵
      [3, 2], // 兵
      [3, 3], // 兵
    ],
  },
  {
    name: '兵临城下',
    moves: 65,
    blocks: [CAO_CAO, GUAN_YU, ZHANG_FEI, ZHAO_YUN, MA_CHAO, HUANG_ZHONG, SOLDIER, SOLDIER2, SOLDIER3, SOLDIER4],
    init: [
      [0, 1],
      [2, 1],
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 3],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
    ],
  },
  {
    name: '将挡',
    moves: 40,
    blocks: [CAO_CAO, GUAN_YU, ZHANG_FEI, ZHAO_YUN, MA_CHAO, HUANG_ZHONG, SOLDIER, SOLDIER2, SOLDIER3, SOLDIER4],
    init: [
      [0, 1],
      [2, 1],
      [1, 0],
      [1, 3],
      [2, 0],
      [2, 3],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
    ],
  },
  {
    name: '水泄不通',
    moves: 48,
    blocks: [CAO_CAO, GUAN_YU, ZHANG_FEI, ZHAO_YUN, MA_CHAO, HUANG_ZHONG, SOLDIER, SOLDIER2, SOLDIER3, SOLDIER4],
    init: [
      [0, 1],
      [2, 1],
      [0, 0],
      [0, 3],
      [2, 0],
      [2, 3],
      [1, 1],
      [1, 2],
      [3, 1],
      [3, 2],
    ],
  },
  {
    name: '层层设防',
    moves: 55,
    blocks: [CAO_CAO, GUAN_YU, ZHANG_FEI, ZHAO_YUN, MA_CHAO, HUANG_ZHONG, SOLDIER, SOLDIER2, SOLDIER3, SOLDIER4],
    init: [
      [0, 1],
      [2, 1],
      [1, 0],
      [1, 3],
      [0, 0],
      [0, 3],
      [2, 0],
      [2, 3],
      [3, 1],
      [3, 2],
    ],
  },
  {
    name: '兵来将挡',
    moves: 60,
    blocks: [CAO_CAO, GUAN_YU, ZHANG_FEI, ZHAO_YUN, MA_CHAO, HUANG_ZHONG, SOLDIER, SOLDIER2, SOLDIER3, SOLDIER4],
    init: [
      [0, 1],
      [2, 1],
      [0, 0],
      [0, 3],
      [1, 0],
      [1, 3],
      [2, 0],
      [2, 3],
      [3, 1],
      [3, 2],
    ],
  },
  {
    name: '四面楚歌',
    moves: 70,
    blocks: [CAO_CAO, GUAN_YU, ZHANG_FEI, ZHAO_YUN, MA_CHAO, HUANG_ZHONG, SOLDIER, SOLDIER2, SOLDIER3, SOLDIER4],
    init: [
      [0, 1],
      [2, 1],
      [1, 0],
      [1, 3],
      [2, 0],
      [2, 3],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
    ],
  },
]

export function getTotalLevels(): number {
  return LEVELS.length
}
