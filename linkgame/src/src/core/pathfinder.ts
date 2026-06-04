import type { Board, Point, Path } from './types'

function isClear(board: Board, r: number, c: number): boolean {
  return r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] === null
}

function lineClear(board: Board, r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return true
  if (r1 === r2) {
    const minC = Math.min(c1, c2)
    const maxC = Math.max(c1, c2)
    for (let c = minC + 1; c < maxC; c++) {
      if (!isClear(board, r1, c)) return false
    }
    return true
  }
  if (c1 === c2) {
    const minR = Math.min(r1, r2)
    const maxR = Math.max(r1, r2)
    for (let r = minR + 1; r < maxR; r++) {
      if (!isClear(board, r, c1)) return false
    }
    return true
  }
  return false
}

function directConnect(board: Board, r1: number, c1: number, r2: number, c2: number): Path | null {
  if (lineClear(board, r1, c1, r2, c2)) {
    return [{ row: r1, col: c1 }, { row: r2, col: c2 }]
  }
  return null
}

function oneTurnConnect(board: Board, r1: number, c1: number, r2: number, c2: number): Path | null {
  const corner1 = { row: r1, col: c2 }
  if (isClear(board, corner1.row, corner1.col) &&
      lineClear(board, r1, c1, corner1.row, corner1.col) &&
      lineClear(board, corner1.row, corner1.col, r2, c2)) {
    return [
      { row: r1, col: c1 },
      corner1,
      { row: r2, col: c2 },
    ]
  }
  const corner2 = { row: r2, col: c1 }
  if (isClear(board, corner2.row, corner2.col) &&
      lineClear(board, r1, c1, corner2.row, corner2.col) &&
      lineClear(board, corner2.row, corner2.col, r2, c2)) {
    return [
      { row: r1, col: c1 },
      corner2,
      { row: r2, col: c2 },
    ]
  }
  return null
}

function twoTurnConnect(board: Board, r1: number, c1: number, r2: number, c2: number): Path | null {
  const rows = board.length
  const cols = board[0].length

  for (let c = -1; c <= cols; c++) {
    if (c === c1 || c === c2) continue
    const mid1 = { row: r1, col: c }
    const mid2 = { row: r2, col: c }
    if (isClear(board, mid1.row, mid1.col) &&
        isClear(board, mid2.row, mid2.col) &&
        lineClear(board, r1, c1, mid1.row, mid1.col) &&
        lineClear(board, mid1.row, mid1.col, mid2.row, mid2.col) &&
        lineClear(board, mid2.row, mid2.col, r2, c2)) {
      return [
        { row: r1, col: c1 },
        mid1,
        mid2,
        { row: r2, col: c2 },
      ]
    }
  }

  for (let r = -1; r <= rows; r++) {
    if (r === r1 || r === r2) continue
    const mid1 = { row: r, col: c1 }
    const mid2 = { row: r, col: c2 }
    if (isClear(board, mid1.row, mid1.col) &&
        isClear(board, mid2.row, mid2.col) &&
        lineClear(board, r1, c1, mid1.row, mid1.col) &&
        lineClear(board, mid1.row, mid1.col, mid2.row, mid2.col) &&
        lineClear(board, mid2.row, mid2.col, r2, c2)) {
      return [
        { row: r1, col: c1 },
        mid1,
        mid2,
        { row: r2, col: c2 },
      ]
    }
  }

  return null
}

export function findPath(board: Board, r1: number, c1: number, r2: number, c2: number): Path | null {
  if (r1 === r2 && c1 === c2) return null

  let path = directConnect(board, r1, c1, r2, c2)
  if (path) return path

  path = oneTurnConnect(board, r1, c1, r2, c2)
  if (path) return path

  path = twoTurnConnect(board, r1, c1, r2, c2)
  if (path) return path

  return null
}

export function findAnyMove(board: Board): [Point, Point, Path] | null {
  const rows = board.length
  const cols = board[0].length
  const tiles: Point[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== null) {
        tiles.push({ row: r, col: c })
      }
    }
  }
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const a = tiles[i]
      const b = tiles[j]
      const ta = board[a.row][a.col]
      const tb = board[b.row][b.col]
      if (ta && tb && ta.type === tb.type) {
        const path = findPath(board, a.row, a.col, b.row, b.col)
        if (path) return [a, b, path]
      }
    }
  }
  return null
}
