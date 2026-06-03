import { useReducer, useCallback, useEffect } from 'react'
import type { Direction, Difficulty, GameState, TileData } from '../core/types'
import { DIFFICULTY_CONFIG, ERASER_MAX } from '../core/config'
import {
  createEmptyBoard,
  spawnTileWithId,
  moveWithTracking,
  isGameOver,
  eraseTile as engineErase,
} from '../core/GameEngine'
import { saveGameState, loadGameState } from '../utils/storage'

type IdGrid = (number | null)[][]

type Action =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'NEW_GAME'; difficulty?: Difficulty }
  | { type: 'ERASE_TILE'; row: number; col: number }
  | { type: 'SET_ERASE_MODE'; value: boolean }

function buildTilesFromIdGrid(grid: number[][], idGrid: IdGrid): TileData[] {
  const tiles: TileData[] = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== 0 && idGrid[r][c] !== null) {
        tiles.push({ id: idGrid[r][c]!, value: grid[r][c], row: r, col: c })
      }
    }
  }
  return tiles
}

function initGame(difficulty: Difficulty): GameState & { idGrid: IdGrid } {
  const config = DIFFICULTY_CONFIG[difficulty]
  let grid = createEmptyBoard(config.gridSize)
  const size = config.gridSize
  let idGrid: IdGrid = Array.from({ length: size }, () => Array(size).fill(null))
  let nextId = 0

  for (let i = 0; i < config.initialTileCount; i++) {
    const result = spawnTileWithId(grid, idGrid, Math.random, config, nextId)
    grid = result.grid
    idGrid = result.idGrid
    nextId = result.newTileId + 1
  }

  return {
    grid,
    score: 0,
    difficulty,
    eraserRemaining: ERASER_MAX,
    gameOver: false,
    tiles: buildTilesFromIdGrid(grid, idGrid),
    isEraseMode: false,
    idGrid,
    nextId,
  }
}

function migrateState(state: GameState): GameState {
  if (state.idGrid && state.nextId !== undefined) return state
  const size = state.grid.length
  const idGrid: IdGrid = Array.from({ length: size }, () => Array(size).fill(null))
  let nextId = 0
  for (const t of state.tiles) {
    idGrid[t.row][t.col] = t.id
    if (t.id >= nextId) nextId = t.id + 1
  }
  return { ...state, idGrid, nextId }
}

export function useGame() {
  const buildInitialState = useCallback(() => {
    const saved = loadGameState()
    if (saved) {
      return migrateState(saved)
    }
    return initGame('normal')
  }, [])

  const [state, dispatch] = useReducer(
    (prev: GameState, action: Action): GameState => {
      switch (action.type) {
        case 'MOVE': {
          if (prev.gameOver || prev.isEraseMode) return prev
          const config = DIFFICULTY_CONFIG[prev.difficulty]
          const moveResult = moveWithTracking(prev.grid, prev.idGrid, action.direction)
          if (!moveResult.moved) return prev

          const spawnResult = spawnTileWithId(moveResult.grid, moveResult.idGrid, Math.random, config, prev.nextId)
          const newGrid = spawnResult.grid
          const newIdGrid = spawnResult.idGrid
          const newNextId = spawnResult.newTileId + 1

          const over = isGameOver(newGrid)
          const tiles = buildTilesFromIdGrid(newGrid, newIdGrid)
          const newTile = tiles.find(t => t.id === spawnResult.newTileId)
          if (newTile) newTile.isNew = true

          const mergedIds = new Set<number>()
          const mergedResultIds = new Set<number>()
          for (const m of moveResult.movements) {
            if (m.newValue) {
              mergedIds.add(m.id)
              mergedResultIds.add(m.id)
            }
          }
          for (const t of tiles) {
            if (mergedResultIds.has(t.id)) t.isMerged = true
          }

          return {
            ...prev,
            grid: newGrid,
            score: prev.score + moveResult.scoreGain,
            gameOver: over,
            tiles,
            isEraseMode: false,
            idGrid: newIdGrid,
            nextId: newNextId,
          }
        }
        case 'NEW_GAME': {
          const diff = action.difficulty ?? prev.difficulty
          return initGame(diff)
        }
        case 'ERASE_TILE': {
          if (prev.eraserRemaining <= 0 || prev.gameOver) return prev
          const newGrid = engineErase(prev.grid, action.row, action.col)
          const newIdGrid = prev.idGrid.map(row => [...row])
          newIdGrid[action.row][action.col] = null
          return {
            ...prev,
            grid: newGrid,
            eraserRemaining: prev.eraserRemaining - 1,
            isEraseMode: false,
            tiles: buildTilesFromIdGrid(newGrid, newIdGrid),
            idGrid: newIdGrid,
            nextId: prev.nextId,
          }
        }
        case 'SET_ERASE_MODE': {
          if (prev.eraserRemaining <= 0) return prev
          return { ...prev, isEraseMode: action.value }
        }
      }
    },
    undefined,
    buildInitialState,
  )

  const newGame = useCallback((difficulty?: Difficulty) => {
    dispatch({ type: 'NEW_GAME', difficulty })
  }, [])

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'NEW_GAME', difficulty })
  }, [])

  const eraseTile = useCallback((row: number, col: number) => {
    dispatch({ type: 'ERASE_TILE', row, col })
  }, [])

  const activateErase = useCallback(() => {
    dispatch({ type: 'SET_ERASE_MODE', value: true })
  }, [])

  const exitEraseMode = useCallback(() => {
    dispatch({ type: 'SET_ERASE_MODE', value: false })
  }, [])

  const move = useCallback((direction: Direction) => {
    dispatch({ type: 'MOVE', direction })
  }, [])

  useEffect(() => {
    saveGameState(state)
  }, [state])

  return { state, move, newGame, eraseTile, setDifficulty, activateErase, exitEraseMode }
}