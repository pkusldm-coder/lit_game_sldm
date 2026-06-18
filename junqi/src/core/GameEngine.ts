import type { Board, Player, PieceType, Piece, Move, GameMode } from './types'
import { ROWS, COLS, RANK, isRailroad, isBunker } from './types'

export function createInitialPieces(player: Player): [PieceType, number, number][] {
  const placements: [PieceType, number, number][] = []
  const backRow = player === 'blue' ? 0 : 11

  const backPieces: PieceType[] = ['flag', 'sergeant', 'major', 'sergeant', 'mine']
  for (let c = 0; c < COLS; c++) placements.push([backPieces[c], backRow, c])

  const row1 = player === 'blue' ? 1 : 10
  placements.push(['majorGeneral', row1, 0], ['colonel', row1, 2], ['majorGeneral', row1, 4])

  const row2 = player === 'blue' ? 2 : 9
  placements.push(['general', row2, 0], ['captain', row2, 1], ['engineer', row2, 2], ['captain', row2, 3], ['commander', row2, 4])

  const row3 = player === 'blue' ? 3 : 8
  placements.push(['colonel', row3, 0], ['lieutenant', row3, 1], ['bomb', row3, 2], ['lieutenant', row3, 3], ['major', row3, 4])

  const row4 = player === 'blue' ? 4 : 7
  placements.push(['major', row4, 0], ['sergeant', row4, 2])

  const row5 = player === 'blue' ? 5 : 6
  placements.push(['engineer', row5, 0], ['bomb', row5, 1], ['mine', row5, 2], ['lieutenant', row5, 3], ['engineer', row5, 4])

  return placements
}

export function createBoard(gameMode: GameMode): Board {
  const board: Board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  const placeShuffled = (player: Player) => {
    const isBlue = player === 'blue'
    const types = createInitialPieces(player).map(([t]) => t)

    // split out flag so we can ensure it's not in the front row
    const flagIdx = types.indexOf('flag')
    const flagType = types.splice(flagIdx, 1)[0]

    const shuffled = shufflePieces(types)
    const rows = isBlue ? [0,1,2,3,4,5] : [6,7,8,9,10,11]

    const cells: [number, number][] = []
    for (const r of rows)
      for (let c = 0; c < COLS; c++)
        if (!((r === 5 && c === 2) || (r === 6 && c === 2)))
          cells.push([r, c])

    const shuffledCells = shufflePieces(cells)

    // place 24 non-flag pieces
    for (let i = 0; i < shuffled.length; i++) {
      const [r, c] = shuffledCells[i]
      board[r][c] = { type: shuffled[i], player, rank: RANK[shuffled[i]], revealed: false }
    }

    // place flag in remaining cell, NOT in front row (row 5 for blue, row 6 for red)
    const frontRow = isBlue ? 5 : 6
    for (let i = shuffled.length; i < shuffledCells.length; i++) {
      const [r, c] = shuffledCells[i]
      if (r !== frontRow && board[r][c] === null) {
        board[r][c] = { type: flagType, player, rank: RANK[flagType], revealed: false }
        return
      }
    }
    // fallback: any remaining null cell
    for (const [r, c] of shuffledCells)
      if (board[r][c] === null)
        { board[r][c] = { type: flagType, player, rank: RANK[flagType], revealed: false }; return }
  }

  placeShuffled('blue')
  placeShuffled('red')

  if (gameMode === 'flip') {
    // only reveal the four corner cells
    for (const [r, c] of [[0,0],[0,4],[11,0],[11,4]] as [number, number][]) {
      const p = board[r][c]
      if (p) p.revealed = true
    }
  }

  return board
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => cell ? { ...cell } : null))
}

function getRailroadMoves(board: Board, r: number, c: number): Move[] {
  const moves: Move[] = []
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    let nr = r + dr, nc = c + dc
    while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && isRailroad(nr, nc)) {
      const t = board[nr][nc]
      if (t) {
        if (t.player !== board[r][c]!.player && !isBunker(nr, nc))
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc })
        break
      }
      moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc })
      nr += dr; nc += dc
    }
  }
  return moves
}

export function getMoves(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c]
  if (!piece) return []
  if (piece.type === 'mine' || piece.type === 'flag') return []

  const moves: Move[] = []
  const add = (tr: number, tc: number) => {
    const t = board[tr][tc]
    if (!t || (t.player !== piece.player && !isBunker(tr, tc)))
      moves.push({ fromRow: r, fromCol: c, toRow: tr, toCol: tc })
  }

  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const nr = r + dr, nc = c + dc
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) add(nr, nc)
  }

  if (isRailroad(r, c)) {
    moves.push(...getRailroadMoves(board, r, c))
  }

  return moves
}

export function resolveCapture(attacker: Piece, defender: Piece): 'attackerWin' | 'defenderWin' | 'bothDie' {
  const aRank = RANK[attacker.type]
  const dRank = RANK[defender.type]
  if (attacker.type === 'bomb') return 'bothDie'
  if (defender.type === 'bomb') return 'bothDie'
  if (defender.type === 'mine') return attacker.type === 'engineer' ? 'attackerWin' : 'defenderWin'
  if (aRank > dRank) return 'attackerWin'
  if (aRank < dRank) return 'defenderWin'
  console.warn('[resolveCapture] bothDie:', attacker.type, aRank, 'vs', defender.type, dRank, 'attacker rank field:', attacker.rank, 'defender rank field:', defender.rank)
  return 'bothDie'
}

export function applyMove(board: Board, move: Move): Board {
  const nb = cloneBoard(board)
  const attacker = nb[move.fromRow][move.fromCol]
  const defender = nb[move.toRow][move.toCol]

  if (!attacker) return nb

  if (!defender) {
    nb[move.toRow][move.toCol] = attacker
    nb[move.fromRow][move.fromCol] = null
    return nb
  }

  const result = resolveCapture(attacker, defender)
  if (result === 'attackerWin') {
    nb[move.toRow][move.toCol] = attacker
    nb[move.fromRow][move.fromCol] = null
  } else if (result === 'defenderWin') {
    nb[move.fromRow][move.fromCol] = null
  } else {
    nb[move.fromRow][move.fromCol] = null
    nb[move.toRow][move.toCol] = null
  }

  return nb
}

export function hasAnyMove(board: Board, player: Player): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.player === player && getMoves(board, r, c).length > 0) return true
    }
  }
  return false
}

export function checkWin(board: Board, player: Player): Player | null {
  const opp: Player = player === 'red' ? 'blue' : 'red'

  const oppFlagExists = board.some(row =>
    row.some(cell => cell && cell.type === 'flag' && cell.player === opp)
  )

  if (!oppFlagExists) return player
  if (!hasAnyMove(board, opp)) return player

  return null
}

export function nextPlayer(current: Player): Player {
  return current === 'red' ? 'blue' : 'red'
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

export function shufflePieces<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createBoardFlip(): Board {
  const board: Board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  const validCells: [number, number][] = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!((r === 5 && c === 2) || (r === 6 && c === 2)))
        validCells.push([r, c])

  const shuffledCells = shufflePieces(validCells)

  const bluePieces = createInitialPieces('blue').map(([t]) => t)
  const redPieces = createInitialPieces('red').map(([t]) => t)

  const flagTypes = { blue: bluePieces.splice(bluePieces.indexOf('flag'), 1)[0],
                      red:  redPieces.splice(redPieces.indexOf('flag'), 1)[0] }

  const allPieces: { type: PieceType; player: Player }[] = [
    ...shufflePieces(bluePieces).map(t => ({ type: t, player: 'blue' as Player })),
    ...shufflePieces(redPieces).map(t => ({ type: t, player: 'red' as Player })),
  ]

  let ci = 0
  for (const piece of allPieces) {
    const [r, c] = shuffledCells[ci++]
    board[r][c] = { type: piece.type, player: piece.player, rank: RANK[piece.type], revealed: false }
  }

  const placed = new Set<number>()
  const placeFlag = (side: 'blue' | 'red') => {
    const type = flagTypes[side]
    for (let i = ci; i < shuffledCells.length; i++) {
      if (placed.has(i)) continue
      const [r, c] = shuffledCells[i]
      const ok = side === 'blue' ? r !== 5 : r !== 6
      if (ok && board[r][c] === null) {
        board[r][c] = { type, player: side, rank: RANK[type], revealed: false }
        placed.add(i)
        return
      }
    }
    // fallback: any remaining empty cell
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (board[r][c] === null)
          board[r][c] = { type, player: side, rank: RANK[type], revealed: false }
  }
  placeFlag('blue')
  placeFlag('red')

  // reveal board-edge pieces
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && (r === 0 || r === 11 || c === 0 || c === 4 || (r === 5 && c === 2) || (r === 6 && c === 2)))
        p.revealed = true
    }

  return board
}
