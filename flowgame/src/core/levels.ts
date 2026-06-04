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
]

function mk(id: number, r1: number, c1: number, r2: number, c2: number): ColorDef {
  return { id, color: COLORS[id].color, start: { row: r1, col: c1 }, end: { row: r2, col: c2 } }
}

export const LEVELS: LevelData[] = [
  {
    name: '入门',
    gridSize: 4,
    colors: [
      mk(0, 0, 2, 3, 3),
      mk(1, 0, 1, 3, 0),
      mk(2, 1, 1, 3, 2),
    ],
  },
  {
    name: '进阶',
    gridSize: 5,
    colors: [
      mk(0, 0, 4, 4, 0),
      mk(1, 1, 4, 4, 1),
      mk(2, 1, 3, 3, 1),
    ],
  },
  {
    name: '挑战',
    gridSize: 5,
    colors: [
      mk(0, 2, 2, 4, 4),
      mk(1, 0, 2, 3, 0),
      mk(2, 0, 3, 3, 4),
      mk(3, 3, 1, 4, 0),
    ],
  },
  {
    name: '困难',
    gridSize: 5,
    colors: [
      mk(0, 3, 3, 4, 4),
      mk(1, 4, 0, 4, 3),
      mk(2, 0, 3, 2, 4),
      mk(3, 1, 2, 3, 0),
      mk(4, 0, 2, 2, 0),
    ],
  },
  {
    name: '专家',
    gridSize: 6,
    colors: [
      mk(0, 0, 4, 5, 5),
      mk(1, 0, 3, 2, 4),
      mk(2, 0, 1, 5, 0),
      mk(3, 3, 1, 5, 2),
      mk(4, 0, 2, 2, 1),
      mk(5, 3, 3, 5, 4),
    ],
  },
  {
    name: '迷宫',
    gridSize: 5,
    colors: [
      mk(0, 0, 0, 4, 1),
      mk(1, 0, 4, 4, 2),
      mk(2, 2, 3, 4, 4),
    ],
  },
  {
    name: '缠绕',
    gridSize: 5,
    colors: [
      mk(0, 2, 0, 4, 2),
      mk(1, 0, 0, 1, 2),
      mk(2, 0, 3, 4, 4),
    ],
  },
  {
    name: '交织',
    gridSize: 5,
    colors: [
      mk(0, 0, 4, 4, 3),
      mk(1, 2, 2, 3, 0),
      mk(2, 3, 2, 4, 0),
      mk(3, 0, 0, 1, 3),
    ],
  },
  {
    name: '回旋',
    gridSize: 5,
    colors: [
      mk(0, 2, 2, 4, 4),
      mk(1, 2, 0, 4, 1),
      mk(2, 0, 0, 1, 2),
      mk(3, 0, 3, 2, 4),
    ],
  },
  {
    name: '旋风',
    gridSize: 5,
    colors: [
      mk(0, 1, 4, 3, 2),
      mk(1, 2, 0, 4, 2),
      mk(2, 0, 0, 1, 2),
      mk(3, 0, 4, 1, 3),
    ],
  },
  {
    name: '深海',
    gridSize: 6,
    colors: [
      mk(0, 0, 1, 5, 0),
      mk(1, 0, 4, 2, 5),
      mk(2, 2, 4, 3, 5),
      mk(3, 0, 2, 1, 4),
      mk(4, 4, 5, 5, 1),
    ],
  },
  {
    name: '漩涡',
    gridSize: 6,
    colors: [
      mk(0, 2, 0, 5, 4),
      mk(1, 1, 4, 5, 5),
      mk(2, 2, 1, 4, 4),
      mk(3, 0, 4, 0, 5),
      mk(4, 0, 0, 2, 3),
    ],
  },
  {
    name: '星空',
    gridSize: 6,
    colors: [
      mk(0, 3, 0, 5, 1),
      mk(1, 0, 1, 2, 0),
      mk(2, 3, 2, 5, 5),
      mk(3, 0, 2, 1, 5),
      mk(4, 1, 2, 2, 5),
    ],
  },
  {
    name: '极光',
    gridSize: 6,
    colors: [
      mk(0, 0, 4, 5, 5),
      mk(1, 0, 3, 2, 4),
      mk(2, 0, 1, 5, 0),
      mk(3, 3, 1, 5, 2),
      mk(4, 0, 2, 2, 1),
      mk(5, 3, 3, 5, 4),
    ],
  },
  {
    name: '终极',
    gridSize: 7,
    colors: [
      mk(0, 0, 0, 0, 6),
      mk(1, 1, 0, 3, 3),
      mk(2, 5, 2, 6, 0),
      mk(3, 2, 3, 4, 6),
      mk(4, 4, 3, 5, 6),
      mk(5, 6, 2, 6, 6),
    ],
  },
]

export function getTotalLevels(): number {
  return LEVELS.length
}
