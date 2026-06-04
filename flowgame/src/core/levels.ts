import type { ColorDef } from './types'

export interface LevelData {
  name: string
  gridSize: number
  colors: ColorDef[]
}

const COLORS = [
  { id: 0, color: '#e74c3c' }, // red
  { id: 1, color: '#3498db' }, // blue
  { id: 2, color: '#2ecc71' }, // green
  { id: 3, color: '#f39c12' }, // yellow
  { id: 4, color: '#9b59b6' }, // purple
  { id: 5, color: '#1abc9c' }, // teal
  { id: 6, color: '#e67e22' }, // orange
  { id: 7, color: '#e91e63' }, // pink
  { id: 8, color: '#00bcd4' }, // cyan
  { id: 9, color: '#ff5722' }, // deep orange
]

function mk(id: number, r1: number, c1: number, r2: number, c2: number): ColorDef {
  return { id, color: COLORS[id].color, start: { row: r1, col: c1 }, end: { row: r2, col: c2 } }
}

export const LEVELS: LevelData[] = [
  {
    name: '入门',
    gridSize: 5,
    colors: [
      mk(0, 0, 0, 4, 0),
      mk(1, 0, 4, 4, 4),
      mk(2, 2, 2, 2, 3),
    ],
  },
  {
    name: '进阶',
    gridSize: 5,
    colors: [
      mk(0, 0, 0, 0, 4),
      mk(1, 4, 0, 4, 4),
      mk(2, 0, 2, 2, 4),
      mk(3, 2, 0, 4, 2),
    ],
  },
  {
    name: '挑战',
    gridSize: 6,
    colors: [
      mk(0, 0, 0, 5, 0),
      mk(1, 0, 5, 5, 5),
      mk(2, 0, 2, 2, 5),
      mk(3, 2, 0, 5, 2),
      mk(4, 3, 3, 3, 4),
    ],
  },
  {
    name: '困难',
    gridSize: 6,
    colors: [
      mk(0, 0, 0, 0, 5),
      mk(1, 5, 0, 5, 5),
      mk(2, 0, 2, 3, 5),
      mk(3, 2, 0, 5, 2),
      mk(4, 1, 3, 4, 3),
      mk(5, 3, 1, 3, 4),
    ],
  },
  {
    name: '专家',
    gridSize: 7,
    colors: [
      mk(0, 0, 0, 6, 0),
      mk(1, 0, 6, 6, 6),
      mk(2, 0, 3, 3, 6),
      mk(3, 3, 0, 6, 3),
      mk(4, 1, 1, 5, 5),
      mk(5, 1, 5, 5, 1),
      mk(6, 3, 3, 3, 4),
    ],
  },
]

export function getTotalLevels(): number {
  return LEVELS.length
}
