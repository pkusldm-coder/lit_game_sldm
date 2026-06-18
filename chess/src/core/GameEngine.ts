import type { Board, Move, Player } from './types'
import { ROWS, COLS, RED_PALACE, BLACK_PALACE, PIECE_ORDER } from './types'

function inBoard(r: number, c: number): boolean {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS
}

function inPalace(r: number, c: number, player: Player): boolean {
  const p = player === 'red' ? RED_PALACE : BLACK_PALACE
  return r >= p.rMin && r <= p.rMax && c >= p.cMin && c <= p.cMax
}

function isOwnSide(r: number, player: Player): boolean {
  return player === 'red' ? r >= 5 : r <= 4
}

export function getMoves(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c]
  if (!piece) return []
  const moves: Move[] = []
  const add = (tr: number, tc: number) => {
    const target = board[tr][tc]
    if (!target || target.player !== piece.player) moves.push({ fromRow: r, fromCol: c, toRow: tr, toCol: tc })
  }

  switch (piece.type) {
    case 'king': {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = r + dr, nc = c + dc
        if (inBoard(nr, nc) && inPalace(nr, nc, piece.player)) add(nr, nc)
      }
      const frStep = piece.player === 'red' ? -1 : 1
      for (let kr = r + frStep; inBoard(kr, c); kr += frStep) {
        const k = board[kr][c]
        if (k) {
          if (k.type === 'king') add(kr, c)
          break
        }
      }
      break
    }
    case 'advisor': {
      for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nr = r + dr, nc = c + dc
        if (inPalace(nr, nc, piece.player)) add(nr, nc)
      }
      break
    }
    case 'bishop': {
      for (const [dr, dc] of [[2,2],[2,-2],[-2,2],[-2,-2]]) {
        const nr = r + dr, nc = c + dc
        const er = r + dr / 2, ec = c + dc / 2
        if (inBoard(nr, nc) && isOwnSide(nr, piece.player) && !board[er][ec]) add(nr, nc)
      }
      break
    }
    case 'knight': {
      for (const [dr, dc, lr, lc] of [[-2,-1,-1,0],[-2,1,-1,0],[2,-1,1,0],[2,1,1,0],[-1,-2,0,-1],[-1,2,0,1],[1,-2,0,-1],[1,2,0,1]]) {
        const nr = r + dr, nc = c + dc
        if (inBoard(nr, nc) && !board[r + lr][c + lc]) add(nr, nc)
      }
      break
    }
    case 'rook': {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        let nr = r + dr, nc = c + dc
        while (inBoard(nr, nc)) {
          const t = board[nr][nc]
          if (t) {
            if (t.player !== piece.player) add(nr, nc)
            break
          }
          add(nr, nc)
          nr += dr; nc += dc
        }
      }
      break
    }
    case 'cannon': {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        let nr = r + dr, nc = c + dc
        let jumped = false
        while (inBoard(nr, nc)) {
          const t = board[nr][nc]
          if (!jumped) {
            if (t) { jumped = true }
            else add(nr, nc)
          } else {
            if (t) {
              if (t.player !== piece.player) add(nr, nc)
              break
            }
          }
          nr += dr; nc += dc
        }
      }
      break
    }
    case 'pawn': {
      const forward = piece.player === 'red' ? -1 : 1
      const crossed = !isOwnSide(r, piece.player)
      if (inBoard(r + forward, c)) add(r + forward, c)
      if (crossed) {
        if (inBoard(r, c - 1)) add(r, c - 1)
        if (inBoard(r, c + 1)) add(r, c + 1)
      }
      break
    }
  }

  return moves.filter(m => {
    const nb = applyMove(board, m)
    return !isInCheck(nb, piece.player)
  })
}

export function applyMove(board: Board, move: Move): Board {
  const nb = board.map(row => [...row])
  nb[move.toRow][move.toCol] = nb[move.fromRow][move.fromCol]
  nb[move.fromRow][move.fromCol] = null
  return nb
}

export function isInCheck(board: Board, player: Player): boolean {
  let kingR = -1, kingC = -1
  for (let r = 0; r < ROWS && kingR < 0; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.type === 'king' && p.player === player) { kingR = r; kingC = c; break }
    }
  }
  if (kingR < 0) return true

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (!p || p.player === player) continue
      const moves = getRawMoves(board, r, c)
      if (moves.some(m => m.toRow === kingR && m.toCol === kingC)) return true
    }
  }
  return false
}

function getRawMoves(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c]
  if (!piece) return []
  const moves: Move[] = []
  const add = (tr: number, tc: number) => {
    const target = board[tr][tc]
    if (!target || target.player !== piece.player) moves.push({ fromRow: r, fromCol: c, toRow: tr, toCol: tc })
  }

  switch (piece.type) {
    case 'king': {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = r + dr, nc = c + dc
        if (inBoard(nr, nc) && inPalace(nr, nc, piece.player)) add(nr, nc)
      }
      break
    }
    case 'advisor': {
      for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nr = r + dr, nc = c + dc
        if (inPalace(nr, nc, piece.player)) add(nr, nc)
      }
      break
    }
    case 'bishop': {
      for (const [dr, dc] of [[2,2],[2,-2],[-2,2],[-2,-2]]) {
        const nr = r + dr, nc = c + dc
        const er = r + dr / 2, ec = c + dc / 2
        if (inBoard(nr, nc) && isOwnSide(nr, piece.player) && !board[er][ec]) add(nr, nc)
      }
      break
    }
    case 'knight': {
      for (const [dr, dc, lr, lc] of [[-2,-1,-1,0],[-2,1,-1,0],[2,-1,1,0],[2,1,1,0],[-1,-2,0,-1],[-1,2,0,1],[1,-2,0,-1],[1,2,0,1]]) {
        const nr = r + dr, nc = c + dc
        if (inBoard(nr, nc) && !board[r + lr][c + lc]) add(nr, nc)
      }
      break
    }
    case 'rook': {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        let nr = r + dr, nc = c + dc
        while (inBoard(nr, nc)) {
          const t = board[nr][nc]
          if (t) { if (t.player !== piece.player) add(nr, nc); break }
          add(nr, nc)
          nr += dr; nc += dc
        }
      }
      break
    }
    case 'cannon': {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        let nr = r + dr, nc = c + dc
        let jumped = false
        while (inBoard(nr, nc)) {
          const t = board[nr][nc]
          if (!jumped) {
            if (t) jumped = true
            else add(nr, nc)
          } else {
            if (t) { if (t.player !== piece.player) add(nr, nc); break }
          }
          nr += dr; nc += dc
        }
      }
      break
    }
    case 'pawn': {
      const forward = piece.player === 'red' ? -1 : 1
      const crossed = !isOwnSide(r, piece.player)
      if (inBoard(r + forward, c)) add(r + forward, c)
      if (crossed) {
        if (inBoard(r, c - 1)) add(r, c - 1)
        if (inBoard(r, c + 1)) add(r, c + 1)
      }
      break
    }
  }
  return moves
}

export function hasAnyMove(board: Board, player: Player): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.player === player) {
        if (getMoves(board, r, c).length > 0) return true
      }
    }
  }
  return false
}

export function isCheckmate(board: Board, player: Player): boolean {
  return isInCheck(board, player) && !hasAnyMove(board, player)
}

export function isStalemate(board: Board, player: Player): boolean {
  return !isInCheck(board, player) && !hasAnyMove(board, player)
}

export function getAllMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.player === player) moves.push(...getMoves(board, r, c))
    }
  }
  return moves
}

export function nextPlayer(current: Player): Player {
  return current === 'red' ? 'black' : 'red'
}

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  const placeRow = (player: Player, row: number) => {
    for (let c = 0; c < COLS; c++) {
      board[row][c] = { type: PIECE_ORDER[c], player }
    }
  }

  placeRow('black', 0)
  board[2][1] = { type: 'cannon', player: 'black' }
  board[2][7] = { type: 'cannon', player: 'black' }
  for (let c = 0; c < 9; c += 2) board[3][c] = { type: 'pawn', player: 'black' }

  placeRow('red', 9)
  board[7][1] = { type: 'cannon', player: 'red' }
  board[7][7] = { type: 'cannon', player: 'red' }
  for (let c = 0; c < 9; c += 2) board[6][c] = { type: 'pawn', player: 'red' }

  return board
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => cell ? { ...cell } : null))
}
