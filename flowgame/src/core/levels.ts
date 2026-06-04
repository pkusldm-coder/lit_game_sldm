import type { ColorDef } from './types'

export interface LevelData {
  name: string
  gridSize: number
  colors: ColorDef[]
}

const COLORS = [
  { id: 0, color: '#e74c3c' },
  { id: 1, color: '#3498db' },
  { id: 2, color: '#2ecc71' },
  { id: 3, color: '#f39c12' },
  { id: 4, color: '#9b59b6' },
  { id: 5, color: '#1abc9c' },
  { id: 6, color: '#e67e22' },
  { id: 7, color: '#e91e63' },
]

function mk(id: number, r1: number, c1: number, r2: number, c2: number): ColorDef {
  return { id, color: COLORS[id].color, start: { row: r1, col: c1 }, end: { row: r2, col: c2 } }
}

export const LEVELS: LevelData[] = [
  {
    name: '入门',
    gridSize: 4,
    colors: [
      mk(0, 0, 0, 3, 0),
      mk(1, 0, 1, 3, 1),
      mk(2, 0, 2, 3, 2),
      mk(3, 0, 3, 3, 3),
    ],
  },
  {
    name: '进阶',
    gridSize: 5,
    colors: [
      mk(0, 0, 0, 4, 0),
      mk(1, 0, 1, 4, 1),
      mk(2, 0, 2, 4, 2),
      mk(3, 0, 3, 4, 3),
      mk(4, 0, 4, 4, 4),
    ],
  },
  {
    name: '挑战',
    gridSize: 5,
    colors: [
      mk(0, 0, 0, 4, 0),
      mk(1, 0, 4, 4, 4),
      mk(2, 0, 1, 4, 2),
      mk(3, 0, 3, 4, 3),
    ],
  },
  {
    name: '困难',
    gridSize: 6,
    colors: [
      mk(0, 0, 0, 5, 0),
      mk(1, 0, 1, 5, 1),
      mk(2, 0, 2, 5, 2),
      mk(3, 0, 3, 5, 3),
      mk(4, 0, 4, 5, 4),
      mk(5, 0, 5, 5, 5),
    ],
  },
  {
    name: '专家',
    gridSize: 7,
    colors: [
      mk(0, 0, 0, 6, 0),
      mk(1, 0, 1, 6, 1),
      mk(2, 0, 2, 6, 2),
      mk(3, 0, 3, 6, 3),
      mk(4, 0, 4, 6, 4),
      mk(5, 0, 5, 6, 5),
      mk(6, 0, 6, 6, 6),
    ],
  },
]

export function getTotalLevels(): number {
  return LEVELS.length
}
