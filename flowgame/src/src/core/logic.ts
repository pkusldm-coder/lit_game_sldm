import type { Board, Cell, ColorDef } from './types'

export function createBoard(gridSize: number, colors: ColorDef[]): Board {
  const board: Board = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({ colorId: null, isEndpoint: false }))
  )
  for (const c of colors) {
    board[c.start.row][c.start.col] = { colorId: c.id, isEndpoint: true }
    board[c.end.row][c.end.col] = { colorId: c.id, isEndpoint: true }
  }
  return board
}

function isAdjacent(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a.row - b.row)
  const dc = Math.abs(a.col - b.col)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

export function canExtend(board: Board, from: Cell, to: Cell, colorId: number): boolean {
  const { row, col } = to
  const size = board.length
  if (row < 0 || row >= size || col < 0 || col >= size) return false
  if (!isAdjacent(from, to)) return false

  const target = board[row][col]
  if (target.colorId !== null && target.colorId !== colorId) return false
  if (target.colorId === colorId && !target.isEndpoint) return false

  return true
}

export function extendPath(board: Board, _from: Cell, to: Cell, colorId: number): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  newBoard[to.row][to.col] = { colorId, isEndpoint: false }
  return newBoard
}

export function clearPath(board: Board, path: Cell[], colorId: number): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  for (const cell of path) {
    const { row, col } = cell
    if (newBoard[row][col].colorId === colorId && !newBoard[row][col].isEndpoint) {
      newBoard[row][col] = { colorId: null, isEndpoint: false }
    }
  }
  return newBoard
}

export function checkWin(board: Board, colors: ColorDef[]): boolean {
  const size = board.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c].colorId === null) return false
    }
  }

  for (const color of colors) {
    if (!areConnected(board, color.start, color.end, color.id)) return false
  }
  return true
}

function areConnected(board: Board, start: Cell, end: Cell, colorId: number): boolean {
  const size = board.length
  const visited = Array.from({ length: size }, () => Array(size).fill(false))
  const queue: Cell[] = [start]
  visited[start.row][start.col] = true

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.row === end.row && current.col === end.col) return true

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (const [dr, dc] of dirs) {
      const nr = current.row + dr
      const nc = current.col + dc
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
        if (board[nr][nc].colorId === colorId) {
          visited[nr][nc] = true
          queue.push({ row: nr, col: nc })
        }
      }
    }
  }
  return false
}
