import type { Board } from './types'

export interface MatchGroup {
  cells: [number, number][]
  length: number
}

export interface MatchResult {
  groups: MatchGroup[]
  allCells: [number, number][]
  score: number
}

function horizontalRuns(board: Board, rows: number, cols: number): MatchGroup[] {
  const out: MatchGroup[] = []
  for (let r = 0; r < rows; r++) {
    let s = 0
    for (let c = 1; c <= cols; c++) {
      if (c < cols && board[r][c] && board[r][s] && board[r][c]!.type === board[r][s]!.type) continue
      if (c - s >= 3) {
        const cells: [number, number][] = []
        for (let i = s; i < c; i++) cells.push([r, i])
        out.push({ cells, length: c - s })
      }
      s = c
    }
  }
  return out
}

function verticalRuns(board: Board, rows: number, cols: number): MatchGroup[] {
  const out: MatchGroup[] = []
  for (let c = 0; c < cols; c++) {
    let s = 0
    for (let r = 1; r <= rows; r++) {
      if (r < rows && board[r][c] && board[s][c] && board[r][c]!.type === board[s][c]!.type) continue
      if (r - s >= 3) {
        const cells: [number, number][] = []
        for (let i = s; i < r; i++) cells.push([i, c])
        out.push({ cells, length: r - s })
      }
      s = r
    }
  }
  return out
}

function groupScore(len: number): number {
  if (len === 3) return len * 10
  if (len === 4) return len * 20
  if (len === 5) return len * 40
  return len * 60
}

export function findMatches(board: Board): MatchResult {
  const rows = board.length
  const cols = board[0].length
  const runs = [...horizontalRuns(board, rows, cols), ...verticalRuns(board, rows, cols)]
  if (runs.length === 0) return { groups: [], allCells: [], score: 0 }

  const merged: MatchGroup[] = []
  const used = new Array(runs.length).fill(false)

  for (let i = 0; i < runs.length; i++) {
    if (used[i]) continue
    used[i] = true
    const cellSet = new Set(runs[i].cells.map(([r, c]) => `${r},${c}`))
    let changed = true
    while (changed) {
      changed = false
      for (let j = 0; j < runs.length; j++) {
        if (used[j]) continue
        const overlap = runs[j].cells.some(([r, c]) => cellSet.has(`${r},${c}`))
        if (overlap) {
          used[j] = true
          for (const [r, c] of runs[j].cells) cellSet.add(`${r},${c}`)
          changed = true
        }
      }
    }
    const cells: [number, number][] = Array.from(cellSet).map(k => {
      const [r, c] = k.split(',').map(Number)
      return [r, c] as [number, number]
    })
    merged.push({ cells, length: cells.length })
  }

  let score = 0
  const allCells: [number, number][] = []
  for (const g of merged) {
    score += groupScore(g.length)
    for (const cell of g.cells) allCells.push(cell)
  }
  return { groups: merged, allCells, score }
}

export function hasAnyMove(board: Board): boolean {
  const rows = board.length
  const cols = board[0].length
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols) {
        const b = board.map(row => [...row])
        const t = b[r][c]; b[r][c] = b[r][c + 1]; b[r][c + 1] = t
        if (findMatches(b as Board).allCells.length > 0) return true
      }
      if (r + 1 < rows) {
        const b = board.map(row => [...row])
        const t = b[r][c]; b[r][c] = b[r + 1][c]; b[r + 1][c] = t
        if (findMatches(b as Board).allCells.length > 0) return true
      }
    }
  }
  return false
}