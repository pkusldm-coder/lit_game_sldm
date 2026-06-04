import type { CellState } from './types'

export function computeClues(solution: number[][]): { rowClues: number[][]; colClues: number[][] } {
  const size = solution.length
  const rowClues: number[][] = []
  const colClues: number[][] = []

  for (let r = 0; r < size; r++) {
    const clues: number[] = []
    let count = 0
    for (let c = 0; c < size; c++) {
      if (solution[r][c] === 1) {
        count++
      } else {
        if (count > 0) clues.push(count)
        count = 0
      }
    }
    if (count > 0) clues.push(count)
    if (clues.length === 0) clues.push(0)
    rowClues.push(clues)
  }

  for (let c = 0; c < size; c++) {
    const clues: number[] = []
    let count = 0
    for (let r = 0; r < size; r++) {
      if (solution[r][c] === 1) {
        count++
      } else {
        if (count > 0) clues.push(count)
        count = 0
      }
    }
    if (count > 0) clues.push(count)
    if (clues.length === 0) clues.push(0)
    colClues.push(clues)
  }

  return { rowClues, colClues }
}

export function createEmptyBoard(size: number): CellState[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 'empty' as CellState)
  )
}

export function checkWin(board: CellState[][], solution: number[][]): boolean {
  const size = board.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const shouldBeFilled = solution[r][c] === 1
      const isFilled = board[r][c] === 'filled'
      if (shouldBeFilled !== isFilled) return false
    }
  }
  return true
}
