import type { PlayerColor, Piece, PieceState } from './types'
import { HANGAR, GOAL_PROGRESS, PLAYER_ORDER } from './types'

export const TRACK_SIZE = 52
export const HOME_SIZE = 6

export const START_OFFSET: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
}

const TRACK_COORDS: [number, number][] = [
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],[6,0],[6,1],[6,2],[6,3],[6,4],
  [6,5],[5,6],[4,6],[3,6],[2,6],[1,6],
  [0,6],[0,7],[0,8],[1,8],[2,8],[3,8],
  [4,8],[5,8],[6,9],[6,10],[6,11],[6,12],
  [6,13],[6,14],[7,14],[8,14],[8,13],[8,12],
  [8,11],[8,10],[8,9],[9,8],[10,8],[11,8],
  [12,8],[13,8],[14,8],[14,7],
]

const HOME_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
  green: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  yellow: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  blue: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
}

const GOAL_COORD: [number, number] = [7, 7]

const HANGAR_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [[10,1],[10,3],[12,1],[12,3]],
  green: [[2,1],[2,3],[4,1],[4,3]],
  yellow: [[2,10],[2,12],[4,10],[4,12]],
  blue: [[10,10],[10,12],[12,10],[12,12]],
}

export function getPieceCoord(piece: Piece): [number, number] {
  if (piece.progress === HANGAR) {
    return HANGAR_COORDS[piece.color][piece.id]
  }
  if (piece.progress >= 0 && piece.progress <= 51) {
    const trackIdx = (START_OFFSET[piece.color] + piece.progress) % TRACK_SIZE
    return TRACK_COORDS[trackIdx]
  }
  if (piece.progress >= 52 && piece.progress < GOAL_PROGRESS) {
    const homeIdx = piece.progress - 52
    return HOME_COORDS[piece.color][homeIdx]
  }
  return GOAL_COORD
}

export function getTrackCoord(index: number): [number, number] {
  return TRACK_COORDS[index]
}

export function getHomeCoord(color: PlayerColor, index: number): [number, number] {
  return HOME_COORDS[color][index]
}

export function getHangarCoord(color: PlayerColor, pieceId: number): [number, number] {
  return HANGAR_COORDS[color][pieceId]
}

export function getGoalCoord(): [number, number] {
  return GOAL_COORD
}

export function getProgressTrackIndex(color: PlayerColor, progress: number): number {
  if (progress >= 0 && progress <= 51) {
    return (START_OFFSET[color] + progress) % TRACK_SIZE
  }
  return -1
}

export function createInitialPieces(): Piece[] {
  const pieces: Piece[] = []
  for (const color of PLAYER_ORDER) {
    for (let i = 0; i < 4; i++) {
      pieces.push({ color, progress: HANGAR as PieceState, id: i })
    }
  }
  return pieces
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function getValidMoves(pieces: Piece[], color: PlayerColor, dice: number): Piece[] {
  return pieces.filter(p => {
    if (p.color !== color) return false
    if (p.progress === GOAL_PROGRESS) return false
    if (p.progress === HANGAR) return dice === 6
    const newProgress = p.progress + dice
    if (newProgress > GOAL_PROGRESS) return false
    return true
  })
}

export function applyMove(pieces: Piece[], piece: Piece, dice: number): Piece[] {
  const newPieces = pieces.map(p => {
    if (p.color === piece.color && p.id === piece.id) {
      if (p.progress === HANGAR) {
        return { ...p, progress: 0 as PieceState }
      }
      let newProg = p.progress + dice
      if (newProg > GOAL_PROGRESS) newProg = p.progress
      return { ...p, progress: newProg as PieceState }
    }
    return p
  })

  const movedPiece = newPieces.find(p => p.color === piece.color && p.id === piece.id)!
  if (movedPiece.progress >= 0 && movedPiece.progress <= 51) {
    const trackIdx = getProgressTrackIndex(movedPiece.color, movedPiece.progress)
    for (const other of newPieces) {
      if (other.color !== movedPiece.color && other.progress >= 0 && other.progress <= 51) {
        const otherTrackIdx = getProgressTrackIndex(other.color, other.progress)
        if (otherTrackIdx === trackIdx) {
          const idx = newPieces.indexOf(other)
          newPieces[idx] = { ...other, progress: HANGAR as PieceState }
        }
      }
    }
  }

  return newPieces
}

export function checkWin(pieces: Piece[], color: PlayerColor): boolean {
  return pieces.filter(p => p.color === color).every(p => p.progress === GOAL_PROGRESS)
}

export function hasAllHome(pieces: Piece[], color: PlayerColor): number {
  return pieces.filter(p => p.color === color && p.progress === GOAL_PROGRESS).length
}

export function nextPlayer(current: PlayerColor): PlayerColor {
  const idx = PLAYER_ORDER.indexOf(current)
  return PLAYER_ORDER[(idx + 1) % 4]
}

export const CELL_COLOR_MAP: Record<number, PlayerColor | null> = {}
for (const color of PLAYER_ORDER) {
  const start = START_OFFSET[color]
  CELL_COLOR_MAP[start] = color
  CELL_COLOR_MAP[(start + 4) % TRACK_SIZE] = color
}

export function getTrackCellColor(trackIdx: number): PlayerColor | null {
  return CELL_COLOR_MAP[trackIdx] ?? null
}