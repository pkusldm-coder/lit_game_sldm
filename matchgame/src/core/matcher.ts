import type { Board } from './types'

export interface MatchResult {
  matches: [number, number][]
  score: number
}

function markMatches(board: Board, rows: number, cols: number): Set<string> {
  const marked = new Set<string>()

  for (let r = 0; r < rows; r++) {
    let start = 0
    for (let c = 1; c <= cols; c++) {
      if (c < cols && board[r][c] && board[r][start] &&
          board[r][c]!.type === board[r][start]!.type) {
        continue
      }
      const len = c - start
      if (len >= 3) {
        for (let i = start; i < c; i++) {
          marked.add(`${r},${i}`)
        }
      }
      start = c
    }
  }

  for (let c = 0; c < cols; c++) {
    let start = 0
    for (let r = 1; r <= rows; r++) {
      if (r < rows && board[r][c] && board[start][c] &&
          board[r][c]!.type === board[start][c]!.type) {
        continue
      }
      const len = r - start
      if (len >= 3) {
        for (let i = start; i < r; i++) {
          marked.add(`${i},${c}`)
        }
      }
      start = r
    }
  }

  return marked
}

export function findMatches(board: Board): MatchResult {
  const rows = board.length
  const cols = board[0].length
  const marked = markMatches(board, rows, cols)
  const matches: [number, number][] = []
  let score = 0

  for (const key of marked) {
    const [r, c] = key.split(',').map(Number)
    matches.push([r, c])

    const type = board[r][c]?.type

    const rowTiles = []
    for (let cc = 0; cc < cols; cc++) {
      if (board[r][cc]?.type === type && marked.has(`${r},${cc}`)) {
        rowTiles.push({ r, c: cc })
      }
    }
    for (let rr = 0; rr < rows; rr++) {
      if (board[rr][c]?.type === type && marked.has(`${rr},${c}`)) {
        if (rr !== r) rowTiles.push({ r: rr, c })
      }
    }

    const count = rowTiles.length
    if (count === 3) score += 30
    else if (count === 4) score += 60
    else if (count >= 5) score += 100
  }

  return { matches, score }
}

export function hasAnyMove(board: Board): boolean {
  const rows = board.length
  const cols = board[0].length

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols) {
        const swapped = board.map(row => [...row])
        const temp = swapped[r][c]
        swapped[r][c] = swapped[r][c + 1]
        swapped[r][c + 1] = temp
        if (markMatches(swapped as Board, rows, cols).size > 0) return true
      }
      if (r + 1 < rows) {
        const swapped = board.map(row => [...row])
        const temp = swapped[r][c]
        swapped[r][c] = swapped[r + 1][c]
        swapped[r + 1][c] = temp
        if (markMatches(swapped as Board, rows, cols).size > 0) return true
      }
    }
  }
  return false
}
