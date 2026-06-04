import type { Block, Direction } from './types'

const ROWS = 4
const COLS = 5

function occupancy(blocks: Block[]): boolean[][] {
  const grid: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  for (const b of blocks) {
    for (let r = b.row; r < b.row + b.h; r++) {
      for (let c = b.col; c < b.col + b.w; c++) {
        grid[r][c] = true
      }
    }
  }
  return grid
}

export function canMove(blocks: Block[], idx: number, dir: Direction): boolean {
  const b = blocks[idx]
  const occ = occupancy(blocks.map((bl, i) => i === idx ? { ...bl, row: 0, col: 0 } : bl))

  let nr = b.row
  let nc = b.col

  switch (dir) {
    case 'up': nr -= 1; break
    case 'down': nr += 1; break
    case 'left': nc -= 1; break
    case 'right': nc += 1; break
  }

  if (nr < 0 || nc < 0 || nr + b.h > ROWS || nc + b.w > COLS) return false

  occ[b.row][b.col] = false

  for (let r = nr; r < nr + b.h; r++) {
    for (let c = nc; c < nc + b.w; c++) {
      if (occ[r][c]) return false
    }
  }

  return true
}

export function moveBlock(blocks: Block[], idx: number, dir: Direction): Block[] {
  const b = blocks[idx]
  const nr = dir === 'up' ? b.row - 1 : dir === 'down' ? b.row + 1 : b.row
  const nc = dir === 'left' ? b.col - 1 : dir === 'right' ? b.col + 1 : b.col
  return blocks.map((bl, i) => i === idx ? { ...bl, row: nr, col: nc } : { ...bl })
}

export function checkWin(blocks: Block[]): boolean {
  const caoCao = blocks[0]
  return caoCao.row === 2 && caoCao.col === 1
}

export function canMoveAny(blocks: Block[], idx: number): Direction[] {
  const dirs: Direction[] = ['up', 'down', 'left', 'right']
  return dirs.filter(d => canMove(blocks, idx, d))
}
